/**
 * src/data/bibleTranslations.ts
 *
 * All 16 translations supported by bible-api.com.
 *  - id        : identifier passed as `?translation=id` in API requests
 *  - name      : full name for display
 *  - shortName : compact badge (max ~5 chars)
 *  - language  : display language label
 *
 * Source: https://bible-api.com (see Translations section)
 */

export interface BibleTranslation {
  id: string;
  name: string;
  shortName: string;
  language: string;
  isEnglish: boolean;
}

export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  // ── English ──────────────────────────────────────────────────────────────────
  { id: 'kjv',       name: 'King James Version',                          shortName: 'KJV',   language: 'English',    isEnglish: true  },
  { id: 'web',       name: 'World English Bible',                         shortName: 'WEB',   language: 'English',    isEnglish: true  },
  { id: 'asv',       name: 'American Standard Version (1901)',            shortName: 'ASV',   language: 'English',    isEnglish: true  },
  { id: 'bbe',       name: 'Bible in Basic English',                      shortName: 'BBE',   language: 'English',    isEnglish: true  },
  { id: 'darby',     name: 'Darby Bible',                                 shortName: 'WBY',   language: 'English',    isEnglish: true  },
  { id: 'dra',       name: 'Douay-Rheims 1899 American Edition',          shortName: 'DRA',   language: 'English',    isEnglish: true  },
  { id: 'ylt',       name: "Young's Literal Translation (NT only)",       shortName: 'YLT',   language: 'English',    isEnglish: true  },
  { id: 'oeb-us',    name: 'Open English Bible, US Edition',              shortName: 'OEB',   language: 'English (US)', isEnglish: true },
  { id: 'oeb-cw',    name: 'Open English Bible, Commonwealth Edition',    shortName: 'OEB-C', language: 'English (UK)', isEnglish: true },
  { id: 'webbe',     name: 'World English Bible, British Edition',        shortName: 'WEBB',  language: 'English (UK)', isEnglish: true },
  // ── Other languages ──────────────────────────────────────────────────────────
  { id: 'cherokee',  name: 'Cherokee New Testament',                      shortName: 'CHR',   language: 'Cherokee',   isEnglish: false },
  { id: 'cuv',       name: 'Chinese Union Version',                       shortName: 'CUV',   language: 'Chinese',    isEnglish: false },
  { id: 'bkr',       name: 'Bible kralická',                              shortName: 'BKR',   language: 'Czech',      isEnglish: false },
  { id: 'clementine',name: 'Clementine Latin Vulgate',                    shortName: 'LAT',   language: 'Latin',      isEnglish: false },
  { id: 'almeida',   name: 'João Ferreira de Almeida',                    shortName: 'ALM',   language: 'Portuguese', isEnglish: false },
  { id: 'rccv',      name: 'Protestant Romanian Corrected Cornilescu',    shortName: 'RCCV',  language: 'Romanian',   isEnglish: false },
];

export const DEFAULT_TRANSLATION_ID = 'kjv';

export function getTranslationById(id: string): BibleTranslation | undefined {
  return BIBLE_TRANSLATIONS.find((t) => t.id === id);
}
