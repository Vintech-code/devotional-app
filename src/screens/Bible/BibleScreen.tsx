import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors, Typography, Spacing, Radius } from '../../theme';
import { makeStyles } from './Bible.styles';
import { getBiblePosition, saveBiblePosition } from '../../services/storageService';

// ─── Sample Bible Data (NIV) ─────────────────────────────────────────────────

type Verse = { v: number; text: string };

const BIBLE: Record<string, Record<number, Verse[]>> = {
  John: {
    1: [
      { v: 1,  text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
      { v: 2,  text: 'He was with God in the beginning.' },
      { v: 3,  text: 'Through him all things were made; without him nothing was made that has been made.' },
      { v: 4,  text: 'In him was life, and that life was the light of all mankind.' },
      { v: 5,  text: 'The light shines in the darkness, and the darkness has not overcome it.' },
      { v: 14, text: 'The Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son, who came from the Father, full of grace and truth.' },
    ],
    3: [
      { v: 1,  text: 'Now there was a Pharisee, a man named Nicodemus who was a member of the Jewish ruling council.' },
      { v: 2,  text: 'He came to Jesus at night and said, "Rabbi, we know that you are a teacher who has come from God. For no one could perform the signs you are doing if God were not with him."' },
      { v: 3,  text: 'Jesus replied, "Very truly I tell you, no one can see the kingdom of God unless they are born again."' },
      { v: 14, text: 'Just as Moses lifted up the snake in the wilderness, so the Son of Man must be lifted up,' },
      { v: 15, text: 'that everyone who believes may have eternal life in him.' },
      { v: 16, text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
      { v: 17, text: 'For God did not send his Son into the world to condemn the world, but to save the world through him.' },
      { v: 18, text: "Whoever believes in him is not condemned, but whoever does not believe stands condemned already because they have not believed in the name of God's one and only Son." },
      { v: 19, text: 'This is the verdict: Light has come into the world, but people loved darkness instead of light because their deeds were evil.' },
    ],
    4: [
      { v: 13, text: 'Jesus answered, "Everyone who drinks this water will be thirsty again,' },
      { v: 14, text: 'but whoever drinks the water I give them will never thirst. Indeed, the water I give them will become in them a spring of water welling up to eternal life."' },
    ],
  },
  Psalms: {
    23: [
      { v: 1, text: 'The LORD is my shepherd, I lack nothing.' },
      { v: 2, text: 'He makes me lie down in green pastures, he leads me beside quiet waters,' },
      { v: 3, text: "he refreshes my soul. He guides me along the right paths for his name's sake." },
      { v: 4, text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.' },
      { v: 5, text: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows.' },
      { v: 6, text: 'Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the LORD forever.' },
    ],
    119: [
      { v: 105, text: 'Your word is a lamp for my feet, a light on my path.' },
      { v: 106, text: 'I have taken an oath and confirmed it, that I will follow your righteous laws.' },
    ],
  },
  Philippians: {
    4: [
      { v: 4,  text: 'Rejoice in the Lord always. I will say it again: Rejoice!' },
      { v: 6,  text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.' },
      { v: 7,  text: 'And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.' },
      { v: 13, text: 'I can do all this through him who gives me strength.' },
    ],
  },
  Jeremiah: {
    29: [
      { v: 11, text: '"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."' },
      { v: 12, text: 'Then you will call on me and come and pray to me, and I will listen to you.' },
      { v: 13, text: 'You will seek me and find me when you seek me with all your heart.' },
    ],
  },
};

const BOOKS = Object.keys(BIBLE);

export default function BibleScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const [book, setBook]           = useState('John');
  const [chapter, setChapter]     = useState(3);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [showBookPicker, setShowBookPicker]       = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Restore last read position from storage
  useEffect(() => {
    getBiblePosition().then((pos) => {
      if (pos && BIBLE[pos.book]?.[pos.chapter]) {
        setBook(pos.book);
        setChapter(pos.chapter);
      }
    });
  }, []);

  // Save position whenever book or chapter changes
  useEffect(() => {
    void saveBiblePosition(book, chapter);
  }, [book, chapter]);

  const chapters = BIBLE[book] ? Object.keys(BIBLE[book]).map(Number).sort((a, b) => a - b) : [1];
  const verses   = BIBLE[book]?.[chapter] ?? [];

  function pickBook(b: string) {
    setBook(b);
    const first = Number(Object.keys(BIBLE[b]).sort((a, b) => Number(a) - Number(b))[0]);
    setChapter(first);
    setSelectedVerse(null);
    setShowBookPicker(false);
  }

  function pickChapter(ch: number) {
    setChapter(ch);
    setSelectedVerse(null);
    setShowChapterPicker(false);
  }

  function toggleVerse(v: number) {
    setSelectedVerse((prev) => (prev === v ? null : v));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Holy Bible</Text>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => { setShowSearch((v) => !v); setShowBookPicker(false); setShowChapterPicker(false); }}
        >
          <Icon source="magnify" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ─── Search bar ─── */}
      {showSearch && (
        <View style={styles.searchBar}>
          <Icon source="magnify" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search scripture..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); }}>
            <Icon source="close" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* ─── Book / Chapter nav bar ─── */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => { setShowBookPicker((v) => !v); setShowChapterPicker(false); }}
        >
          <Text style={styles.selectorBook}>{book}</Text>
          <Icon source="menu-down" size={16} color={colors.textMuted} />
        </TouchableOpacity>
        <Icon source="chevron-right" size={16} color={colors.textMuted} />
        <TouchableOpacity
          style={styles.selector}
          onPress={() => { setShowChapterPicker((v) => !v); setShowBookPicker(false); }}
        >
          <Text style={styles.selectorChapter}>{chapter}</Text>
          <Icon source="menu-down" size={16} color={colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.navButtons}>
          <TouchableOpacity style={styles.navBtn}>
            <Icon source="chevron-left" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn}>
            <Icon source="chevron-right" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Book picker ─── */}
      {showBookPicker && (
        <View style={styles.dropdown}>
          <ScrollView style={{ maxHeight: 200 }}>
            {BOOKS.map((b) => (
              <TouchableOpacity
                key={b}
                style={[styles.dropItem, b === book && styles.dropItemActive]}
                onPress={() => pickBook(b)}
              >
                <Text style={[styles.dropText, b === book && styles.dropTextActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ─── Chapter picker ─── */}
      {showChapterPicker && (
        <View style={styles.dropdown}>
          <View style={styles.chapterGrid}>
            {chapters.map((ch) => (
              <TouchableOpacity
                key={ch}
                style={[styles.chapterDot, ch === chapter && styles.chapterDotActive]}
                onPress={() => pickChapter(ch)}
              >
                <Text style={[styles.chapterDotText, ch === chapter && styles.chapterDotTextActive]}>
                  {ch}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* ─── Verse list ─── */}
      <ScrollView
        style={styles.verseList}
        contentContainerStyle={styles.verseListContent}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => { setShowBookPicker(false); setShowChapterPicker(false); }}
      >
        <Text style={styles.chapterHeading}>{book} {chapter}</Text>

        {verses.map((verse) => (
          <TouchableOpacity
            key={verse.v}
            style={[styles.verseRow, selectedVerse === verse.v && styles.verseRowSelected]}
            onPress={() => toggleVerse(verse.v)}
            onLongPress={() => setSelectedVerse(verse.v)}
            activeOpacity={0.75}
          >
            <Text style={styles.verseNum}>{verse.v}</Text>
            <Text style={[styles.verseText, selectedVerse === verse.v && styles.verseTextSelected]}>
              {verse.text}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Hint */}
        <View style={styles.hintRow}>
          <Icon source="gesture-tap" size={18} color={colors.textMuted} />
          <Text style={styles.hintText}>
            Long-press any verse to highlight or add personal study notes
          </Text>
        </View>
      </ScrollView>

      {/* ─── Action bar (shown when a verse is selected) ─── */}
      {selectedVerse !== null && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.actionBtn}>
            <Icon source="format-color-highlight" size={20} color="#fff" />
            <Text style={styles.actionText}>HIGHLIGHT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Icon source="note-plus" size={20} color="#fff" />
            <Text style={styles.actionText}>ADD NOTE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Icon source="share-variant" size={20} color="#fff" />
            <Text style={styles.actionText}>SHARE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setSelectedVerse(null)}>
            <Icon source="close" size={20} color="#fff" />
            <Text style={styles.actionText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
