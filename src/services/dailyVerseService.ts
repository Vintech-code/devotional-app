export interface DailyVerse {
  reference: string;
  text: string;
  theme: string; // e.g. 'hope', 'courage', 'peace', 'love', 'strength'
}

const VERSES: DailyVerse[] = [
  { reference: 'Jeremiah 29:11',    theme: 'hope',     text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." },
  { reference: 'Psalm 23:1',        theme: 'peace',    text: 'The Lord is my shepherd, I lack nothing.' },
  { reference: 'Proverbs 3:5-6',    theme: 'trust',    text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
  { reference: 'Philippians 4:6-7', theme: 'peace',    text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.' },
  { reference: 'Isaiah 40:31',      theme: 'strength', text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.' },
  { reference: 'Romans 8:28',       theme: 'hope',     text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
  { reference: 'Joshua 1:9',        theme: 'courage',  text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.' },
  { reference: 'Psalm 46:1',        theme: 'strength', text: 'God is our refuge and strength, an ever-present help in trouble.' },
  { reference: 'Matthew 11:28',     theme: 'rest',     text: 'Come to me, all you who are weary and burdened, and I will give you rest.' },
  { reference: 'John 3:16',         theme: 'love',     text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { reference: 'Romans 8:38-39',    theme: 'love',     text: 'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.' },
  { reference: 'Psalm 119:105',     theme: 'guidance', text: 'Your word is a lamp for my feet, a light on my path.' },
  { reference: '1 Corinthians 13:13', theme: 'love',   text: 'And now these three remain: faith, hope and love. But the greatest of these is love.' },
  { reference: 'Ephesians 2:8-9',   theme: 'grace',    text: 'For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God — not by works, so that no one can boast.' },
  { reference: 'Philippians 4:13',  theme: 'strength', text: 'I can do all this through him who gives me strength.' },
  { reference: 'Psalm 27:1',        theme: 'courage',  text: 'The Lord is my light and my salvation — whom shall I fear? The Lord is the stronghold of my life — of whom shall I be afraid?' },
  { reference: 'Isaiah 41:10',      theme: 'courage',  text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.' },
  { reference: 'Romans 15:13',      theme: 'hope',     text: 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.' },
  { reference: 'Lamentations 3:22-23', theme: 'grace', text: 'Because of the Lord\'s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.' },
  { reference: 'Psalm 34:18',       theme: 'healing',  text: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.' },
  { reference: '2 Timothy 1:7',     theme: 'courage',  text: 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.' },
  { reference: 'James 1:2-3',       theme: 'faith',    text: 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.' },
  { reference: 'Psalm 91:1-2',      theme: 'protection', text: 'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, "He is my refuge and my fortress, my God, in whom I trust."' },
  { reference: 'John 14:27',        theme: 'peace',    text: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.' },
  { reference: 'Hebrews 11:1',      theme: 'faith',    text: 'Now faith is confidence in what we hope for and assurance about what we do not see.' },
  { reference: 'Galatians 5:22-23', theme: 'love',     text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.' },
  { reference: '1 Peter 5:7',       theme: 'peace',    text: 'Cast all your anxiety on him because he cares for you.' },
  { reference: 'Psalm 37:4',        theme: 'trust',    text: 'Take delight in the Lord, and he will give you the desires of your heart.' },
  { reference: 'Matthew 6:33',      theme: 'guidance', text: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.' },
  { reference: 'Psalm 16:8',        theme: 'guidance', text: 'I keep my eyes always on the Lord. With him at my right hand, I will not be shaken.' },
  { reference: 'Micah 6:8',         theme: 'justice',  text: 'He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.' },
  { reference: 'Colossians 3:23',   theme: 'faith',    text: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.' },
];

export function getDailyVerse(date = new Date()): DailyVerse {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return VERSES[dayOfYear % VERSES.length];
}

export function getVerseForDay(daysOffset: number, from = new Date()): DailyVerse {
  const d = new Date(from);
  d.setDate(d.getDate() + daysOffset);
  return getDailyVerse(d);
}

export function getVerseByIndex(index: number): DailyVerse {
  return VERSES[((index % VERSES.length) + VERSES.length) % VERSES.length];
}

export const VERSE_COUNT = VERSES.length;
