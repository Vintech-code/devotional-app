/**
 * src/data/bibleBooks.ts
 *
 * Complete canonical list of all 66 Bible books with:
 *  - id          : canonical book number (1–66)
 *  - name        : display name
 *  - apiSlug     : URL-safe slug used in bible-api.com requests
 *                  (spaces → +, e.g. "1+kings", "song+of+solomon")
 *  - testament   : 'OT' | 'NT'
 *  - chapters    : total chapter count
 *
 * No network or database calls are required — this is compile-time data.
 */

export interface BibleBookMeta {
  id: number;
  name: string;
  apiSlug: string;
  testament: 'OT' | 'NT';
  chapters: number;
}

export const BIBLE_BOOKS: BibleBookMeta[] = [
  // ── Old Testament (39 books) ────────────────────────────────────────────────
  { id:  1, name: 'Genesis',          apiSlug: 'genesis',           testament: 'OT', chapters:  50 },
  { id:  2, name: 'Exodus',           apiSlug: 'exodus',            testament: 'OT', chapters:  40 },
  { id:  3, name: 'Leviticus',        apiSlug: 'leviticus',         testament: 'OT', chapters:  27 },
  { id:  4, name: 'Numbers',          apiSlug: 'numbers',           testament: 'OT', chapters:  36 },
  { id:  5, name: 'Deuteronomy',      apiSlug: 'deuteronomy',       testament: 'OT', chapters:  34 },
  { id:  6, name: 'Joshua',           apiSlug: 'joshua',            testament: 'OT', chapters:  24 },
  { id:  7, name: 'Judges',           apiSlug: 'judges',            testament: 'OT', chapters:  21 },
  { id:  8, name: 'Ruth',             apiSlug: 'ruth',              testament: 'OT', chapters:   4 },
  { id:  9, name: '1 Samuel',         apiSlug: '1+samuel',          testament: 'OT', chapters:  31 },
  { id: 10, name: '2 Samuel',         apiSlug: '2+samuel',          testament: 'OT', chapters:  24 },
  { id: 11, name: '1 Kings',          apiSlug: '1+kings',           testament: 'OT', chapters:  22 },
  { id: 12, name: '2 Kings',          apiSlug: '2+kings',           testament: 'OT', chapters:  25 },
  { id: 13, name: '1 Chronicles',     apiSlug: '1+chronicles',      testament: 'OT', chapters:  29 },
  { id: 14, name: '2 Chronicles',     apiSlug: '2+chronicles',      testament: 'OT', chapters:  36 },
  { id: 15, name: 'Ezra',             apiSlug: 'ezra',              testament: 'OT', chapters:  10 },
  { id: 16, name: 'Nehemiah',         apiSlug: 'nehemiah',          testament: 'OT', chapters:  13 },
  { id: 17, name: 'Esther',           apiSlug: 'esther',            testament: 'OT', chapters:  10 },
  { id: 18, name: 'Job',              apiSlug: 'job',               testament: 'OT', chapters:  42 },
  { id: 19, name: 'Psalms',           apiSlug: 'psalms',            testament: 'OT', chapters: 150 },
  { id: 20, name: 'Proverbs',         apiSlug: 'proverbs',          testament: 'OT', chapters:  31 },
  { id: 21, name: 'Ecclesiastes',     apiSlug: 'ecclesiastes',      testament: 'OT', chapters:  12 },
  { id: 22, name: 'Song of Solomon',  apiSlug: 'song+of+solomon',   testament: 'OT', chapters:   8 },
  { id: 23, name: 'Isaiah',           apiSlug: 'isaiah',            testament: 'OT', chapters:  66 },
  { id: 24, name: 'Jeremiah',         apiSlug: 'jeremiah',          testament: 'OT', chapters:  52 },
  { id: 25, name: 'Lamentations',     apiSlug: 'lamentations',      testament: 'OT', chapters:   5 },
  { id: 26, name: 'Ezekiel',          apiSlug: 'ezekiel',           testament: 'OT', chapters:  48 },
  { id: 27, name: 'Daniel',           apiSlug: 'daniel',            testament: 'OT', chapters:  12 },
  { id: 28, name: 'Hosea',            apiSlug: 'hosea',             testament: 'OT', chapters:  14 },
  { id: 29, name: 'Joel',             apiSlug: 'joel',              testament: 'OT', chapters:   3 },
  { id: 30, name: 'Amos',             apiSlug: 'amos',              testament: 'OT', chapters:   9 },
  { id: 31, name: 'Obadiah',          apiSlug: 'obadiah',           testament: 'OT', chapters:   1 },
  { id: 32, name: 'Jonah',            apiSlug: 'jonah',             testament: 'OT', chapters:   4 },
  { id: 33, name: 'Micah',            apiSlug: 'micah',             testament: 'OT', chapters:   7 },
  { id: 34, name: 'Nahum',            apiSlug: 'nahum',             testament: 'OT', chapters:   3 },
  { id: 35, name: 'Habakkuk',         apiSlug: 'habakkuk',          testament: 'OT', chapters:   3 },
  { id: 36, name: 'Zephaniah',        apiSlug: 'zephaniah',         testament: 'OT', chapters:   3 },
  { id: 37, name: 'Haggai',           apiSlug: 'haggai',            testament: 'OT', chapters:   2 },
  { id: 38, name: 'Zechariah',        apiSlug: 'zechariah',         testament: 'OT', chapters:  14 },
  { id: 39, name: 'Malachi',          apiSlug: 'malachi',           testament: 'OT', chapters:   4 },

  // ── New Testament (27 books) ────────────────────────────────────────────────
  { id: 40, name: 'Matthew',          apiSlug: 'matthew',           testament: 'NT', chapters:  28 },
  { id: 41, name: 'Mark',             apiSlug: 'mark',              testament: 'NT', chapters:  16 },
  { id: 42, name: 'Luke',             apiSlug: 'luke',              testament: 'NT', chapters:  24 },
  { id: 43, name: 'John',             apiSlug: 'john',              testament: 'NT', chapters:  21 },
  { id: 44, name: 'Acts',             apiSlug: 'acts',              testament: 'NT', chapters:  28 },
  { id: 45, name: 'Romans',           apiSlug: 'romans',            testament: 'NT', chapters:  16 },
  { id: 46, name: '1 Corinthians',    apiSlug: '1+corinthians',     testament: 'NT', chapters:  16 },
  { id: 47, name: '2 Corinthians',    apiSlug: '2+corinthians',     testament: 'NT', chapters:  13 },
  { id: 48, name: 'Galatians',        apiSlug: 'galatians',         testament: 'NT', chapters:   6 },
  { id: 49, name: 'Ephesians',        apiSlug: 'ephesians',         testament: 'NT', chapters:   6 },
  { id: 50, name: 'Philippians',      apiSlug: 'philippians',       testament: 'NT', chapters:   4 },
  { id: 51, name: 'Colossians',       apiSlug: 'colossians',        testament: 'NT', chapters:   4 },
  { id: 52, name: '1 Thessalonians',  apiSlug: '1+thessalonians',   testament: 'NT', chapters:   5 },
  { id: 53, name: '2 Thessalonians',  apiSlug: '2+thessalonians',   testament: 'NT', chapters:   3 },
  { id: 54, name: '1 Timothy',        apiSlug: '1+timothy',         testament: 'NT', chapters:   6 },
  { id: 55, name: '2 Timothy',        apiSlug: '2+timothy',         testament: 'NT', chapters:   4 },
  { id: 56, name: 'Titus',            apiSlug: 'titus',             testament: 'NT', chapters:   3 },
  { id: 57, name: 'Philemon',         apiSlug: 'philemon',          testament: 'NT', chapters:   1 },
  { id: 58, name: 'Hebrews',          apiSlug: 'hebrews',           testament: 'NT', chapters:  13 },
  { id: 59, name: 'James',            apiSlug: 'james',             testament: 'NT', chapters:   5 },
  { id: 60, name: '1 Peter',          apiSlug: '1+peter',           testament: 'NT', chapters:   5 },
  { id: 61, name: '2 Peter',          apiSlug: '2+peter',           testament: 'NT', chapters:   3 },
  { id: 62, name: '1 John',           apiSlug: '1+john',            testament: 'NT', chapters:   5 },
  { id: 63, name: '2 John',           apiSlug: '2+john',            testament: 'NT', chapters:   1 },
  { id: 64, name: '3 John',           apiSlug: '3+john',            testament: 'NT', chapters:   1 },
  { id: 65, name: 'Jude',             apiSlug: 'jude',              testament: 'NT', chapters:   1 },
  { id: 66, name: 'Revelation',       apiSlug: 'revelation',        testament: 'NT', chapters:  22 },
];

/** O(n) lookup — call site should cache the result when hot. */
export function getBookById(id: number): BibleBookMeta | undefined {
  return BIBLE_BOOKS.find((b) => b.id === id);
}
