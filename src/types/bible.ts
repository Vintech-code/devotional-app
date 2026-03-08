// src/types/bible.ts

export interface BibleBook {
  id: number;
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
}

export interface BibleVerse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
}

/** Lightweight shape used when listing chapters */
export interface ChapterSummary {
  chapter: number;
  verseCount: number;
}
