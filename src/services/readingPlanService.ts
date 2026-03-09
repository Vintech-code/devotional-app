import { ReadingPlan } from '../types';

// ─── Predefined Plans ─────────────────────────────────────────────────────────

const GOSPELS_30: ReadingPlan = {
  id: 'gospels-30',
  title: 'The Four Gospels',
  description: 'Journey through Matthew, Mark, Luke, and John in 30 days.',
  durationDays: 30,
  days: [
    { day:  1, title: 'The Genealogy of Jesus',        refs: ['Matthew 1'] },
    { day:  2, title: 'The Birth & Wise Men',           refs: ['Matthew 2'] },
    { day:  3, title: 'Baptism & Temptation',           refs: ['Matthew 3', 'Matthew 4'] },
    { day:  4, title: 'The Sermon on the Mount I',      refs: ['Matthew 5'] },
    { day:  5, title: 'The Sermon on the Mount II',     refs: ['Matthew 6', 'Matthew 7'] },
    { day:  6, title: 'Miracles of Faith',              refs: ['Matthew 8', 'Matthew 9'] },
    { day:  7, title: 'The Twelve Sent Out',            refs: ['Matthew 10'] },
    { day:  8, title: 'Rest for the Weary',             refs: ['Matthew 11', 'Matthew 12'] },
    { day:  9, title: 'Kingdom Parables',               refs: ['Matthew 13'] },
    { day: 10, title: 'Walking on Water',               refs: ['Matthew 14', 'Matthew 15'] },
    { day: 11, title: 'The Great Confession',           refs: ['Matthew 16', 'Matthew 17'] },
    { day: 12, title: 'Forgiveness & Greatness',        refs: ['Matthew 18', 'Matthew 19'] },
    { day: 13, title: 'Palm Sunday & Temple',           refs: ['Matthew 20', 'Matthew 21'] },
    { day: 14, title: 'End Times Teaching',             refs: ['Matthew 24', 'Matthew 25'] },
    { day: 15, title: 'Passion & Resurrection',        refs: ['Matthew 26', 'Matthew 27', 'Matthew 28'] },
    { day: 16, title: 'Mark: The Servant King',        refs: ['Mark 1', 'Mark 2'] },
    { day: 17, title: 'Authority Over Evil',           refs: ['Mark 3', 'Mark 4'] },
    { day: 18, title: 'Power Over Nature',             refs: ['Mark 5', 'Mark 6'] },
    { day: 19, title: 'True Cleanliness',              refs: ['Mark 7', 'Mark 8'] },
    { day: 20, title: 'The Cost of Discipleship',      refs: ['Mark 9', 'Mark 10'] },
    { day: 21, title: 'Mark: Passion Week',            refs: ['Mark 14', 'Mark 15', 'Mark 16'] },
    { day: 22, title: 'Luke: Annunciation & Birth',    refs: ['Luke 1', 'Luke 2'] },
    { day: 23, title: 'Preparing the Way',             refs: ['Luke 3', 'Luke 4'] },
    { day: 24, title: 'Calling the Disciples',         refs: ['Luke 5', 'Luke 6'] },
    { day: 25, title: 'Parables of Grace',             refs: ['Luke 15', 'Luke 16'] },
    { day: 26, title: 'Zacchaeus & The Entry',        refs: ['Luke 19', 'Luke 20'] },
    { day: 27, title: 'Luke: Cross & Empty Tomb',      refs: ['Luke 23', 'Luke 24'] },
    { day: 28, title: 'John: Word Made Flesh',         refs: ['John 1', 'John 2', 'John 3'] },
    { day: 29, title: 'I Am the Way',                  refs: ['John 14', 'John 15', 'John 16'] },
    { day: 30, title: 'John: Risen & Appearing',       refs: ['John 20', 'John 21'] },
  ],
};

const PSALMS_PROVERBS_30: ReadingPlan = {
  id: 'psalms-proverbs-30',
  title: 'Psalms & Proverbs',
  description: 'A month of wisdom and worship — one psalm and one proverb per day.',
  durationDays: 30,
  days: Array.from({ length: 30 }, (_, i) => ({
    day:   i + 1,
    title: `Day ${i + 1} — Wisdom & Praise`,
    refs:  [`Psalm ${i + 1}`, `Proverbs ${i + 1}`],
  })),
};

const NT_90: ReadingPlan = {
  id: 'nt-90',
  title: 'New Testament in 90 Days',
  description: 'Read through the entire New Testament — 3 chapters a day.',
  durationDays: 90,
  days: (() => {
    // NT books with chapter counts
    const books: Array<[string, number]> = [
      ['Matthew', 28], ['Mark', 16], ['Luke', 24], ['John', 21],
      ['Acts', 28], ['Romans', 16], ['1 Corinthians', 16], ['2 Corinthians', 13],
      ['Galatians', 6], ['Ephesians', 6], ['Philippians', 4], ['Colossians', 4],
      ['1 Thessalonians', 5], ['2 Thessalonians', 3], ['1 Timothy', 6],
      ['2 Timothy', 4], ['Titus', 3], ['Philemon', 1], ['Hebrews', 13],
      ['James', 5], ['1 Peter', 5], ['2 Peter', 3], ['1 John', 5],
      ['2 John', 1], ['3 John', 1], ['Jude', 1], ['Revelation', 22],
    ];
    // Flatten to a list of "Book Chapter"
    const all: string[] = [];
    for (const [book, chapters] of books) {
      for (let c = 1; c <= chapters; c++) all.push(`${book} ${c}`);
    }
    // Group into 90 days (3 chapters each)
    return Array.from({ length: 90 }, (_, i) => ({
      day:   i + 1,
      title: all[i * 3] ?? `Day ${i + 1}`,
      refs:  all.slice(i * 3, i * 3 + 3).filter(Boolean),
    }));
  })(),
};

const MORNING_DEVOTION_21: ReadingPlan = {
  id: 'morning-devotion-21',
  title: '21-Day Morning Breakthrough',
  description: 'Start each morning strong with key passages on faith, purpose, and renewal.',
  durationDays: 21,
  days: [
    { day:  1, title: 'New Every Morning',             refs: ['Lamentations 3:22-26', 'Psalm 5'] },
    { day:  2, title: 'The Lord is My Shepherd',       refs: ['Psalm 23', 'John 10:1-21'] },
    { day:  3, title: 'Be Still & Know',               refs: ['Psalm 46', 'Isaiah 40:27-31'] },
    { day:  4, title: 'Armor of God',                  refs: ['Ephesians 6:10-20'] },
    { day:  5, title: 'Fear Not',                      refs: ['Isaiah 41:10-14', 'Psalm 34'] },
    { day:  6, title: 'Seek First',                    refs: ['Matthew 6:25-34', 'Psalm 37:1-11'] },
    { day:  7, title: 'Renewed Mind',                  refs: ['Romans 12', 'Philippians 4:4-9'] },
    { day:  8, title: 'Faith Like a Mustard Seed',     refs: ['Matthew 17:14-21', 'Hebrews 11:1-12'] },
    { day:  9, title: 'The Vine & the Branches',       refs: ['John 15:1-17'] },
    { day: 10, title: 'Walking in the Spirit',         refs: ['Galatians 5:16-26', 'Romans 8:1-17'] },
    { day: 11, title: 'Forgiveness Frees You',         refs: ['Matthew 18:21-35', 'Colossians 3:12-17'] },
    { day: 12, title: 'Love Is Patient',               refs: ['1 Corinthians 13'] },
    { day: 13, title: 'Fruit of the Spirit',           refs: ['Galatians 5:22-26', 'John 15:1-8'] },
    { day: 14, title: 'The Great Commission',          refs: ['Matthew 28:16-20', 'Acts 1'] },
    { day: 15, title: 'Serve One Another',             refs: ['Mark 10:35-45', 'John 13:1-17'] },
    { day: 16, title: 'Wisdom from Above',             refs: ['James 1', 'Proverbs 3:1-12'] },
    { day: 17, title: 'Trust in the Lord',             refs: ['Proverbs 3:5-12', 'Psalm 62'] },
    { day: 18, title: 'Joy of Salvation',              refs: ['Psalm 51', 'Luke 15:11-32'] },
    { day: 19, title: 'Living Hope',                   refs: ['1 Peter 1:1-12', 'Romans 8:18-30'] },
    { day: 20, title: 'The Power of Prayer',           refs: ['Matthew 7:7-11', 'James 5:13-20', 'Philippians 4'] },
    { day: 21, title: 'All Things New',                refs: ['Revelation 21:1-7', 'Isaiah 43:18-21', '2 Corinthians 5:17'] },
  ],
};

export const READING_PLANS: ReadingPlan[] = [
  MORNING_DEVOTION_21,
  GOSPELS_30,
  PSALMS_PROVERBS_30,
  NT_90,
];

export function getPlanById(id: string): ReadingPlan | undefined {
  return READING_PLANS.find((p) => p.id === id);
}
