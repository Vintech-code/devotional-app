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
  apiSlug: string;   // legacy — kept for reference
  helloaoId: string; // USX/USFM book abbreviation used by bible.helloao.org
  testament: 'OT' | 'NT';
  chapters: number;
}

export const BIBLE_BOOKS: BibleBookMeta[] = [
  // ── Old Testament (39 books) ────────────────────────────────────────────────
  { id:  1, name: 'Genesis',          apiSlug: 'genesis',           helloaoId: 'GEN', testament: 'OT', chapters:  50 },
  { id:  2, name: 'Exodus',           apiSlug: 'exodus',            helloaoId: 'EXO', testament: 'OT', chapters:  40 },
  { id:  3, name: 'Leviticus',        apiSlug: 'leviticus',         helloaoId: 'LEV', testament: 'OT', chapters:  27 },
  { id:  4, name: 'Numbers',          apiSlug: 'numbers',           helloaoId: 'NUM', testament: 'OT', chapters:  36 },
  { id:  5, name: 'Deuteronomy',      apiSlug: 'deuteronomy',       helloaoId: 'DEU', testament: 'OT', chapters:  34 },
  { id:  6, name: 'Joshua',           apiSlug: 'joshua',            helloaoId: 'JOS', testament: 'OT', chapters:  24 },
  { id:  7, name: 'Judges',           apiSlug: 'judges',            helloaoId: 'JDG', testament: 'OT', chapters:  21 },
  { id:  8, name: 'Ruth',             apiSlug: 'ruth',              helloaoId: 'RUT', testament: 'OT', chapters:   4 },
  { id:  9, name: '1 Samuel',         apiSlug: '1+samuel',          helloaoId: '1SA', testament: 'OT', chapters:  31 },
  { id: 10, name: '2 Samuel',         apiSlug: '2+samuel',          helloaoId: '2SA', testament: 'OT', chapters:  24 },
  { id: 11, name: '1 Kings',          apiSlug: '1+kings',           helloaoId: '1KI', testament: 'OT', chapters:  22 },
  { id: 12, name: '2 Kings',          apiSlug: '2+kings',           helloaoId: '2KI', testament: 'OT', chapters:  25 },
  { id: 13, name: '1 Chronicles',     apiSlug: '1+chronicles',      helloaoId: '1CH', testament: 'OT', chapters:  29 },
  { id: 14, name: '2 Chronicles',     apiSlug: '2+chronicles',      helloaoId: '2CH', testament: 'OT', chapters:  36 },
  { id: 15, name: 'Ezra',             apiSlug: 'ezra',              helloaoId: 'EZR', testament: 'OT', chapters:  10 },
  { id: 16, name: 'Nehemiah',         apiSlug: 'nehemiah',          helloaoId: 'NEH', testament: 'OT', chapters:  13 },
  { id: 17, name: 'Esther',           apiSlug: 'esther',            helloaoId: 'EST', testament: 'OT', chapters:  10 },
  { id: 18, name: 'Job',              apiSlug: 'job',               helloaoId: 'JOB', testament: 'OT', chapters:  42 },
  { id: 19, name: 'Psalms',           apiSlug: 'psalms',            helloaoId: 'PSA', testament: 'OT', chapters: 150 },
  { id: 20, name: 'Proverbs',         apiSlug: 'proverbs',          helloaoId: 'PRO', testament: 'OT', chapters:  31 },
  { id: 21, name: 'Ecclesiastes',     apiSlug: 'ecclesiastes',      helloaoId: 'ECC', testament: 'OT', chapters:  12 },
  { id: 22, name: 'Song of Solomon',  apiSlug: 'song+of+solomon',   helloaoId: 'SNG', testament: 'OT', chapters:   8 },
  { id: 23, name: 'Isaiah',           apiSlug: 'isaiah',            helloaoId: 'ISA', testament: 'OT', chapters:  66 },
  { id: 24, name: 'Jeremiah',         apiSlug: 'jeremiah',          helloaoId: 'JER', testament: 'OT', chapters:  52 },
  { id: 25, name: 'Lamentations',     apiSlug: 'lamentations',      helloaoId: 'LAM', testament: 'OT', chapters:   5 },
  { id: 26, name: 'Ezekiel',          apiSlug: 'ezekiel',           helloaoId: 'EZK', testament: 'OT', chapters:  48 },
  { id: 27, name: 'Daniel',           apiSlug: 'daniel',            helloaoId: 'DAN', testament: 'OT', chapters:  12 },
  { id: 28, name: 'Hosea',            apiSlug: 'hosea',             helloaoId: 'HOS', testament: 'OT', chapters:  14 },
  { id: 29, name: 'Joel',             apiSlug: 'joel',              helloaoId: 'JOL', testament: 'OT', chapters:   3 },
  { id: 30, name: 'Amos',             apiSlug: 'amos',              helloaoId: 'AMO', testament: 'OT', chapters:   9 },
  { id: 31, name: 'Obadiah',          apiSlug: 'obadiah',           helloaoId: 'OBA', testament: 'OT', chapters:   1 },
  { id: 32, name: 'Jonah',            apiSlug: 'jonah',             helloaoId: 'JON', testament: 'OT', chapters:   4 },
  { id: 33, name: 'Micah',            apiSlug: 'micah',             helloaoId: 'MIC', testament: 'OT', chapters:   7 },
  { id: 34, name: 'Nahum',            apiSlug: 'nahum',             helloaoId: 'NAM', testament: 'OT', chapters:   3 },
  { id: 35, name: 'Habakkuk',         apiSlug: 'habakkuk',          helloaoId: 'HAB', testament: 'OT', chapters:   3 },
  { id: 36, name: 'Zephaniah',        apiSlug: 'zephaniah',         helloaoId: 'ZEP', testament: 'OT', chapters:   3 },
  { id: 37, name: 'Haggai',           apiSlug: 'haggai',            helloaoId: 'HAG', testament: 'OT', chapters:   2 },
  { id: 38, name: 'Zechariah',        apiSlug: 'zechariah',         helloaoId: 'ZEC', testament: 'OT', chapters:  14 },
  { id: 39, name: 'Malachi',          apiSlug: 'malachi',           helloaoId: 'MAL', testament: 'OT', chapters:   4 },

  // ── New Testament (27 books) ────────────────────────────────────────────────
  { id: 40, name: 'Matthew',          apiSlug: 'matthew',           helloaoId: 'MAT', testament: 'NT', chapters:  28 },
  { id: 41, name: 'Mark',             apiSlug: 'mark',              helloaoId: 'MRK', testament: 'NT', chapters:  16 },
  { id: 42, name: 'Luke',             apiSlug: 'luke',              helloaoId: 'LUK', testament: 'NT', chapters:  24 },
  { id: 43, name: 'John',             apiSlug: 'john',              helloaoId: 'JHN', testament: 'NT', chapters:  21 },
  { id: 44, name: 'Acts',             apiSlug: 'acts',              helloaoId: 'ACT', testament: 'NT', chapters:  28 },
  { id: 45, name: 'Romans',           apiSlug: 'romans',            helloaoId: 'ROM', testament: 'NT', chapters:  16 },
  { id: 46, name: '1 Corinthians',    apiSlug: '1+corinthians',     helloaoId: '1CO', testament: 'NT', chapters:  16 },
  { id: 47, name: '2 Corinthians',    apiSlug: '2+corinthians',     helloaoId: '2CO', testament: 'NT', chapters:  13 },
  { id: 48, name: 'Galatians',        apiSlug: 'galatians',         helloaoId: 'GAL', testament: 'NT', chapters:   6 },
  { id: 49, name: 'Ephesians',        apiSlug: 'ephesians',         helloaoId: 'EPH', testament: 'NT', chapters:   6 },
  { id: 50, name: 'Philippians',      apiSlug: 'philippians',       helloaoId: 'PHP', testament: 'NT', chapters:   4 },
  { id: 51, name: 'Colossians',       apiSlug: 'colossians',        helloaoId: 'COL', testament: 'NT', chapters:   4 },
  { id: 52, name: '1 Thessalonians',  apiSlug: '1+thessalonians',   helloaoId: '1TH', testament: 'NT', chapters:   5 },
  { id: 53, name: '2 Thessalonians',  apiSlug: '2+thessalonians',   helloaoId: '2TH', testament: 'NT', chapters:   3 },
  { id: 54, name: '1 Timothy',        apiSlug: '1+timothy',         helloaoId: '1TI', testament: 'NT', chapters:   6 },
  { id: 55, name: '2 Timothy',        apiSlug: '2+timothy',         helloaoId: '2TI', testament: 'NT', chapters:   4 },
  { id: 56, name: 'Titus',            apiSlug: 'titus',             helloaoId: 'TIT', testament: 'NT', chapters:   3 },
  { id: 57, name: 'Philemon',         apiSlug: 'philemon',          helloaoId: 'PHM', testament: 'NT', chapters:   1 },
  { id: 58, name: 'Hebrews',          apiSlug: 'hebrews',           helloaoId: 'HEB', testament: 'NT', chapters:  13 },
  { id: 59, name: 'James',            apiSlug: 'james',             helloaoId: 'JAS', testament: 'NT', chapters:   5 },
  { id: 60, name: '1 Peter',          apiSlug: '1+peter',           helloaoId: '1PE', testament: 'NT', chapters:   5 },
  { id: 61, name: '2 Peter',          apiSlug: '2+peter',           helloaoId: '2PE', testament: 'NT', chapters:   3 },
  { id: 62, name: '1 John',           apiSlug: '1+john',            helloaoId: '1JN', testament: 'NT', chapters:   5 },
  { id: 63, name: '2 John',           apiSlug: '2+john',            helloaoId: '2JN', testament: 'NT', chapters:   1 },
  { id: 64, name: '3 John',           apiSlug: '3+john',            helloaoId: '3JN', testament: 'NT', chapters:   1 },
  { id: 65, name: 'Jude',             apiSlug: 'jude',              helloaoId: 'JUD', testament: 'NT', chapters:   1 },
  { id: 66, name: 'Revelation',       apiSlug: 'revelation',        helloaoId: 'REV', testament: 'NT', chapters:  22 },
];

/** O(n) lookup — call site should cache the result when hot. */
export function getBookById(id: number): BibleBookMeta | undefined {
  return BIBLE_BOOKS.find((b) => b.id === id);
}
