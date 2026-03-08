/**
 * src/services/bibleService.ts
 *
 * Hybrid online / offline Bible service.
 *
 * Books & chapter metadata
 *   Served from the hardcoded BIBLE_BOOKS constant — instant, no network.
 *
 * Verses (cache-first strategy, per translation)
 *   1. Query the local SQLite verse_cache table for (translation, book_id, chapter).
 *   2. On a cache miss, fetch the full chapter from bible-api.com.
 *   3. Persist every verse into the cache inside a single transaction.
 *   4. Return the data.
 *
 * Each translation is cached independently — switching translations triggers
 * a fresh download for each chapter not yet cached under that translation.
 *
 * Search works within locally cached content for the active translation.
 */

import { BIBLE_BOOKS, getBookById } from '../data/bibleBooks';
import { DEFAULT_TRANSLATION_ID } from '../data/bibleTranslations';
import { getDatabase } from '../database/initDatabase';
import type { BibleBook, BibleVerse, ChapterSummary } from '../types/bible';

const API_BASE = 'https://bible-api.com';

// Shape returned by bible-api.com for each verse
interface ApiVerse {
  book_id: string;
  book:    string;
  chapter: number;
  verse:   number;
  text:    string;
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

// ─── Verses (cache-first, then API) ──────────────────────────────────────────

/**
 * Returns all verses for a book + chapter in the specified translation.
 * Reads from the local cache when available; otherwise fetches from
 * bible-api.com, caches the result, and returns it.
 *
 * Throws on network error or unexpected API response so callers can show
 * a meaningful error state with a retry option.
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

  // 2. Fetch from bible-api.com
  const book = getBookById(bookId);
  if (!book) throw new Error(`Unknown book id: ${bookId}`);

  const url = `${API_BASE}/${book.apiSlug}+${chapter}?translation=${translation}&single_chapter_book_matching=indifferent`;

  let resp: Response;
  try {
    resp = await fetch(url);
  } catch (e: unknown) {
    // Distinguish offline vs other network errors
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

  const data: { verses?: ApiVerse[]; error?: string } = await resp.json();

  // Some translations return a JSON error field instead of 404
  if (data.error) {
    throw new Error(`${book.name} ${chapter} is not available in the ${translation.toUpperCase()} translation.`);
  }

  if (!Array.isArray(data.verses) || data.verses.length === 0) {
    throw new Error(`No verses returned for ${book.name} ${chapter} (${translation.toUpperCase()}). This translation may not include this book.`);
  }

  // 3. Persist to local cache inside one transaction (fast bulk insert)
  await db.withTransactionAsync(async () => {
    for (const v of data.verses!) {
      await db.runAsync(
        `INSERT OR REPLACE INTO verse_cache
           (translation, book_id, chapter, verse, text)
         VALUES (?, ?, ?, ?, ?)`,
        [translation, bookId, chapter, v.verse, v.text.trim()],
      );
    }
  });

  return data.verses.map((v, i) => ({
    id: i + 1, book_id: bookId, chapter, verse: v.verse, text: v.text.trim(),
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
