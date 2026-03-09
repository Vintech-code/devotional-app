/**
 * src/services/bibleService.ts
 *
 * Offline-first Bible service backed by bible.helloao.org (HelloAO).
 *
 * Books & chapter metadata
 *   Served from the hardcoded BIBLE_BOOKS constant — instant, no network.
 *
 * Verses (cache-first strategy, per translation)
 *   1. Query the local SQLite verse_cache table for (translation, book_id, chapter).
 *   2. On a cache miss, fetch the chapter from bible.helloao.org.
 *   3. Persist every verse into the cache inside a single transaction.
 *   4. Return the data.
 *
 * Offline download
 *   `downloadTranslation()` bulk-fetches ALL 1189 chapters (66 books) and
 *   stores them in SQLite so the entire Bible is available without internet.
 *   Progress is reported via an optional callback (0–100).
 *   Completed translations are recorded in the `downloaded_translations` table.
 *
 * Each translation is cached independently.
 */

import { BIBLE_BOOKS, getBookById } from '../data/bibleBooks';
import { DEFAULT_TRANSLATION_ID } from '../data/bibleTranslations';
import { getDatabase } from '../database/initDatabase';
import type { BibleBook, BibleVerse, ChapterSummary } from '../types/bible';

const API_BASE = 'https://bible.helloao.org/api';

const HELLOAO_ID_MAP: Record<string, string> = {
  'kjv':        'eng_kjv',
  'web':        'eng_web',
  'asv':        'eng_asv',
  'bbe':        'eng_bbe',
  'darby':      'eng_dby',
  'dra':        'eng_dra',
  'ylt':        'eng_ylt',
  'webbe':      'eng_weu',
  'clementine': 'lat_clv',
  'bkr':        'ces_bkr',
  'cuv':        'cmn_cuv',
 
};

function getHelloaoTranslationId(translationId: string): string {
  return HELLOAO_ID_MAP[translationId] ?? translationId;
}

// Total chapters in the complete Protestant canon (66 books)
const TOTAL_CHAPTERS = BIBLE_BOOKS.reduce((sum, b) => sum + b.chapters, 0);

// ── HelloAO response shapes ───────────────────────────────────────────────────

type HaoContentItem =
  | string
  | { type?: string; text?: string; content?: HaoContentItem[] };

interface HaoVerse {
  type: 'verse';
  number: number;
  content: HaoContentItem[];
}

interface HaoChapterContent {
  type: string;
  number?: number;
  content?: HaoContentItem[];
}

interface HaoChapterResponse {
  chapter: {
    number: number;
    content: HaoChapterContent[];
  };
}

/** Recursively extracts plain text from a HelloAO content item array. */
function extractText(items: HaoContentItem[]): string {
  return items
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item.type === 'note' || item.type === 'footnote') return '';
      if (item.text) return item.text;
      if (Array.isArray(item.content)) return extractText(item.content);
      return '';
    })
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Builds the HelloAO chapter URL for a given translation / book / chapter. */
function chapterUrl(translationId: string, bookHelloaoId: string, chapter: number): string {
  return `${API_BASE}/${getHelloaoTranslationId(translationId)}/${bookHelloaoId}/${chapter}.json`;
}

// ─── Books ────────────────────────────────────────────────────────────────────

/** Returns all 66 books from the hardcoded list (instant, always available). */
export async function getBooks(): Promise<BibleBook[]> {
  return BIBLE_BOOKS.map(({ id, name, testament, chapters }) => ({
    id, name, testament, chapters,
  }));
}

/** Returns a single book by canonical id. */
export async function getBook(bookId: number): Promise<BibleBook | null> {
  const b = getBookById(bookId);
  if (!b) return null;
  return { id: b.id, name: b.name, testament: b.testament, chapters: b.chapters };
}

// ─── Chapters ─────────────────────────────────────────────────────────────────

/**
 * Returns all chapters for a book. Chapters already cached for the given
 * translation show their verse count; others show 0 (will be fetched on demand).
 */
export async function getChapters(
  bookId: number,
  translation = DEFAULT_TRANSLATION_ID,
): Promise<ChapterSummary[]> {
  const book = getBookById(bookId);
  if (!book) return [];

  const db = await getDatabase();
  const cached = await db.getAllAsync<{ chapter: number; cnt: number }>(
    `SELECT chapter, COUNT(*) AS cnt
       FROM verse_cache
      WHERE translation = ? AND book_id = ?
      GROUP BY chapter`,
    [translation, bookId],
  );
  const cacheMap = new Map(cached.map((r) => [r.chapter, r.cnt]));

  return Array.from({ length: book.chapters }, (_, i) => ({
    chapter:    i + 1,
    verseCount: cacheMap.get(i + 1) ?? 0,
  }));
}

// ─── Verses (cache-first, then HelloAO API) ───────────────────────────────────

/**
 * Returns all verses for a book + chapter in the specified translation.
 * Reads from the local cache when available; otherwise fetches from
 * bible.helloao.org, caches the result, and returns it.
 */
export async function getVerses(
  bookId: number,
  chapter: number,
  translation = DEFAULT_TRANSLATION_ID,
): Promise<BibleVerse[]> {
  const db = await getDatabase();

  // 1. Try the local cache first
  const cached = await db.getAllAsync<{ verse: number; text: string }>(
    `SELECT verse, text
       FROM verse_cache
      WHERE translation = ? AND book_id = ? AND chapter = ?
      ORDER BY verse`,
    [translation, bookId, chapter],
  );

  if (cached.length > 0) {
    return cached.map((r, i) => ({
      id: i + 1, book_id: bookId, chapter, verse: r.verse, text: r.text,
    }));
  }

  // 2. Fetch from HelloAO
  const book = getBookById(bookId);
  if (!book) throw new Error(`Unknown book id: ${bookId}`);

  const url = chapterUrl(translation, book.helloaoId, chapter);

  let resp: Response;
  try {
    resp = await fetch(url);
  } catch (e: unknown) {
    const msg = String(e).toLowerCase();
    if (
      msg.includes('network request failed') ||
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('typeerror')
    ) {
      throw new Error('No internet connection. Previously read chapters are available offline.');
    }
    throw new Error('Network error — check your connection.');
  }

  if (resp.status === 404) {
    throw new Error(`${book.name} ${chapter} is not available in the ${translation.toUpperCase()} translation.`);
  }
  if (!resp.ok) {
    throw new Error(`Could not load ${book.name} ${chapter} (server error ${resp.status}).`);
  }

  const data = await resp.json() as HaoChapterResponse;

  if (!data?.chapter?.content) {
    throw new Error(`Unexpected response for ${book.name} ${chapter}.`);
  }

  // 3. Extract verses from HelloAO content array
  const verses: HaoVerse[] = (data.chapter.content as HaoChapterContent[])
    .filter((item): item is HaoVerse => item.type === 'verse' && typeof item.number === 'number');

  if (verses.length === 0) {
    throw new Error(`No verses returned for ${book.name} ${chapter} (${translation.toUpperCase()}).`);
  }

  // 4. Persist to local cache in a single transaction
  await db.withTransactionAsync(async () => {
    for (const v of verses) {
      const text = extractText(v.content ?? []);
      if (text) {
        await db.runAsync(
          `INSERT OR REPLACE INTO verse_cache
             (translation, book_id, chapter, verse, text)
           VALUES (?, ?, ?, ?, ?)`,
          [translation, bookId, chapter, v.number, text],
        );
      }
    }
  });

  return verses.map((v, i) => ({
    id: i + 1,
    book_id: bookId,
    chapter,
    verse:   v.number,
    text:    extractText(v.content ?? []),
  }));
}

/** Returns a single cached verse, or null if not yet downloaded. */
export async function getVerse(
  bookId: number,
  chapter: number,
  verseNumber: number,
  translation = DEFAULT_TRANSLATION_ID,
): Promise<BibleVerse | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ verse: number; text: string }>(
    `SELECT verse, text
       FROM verse_cache
      WHERE translation = ? AND book_id = ? AND chapter = ? AND verse = ?`,
    [translation, bookId, chapter, verseNumber],
  );
  if (!row) return null;
  return { id: 0, book_id: bookId, chapter, verse: row.verse, text: row.text };
}

// ─── Search (within cached content for current translation) ──────────────────

/**
 * Full-text search across locally cached verse text for the active translation.
 * Returns up to 100 results ordered by canonical position.
 */
export async function searchVerses(
  query: string,
  translation = DEFAULT_TRANSLATION_ID,
): Promise<(BibleVerse & { bookName: string })[]> {
  if (!query.trim()) return [];
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    book_id: number; chapter: number; verse: number; text: string;
  }>(
    `SELECT book_id, chapter, verse, text
       FROM verse_cache
      WHERE translation = ? AND text LIKE ?
      ORDER BY book_id, chapter, verse
      LIMIT 100`,
    [translation, `%${query.trim()}%`],
  );
  return rows.map((r, i) => ({
    id: i + 1,
    book_id:  r.book_id,
    chapter:  r.chapter,
    verse:    r.verse,
    text:     r.text,
    bookName: getBookById(r.book_id)?.name ?? `Book ${r.book_id}`,
  }));
}

// ─── Offline download ─────────────────────────────────────────────────────────

export interface DownloadProgress {
  done: number;
  total: number;
  percent: number;
  currentBook: string;
}

/**
 * Downloads every chapter of the given translation and stores it in SQLite.
 * Already-cached chapters are skipped.
 * `onProgress` is called after each chapter completes.
 * Returns the number of chapters newly downloaded (0 if all were already cached).
 *
 * Set `signal.aborted` on the passed AbortSignal to stop mid-download.
 */
export async function downloadTranslation(
  translationId: string,
  onProgress?: (p: DownloadProgress) => void,
  signal?: AbortSignal,
): Promise<number> {
  const db = await getDatabase();

  // Build a flat list of all (bookId, bookHelloaoId, bookName, chapter) tuples
  const tasks: { bookId: number; helloaoId: string; bookName: string; chapter: number }[] = [];
  for (const book of BIBLE_BOOKS) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      tasks.push({ bookId: book.id, helloaoId: book.helloaoId, bookName: book.name, chapter: ch });
    }
  }

  // Skip chapters already in the cache
  const cachedRows = await db.getAllAsync<{ book_id: number; chapter: number }>(
    `SELECT DISTINCT book_id, chapter FROM verse_cache WHERE translation = ?`,
    [translationId],
  );
  const cachedSet = new Set(cachedRows.map((r) => `${r.book_id}:${r.chapter}`));
  const pending = tasks.filter((t) => !cachedSet.has(`${t.bookId}:${t.chapter}`));

  let done = tasks.length - pending.length; // already cached counts as done

  const CONCURRENCY = 5;
  const MAX_RETRIES  = 2;
  let failCount = 0;

  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    if (signal?.aborted) break;

    const batch = pending.slice(i, i + CONCURRENCY);
    let batchFails = 0;
    await Promise.allSettled(
      batch.map(async (task) => {
        if (signal?.aborted) return;
        let saved = false;
        for (let attempt = 0; attempt <= MAX_RETRIES && !saved; attempt++) {
          if (attempt > 0) await new Promise<void>((r) => setTimeout(r, 1000 * attempt));
          try {
            const url = chapterUrl(translationId, task.helloaoId, task.chapter);
            const resp = await fetch(url);
            if (!resp.ok) continue; // retry on server errors
            const data = await resp.json() as HaoChapterResponse;
            const verses: HaoVerse[] = (data?.chapter?.content ?? [])
              .filter((item): item is HaoVerse => item.type === 'verse' && typeof item.number === 'number');

            if (verses.length > 0) {
              await db.withTransactionAsync(async () => {
                for (const v of verses) {
                  const text = extractText(v.content ?? []);
                  if (text) {
                    await db.runAsync(
                      `INSERT OR REPLACE INTO verse_cache
                         (translation, book_id, chapter, verse, text)
                       VALUES (?, ?, ?, ?, ?)`,
                      [translationId, task.bookId, task.chapter, v.number, text],
                    );
                  }
                }
              });
            }
            saved = true;
          } catch {
            // retry on next attempt
          }
        }
        if (!saved) batchFails++;
      }),
    );

    failCount += batchFails;
    done += batch.length - batchFails;
    onProgress?.({
      done,
      total:       TOTAL_CHAPTERS,
      percent:     Math.round((done / TOTAL_CHAPTERS) * 100),
      currentBook: batch[batch.length - 1]?.bookName ?? '',
    });
  }

  // Mark translation as fully downloaded only when every chapter was stored
  if (!signal?.aborted && failCount === 0) {
    await db.runAsync(
      `INSERT OR REPLACE INTO downloaded_translations (translation, downloaded_at)
       VALUES (?, ?)`,
      [translationId, Date.now()],
    );
  }

  return pending.length;
}

/**
 * Returns the cached-chapter count and total chapters for a translation,
 * plus whether it has been marked as fully downloaded.
 */
export async function getTranslationDownloadInfo(translationId: string): Promise<{
  cachedChapters: number;
  totalChapters:  number;
  isComplete:     boolean;
}> {
  const db = await getDatabase();
  const cachedRow = await db.getFirstAsync<{ cnt: number }>(
    `SELECT COUNT(DISTINCT book_id || ':' || chapter) AS cnt
       FROM verse_cache
      WHERE translation = ?`,
    [translationId],
  );
  const completedRow = await db.getFirstAsync<{ translation: string }>(
    `SELECT translation FROM downloaded_translations WHERE translation = ?`,
    [translationId],
  );
  return {
    cachedChapters: cachedRow?.cnt ?? 0,
    totalChapters:  TOTAL_CHAPTERS,
    isComplete:     completedRow !== null,
  };
}

/** Removes all cached verses and the download record for a translation. */
export async function clearTranslationCache(translationId: string): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync(`DELETE FROM verse_cache WHERE translation = ?`, [translationId]);
    await db.runAsync(`DELETE FROM downloaded_translations WHERE translation = ?`, [translationId]);
  });
}
