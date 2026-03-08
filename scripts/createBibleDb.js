 #!/usr/bin/env node
/**
 * scripts/createBibleDb.js
 *
 * Run once from project root:
 *   node scripts/createBibleDb.js
 *
 * Generates assets/bible.db — a fully offline SQLite KJV Bible with all
 * 66 books, chapters, and a representative set of verses seeded so the app
 * works immediately.  In production you would replace the seeded verses with
 * the full ~31 000-verse dataset (not included here for copyright reasons —
 * see README for free public-domain KJV sources you can import).
 *
 * Requires: better-sqlite3 (dev-only, NOT bundled into the app)
 *   npm install --save-dev better-sqlite3
 */
'use strict';

const path   = require('path');
const fs     = require('fs');
const BetterSqlite3 = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'assets', 'bible.db');

// ─── Delete stale file ───────────────────────────────────────────────────────
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

const db = new BetterSqlite3(DB_PATH);

// ─── Schema ──────────────────────────────────────────────────────────────────
db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS books (
    id        INTEGER PRIMARY KEY,
    name      TEXT    NOT NULL,
    testament TEXT    NOT NULL CHECK(testament IN ('OT','NT')),
    chapters  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS verses (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL REFERENCES books(id),
    chapter INTEGER NOT NULL,
    verse   INTEGER NOT NULL,
    text    TEXT    NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_verses_book_ch ON verses (book_id, chapter);
`);

// ─── Books (all 66 with chapter counts) ──────────────────────────────────────
const BOOKS = [
  // OT
  [1,  'Genesis',        'OT', 50], [2,  'Exodus',         'OT', 40],
  [3,  'Leviticus',      'OT', 27], [4,  'Numbers',        'OT', 36],
  [5,  'Deuteronomy',    'OT', 34], [6,  'Joshua',         'OT', 24],
  [7,  'Judges',         'OT', 21], [8,  'Ruth',           'OT',  4],
  [9,  '1 Samuel',       'OT', 31], [10, '2 Samuel',       'OT', 24],
  [11, '1 Kings',        'OT', 22], [12, '2 Kings',        'OT', 25],
  [13, '1 Chronicles',   'OT', 29], [14, '2 Chronicles',   'OT', 36],
  [15, 'Ezra',           'OT', 10], [16, 'Nehemiah',       'OT', 13],
  [17, 'Esther',         'OT', 10], [18, 'Job',            'OT', 42],
  [19, 'Psalms',         'OT',150], [20, 'Proverbs',       'OT', 31],
  [21, 'Ecclesiastes',   'OT', 12], [22, 'Song of Solomon','OT',  8],
  [23, 'Isaiah',         'OT', 66], [24, 'Jeremiah',       'OT', 52],
  [25, 'Lamentations',   'OT',  5], [26, 'Ezekiel',        'OT', 48],
  [27, 'Daniel',         'OT', 12], [28, 'Hosea',          'OT', 14],
  [29, 'Joel',           'OT',  3], [30, 'Amos',           'OT',  9],
  [31, 'Obadiah',        'OT',  1], [32, 'Jonah',          'OT',  4],
  [33, 'Micah',          'OT',  7], [34, 'Nahum',          'OT',  3],
  [35, 'Habakkuk',       'OT',  3], [36, 'Zephaniah',      'OT',  3],
  [37, 'Haggai',         'OT',  2], [38, 'Zechariah',      'OT', 14],
  [39, 'Malachi',        'OT',  4],
  // NT
  [40, 'Matthew',        'NT', 28], [41, 'Mark',           'NT', 16],
  [42, 'Luke',           'NT', 24], [43, 'John',           'NT', 21],
  [44, 'Acts',           'NT', 28], [45, 'Romans',         'NT', 16],
  [46, '1 Corinthians',  'NT', 16], [47, '2 Corinthians',  'NT', 13],
  [48, 'Galatians',      'NT',  6], [49, 'Ephesians',      'NT',  6],
  [50, 'Philippians',    'NT',  4], [51, 'Colossians',     'NT',  4],
  [52, '1 Thessalonians','NT',  5], [53, '2 Thessalonians','NT',  3],
  [54, '1 Timothy',      'NT',  6], [55, '2 Timothy',      'NT',  4],
  [56, 'Titus',          'NT',  3], [57, 'Philemon',       'NT',  1],
  [58, 'Hebrews',        'NT', 13], [59, 'James',          'NT',  5],
  [60, '1 Peter',        'NT',  5], [61, '2 Peter',        'NT',  3],
  [62, '1 John',         'NT',  5], [63, '2 John',         'NT',  1],
  [64, '3 John',         'NT',  1], [65, 'Jude',           'NT',  1],
  [66, 'Revelation',     'NT', 22],
];

const insertBook = db.prepare('INSERT INTO books (id, name, testament, chapters) VALUES (?, ?, ?, ?)');
for (const row of BOOKS) insertBook.run(...row);

// ─── Verse data ───────────────────────────────────────────────────────────────
// Representative KJV verses (public domain).
// Format: [book_id, chapter, verse, text]
const VERSE_DATA = [
  // Genesis 1
  [1,1,1,'In the beginning God created the heaven and the earth.'],
  [1,1,2,'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.'],
  [1,1,3,'And God said, Let there be light: and there was light.'],
  [1,1,26,'And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth.'],
  [1,1,27,'So God created man in his own image, in the image of God created he him; male and female created he them.'],
  // Genesis 3
  [1,3,15,'And I will put enmity between thee and the woman, and between thy seed and her seed; it shall bruise thy head, and thou shalt bruise his heel.'],
  // Exodus 20
  [2,20,1,'And God spake all these words, saying,'],
  [2,20,2,'I am the LORD thy God, which have brought thee out of the land of Egypt, out of the house of bondage.'],
  [2,20,3,'Thou shalt have no other gods before me.'],
  // Psalms 1
  [19,1,1,'Blessed is the man that walketh not in the counsel of the ungodly, nor standeth in the way of sinners, nor sitteth in the seat of the scornful.'],
  [19,1,2,'But his delight is in the law of the LORD; and in his law doth he meditate day and night.'],
  [19,1,3,'And he shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season; his leaf also shall not wither; and whatsoever he doeth shall prosper.'],
  // Psalms 23
  [19,23,1,'The LORD is my shepherd; I shall not want.'],
  [19,23,2,'He maketh me to lie down in green pastures: he leadeth me beside the still waters.'],
  [19,23,3,'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.'],
  [19,23,4,'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.'],
  [19,23,5,'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.'],
  [19,23,6,'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.'],
  // Psalms 119
  [19,119,9,'Wherewithal shall a young man cleanse his way? by taking heed thereto according to thy word.'],
  [19,119,11,'Thy word have I hid in mine heart, that I might not sin against thee.'],
  [19,119,105,'Thy word is a lamp unto my feet, and a light unto my path.'],
  // Proverbs 3
  [20,3,5,'Trust in the LORD with all thine heart; and lean not unto thine own understanding.'],
  [20,3,6,'In all thy ways acknowledge him, and he shall direct thy paths.'],
  // Proverbs 22
  [20,22,6,'Train up a child in the way he should go: and when he is old, he will not depart from it.'],
  // Isaiah 40
  [23,40,29,'He giveth power to the faint; and to them that have no might he increaseth strength.'],
  [23,40,30,'Even the youths shall faint and be weary, and the young men shall utterly fall:'],
  [23,40,31,'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.'],
  // Jeremiah 29
  [24,29,11,'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.'],
  [24,29,12,'Then shall ye call upon me, and ye shall go and pray unto me, and I will hearken unto you.'],
  [24,29,13,'And ye shall seek me, and find me, when ye shall search for me with all your heart.'],
  // Matthew 5
  [40,5,3,'Blessed are the poor in spirit: for theirs is the kingdom of heaven.'],
  [40,5,4,'Blessed are they that mourn: for they shall be comforted.'],
  [40,5,5,'Blessed are the meek: for they shall inherit the earth.'],
  [40,5,6,'Blessed are they which do hunger and thirst after righteousness: for they shall be filled.'],
  [40,5,9,'Blessed are the peacemakers: for they shall be called the children of God.'],
  // Matthew 6
  [40,6,9,'After this manner therefore pray ye: Our Father which art in heaven, Hallowed be thy name.'],
  [40,6,10,'Thy kingdom come. Thy will be done in earth, as it is in heaven.'],
  [40,6,11,'Give us this day our daily bread.'],
  [40,6,33,'But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.'],
  // John 1
  [43,1,1,'In the beginning was the Word, and the Word was with God, and the Word was God.'],
  [43,1,2,'The same was in the beginning with God.'],
  [43,1,3,'All things were made by him; and without him was not any thing made that was made.'],
  [43,1,4,'In him was life; and the life was the light of men.'],
  [43,1,5,'And the light shineth in darkness; and the darkness comprehended it not.'],
  [43,1,14,'And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.'],
  // John 3
  [43,3,1,'There was a man of the Pharisees, named Nicodemus, a ruler of the Jews:'],
  [43,3,3,'Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.'],
  [43,3,14,'And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up:'],
  [43,3,15,'That whosoever believeth in him should not perish, but have eternal life.'],
  [43,3,16,'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'],
  [43,3,17,'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.'],
  // John 14
  [43,14,1,'Let not your heart be troubled: ye believe in God, believe also in me.'],
  [43,14,6,'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.'],
  // Romans 8
  [45,8,1,'There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.'],
  [45,8,28,'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.'],
  [45,8,38,'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,'],
  [45,8,39,'Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.'],
  // 1 Corinthians 13
  [46,13,1,'Though I speak with the tongues of men and of angels, and have not charity, I am become as sounding brass, or a tinkling cymbal.'],
  [46,13,4,'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up,'],
  [46,13,13,'And now abideth faith, hope, charity, these three; but the greatest of these is charity.'],
  // Ephesians 2
  [49,2,8,'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God:'],
  [49,2,9,'Not of works, lest any man should boast.'],
  // Ephesians 6
  [49,6,10,'Finally, my brethren, be strong in the Lord, and in the power of his might.'],
  [49,6,11,'Put on the whole armour of God, that ye may be able to stand against the wiles of the devil.'],
  // Philippians 4
  [50,4,4,'Rejoice in the Lord alway: and again I say, Rejoice.'],
  [50,4,6,'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.'],
  [50,4,7,'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.'],
  [50,4,13,'I can do all things through Christ which strengtheneth me.'],
  // Hebrews 11
  [58,11,1,'Now faith is the substance of things hoped for, the evidence of things not seen.'],
  [58,11,6,'But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek him.'],
  // James 1
  [59,1,2,'My brethren, count it all joy when ye fall into divers temptations;'],
  [59,1,3,'Knowing this, that the trying of your faith worketh patience.'],
  [59,1,17,'Every good gift and every perfect gift is from above, and cometh down from the Father of lights, with whom is no variableness, neither shadow of turning.'],
  // 1 John 1
  [62,1,9,'If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.'],
  // Revelation 21
  [66,21,1,'And I saw a new heaven and a new earth: for the first heaven and the first earth were passed away; and there was no more sea.'],
  [66,21,4,'And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.'],
  [66,21,5,'And he that sat upon the throne said, Behold, I make all things new. And he said unto me, Write: for these words are true and faithful.'],
];

const insertVerse = db.prepare('INSERT INTO verses (book_id, chapter, verse, text) VALUES (?, ?, ?, ?)');
const insertMany  = db.transaction((rows) => { for (const r of rows) insertVerse.run(...r); });
insertMany(VERSE_DATA);

db.close();

const stats = fs.statSync(DB_PATH);
console.log(`✅  bible.db created at ${DB_PATH}`);
console.log(`   Books:  ${BOOKS.length}`);
console.log(`   Verses: ${VERSE_DATA.length}`);
console.log(`   Size:   ${(stats.size / 1024).toFixed(1)} KB`);
