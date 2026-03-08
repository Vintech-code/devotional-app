/**
 * YouVersion-style reader:
 *  - Charcoal dark background (screen-local, not from app theme)
 *  - Tap verse number OR text to add to selection set (multi-select)
 *  - Sticky bottom toolbar appears while verses are selected — does NOT cover screen
 *  - Pick a highlight color → all selected verses get that color → toolbar clears
 *  - Copy / Share / Journal buttons in the toolbar
 *  - Journal button navigates to Journal tab pre-filled with selected verse(s)
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Icon } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { DarkColors, useColors } from '../../theme';
import type { ColorScheme } from '../../theme/colors';
import { getVerses } from '../../services/bibleService';
import { useAppStore } from '../../store/useAppStore';
import { saveBiblePosition } from '../../services/storageService';
import type { BibleVerse } from '../../types/bible';
import type { BibleStackParamList, MainTabParamList } from '../../navigation/types';
import { buildStyles } from './Verses.styles';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<BibleStackParamList, 'Verses'>,
  BottomTabNavigationProp<MainTabParamList>
>;
type Route = RouteProp<BibleStackParamList, 'Verses'>;

// Screen-local YouVersion dark palette (follows app theme)
// BG, SURFACE, etc. are declared inside the component below

const SEL_TINT = 'rgba(78,205,196,0.20)'; // subtle tint while selected but no color chosen yet

const HIGHLIGHT_COLORS = [
  { key: 'yellow', swatch: '#FFD60A', bg: 'rgba(255,214,10,0.40)' },
  { key: 'green',  swatch: '#30D158', bg: 'rgba(48,209,88,0.40)'  },
  { key: 'blue',   swatch: '#0A84FF', bg: 'rgba(10,132,255,0.40)' },
  { key: 'pink',   swatch: '#FF375F', bg: 'rgba(255,55,95,0.40)'  },
  { key: 'purple', swatch: '#BF5AF2', bg: 'rgba(191,90,242,0.40)' },
  { key: 'orange', swatch: '#FF9F0A', bg: 'rgba(255,159,10,0.40)' },
] as const;
type HLKey = (typeof HIGHLIGHT_COLORS)[number]['key'];

export default function VersesScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { bookId, bookName, chapter } = route.params;

  // Always-dark charcoal reader palette (fixed, regardless of app light/dark theme)
  const colors   = useColors();
  const BG       = '#111111';
  const SURFACE  = '#1A1A1A';
  const SURFACE2 = '#222222';
  const BORDER   = '#2A2A2A';
  const TEXT     = '#F0F0F0';
  const TEXT_MUTED = '#888888';
  const VNUM_CLR = colors.primary; // keep app-theme teal accent

  const bibleTranslation = useAppStore((s) => s.bibleTranslation);

  const [verses,    setVerses]    = useState<BibleVerse[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [retryKey,  setRetryKey]  = useState(0);
  const [selected,  setSelected]  = useState<Set<number>>(new Set());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [highlights, setHighlights] = useState<Record<number, string>>({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSelected(new Set());

    getVerses(bookId, chapter, bibleTranslation)
      .then(setVerses)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));

    void saveBiblePosition(`${bookName} ${chapter}`, chapter);
  }, [bookId, bookName, chapter, retryKey, bibleTranslation]);

  const toggleVerse = useCallback((verseNum: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(verseNum)) next.delete(verseNum);
      else                     next.add(verseNum);
      return next;
    });
  }, []);

  const hasSelection = selected.size > 0;

  function applyHighlight(key: HLKey) {
    const color = HIGHLIGHT_COLORS.find((c) => c.key === key);
    if (!color) return;
    setHighlights((prev) => {
      const next = { ...prev };
      selected.forEach((v) => { next[v] = color.bg; });
      return next;
    });
    setSelected(new Set());
    setPickerOpen(false);
  }

  function removeHighlights() {
    setHighlights((prev) => {
      const next = { ...prev };
      selected.forEach((v) => { delete next[v]; });
      return next;
    });
    setSelected(new Set());
    setPickerOpen(false);
  }

  const selectedVerseTexts = useMemo(() => {
    const sorted = [...selected].sort((a, b) => a - b);
    return sorted
      .map((vn) => {
        const v = verses.find((vv) => vv.verse === vn);
        return v ? v.text : '';
      })
      .filter(Boolean)
      .join(' ');
  }, [selected, verses]);

  const selectedReference = useMemo(() => {
    const sorted = [...selected].sort((a, b) => a - b);
    if (sorted.length === 0) return '';
    if (sorted.length === 1) return `${bookName} ${chapter}:${sorted[0]}`;
    return `${bookName} ${chapter}:${sorted[0]}-${sorted[sorted.length - 1]}`;
  }, [selected, bookName, chapter]);

  async function handleCopy() {
    if (!selectedVerseTexts) return;
    await Clipboard.setStringAsync(`"${selectedVerseTexts}" — ${selectedReference}`);
    setSelected(new Set());
  }

  async function handleShare() {
    if (!selectedVerseTexts) return;
    try {
      await Share.share({ message: `"${selectedVerseTexts}" — ${selectedReference} (KJV)` });
    } catch {
      /* dismissed */
    }
    setSelected(new Set());
  }

  function handleJournal() {
    if (!selectedVerseTexts) return;
    const prefill = { reference: selectedReference, text: selectedVerseTexts };
    setSelected(new Set());
    navigation.navigate('Journal', {
      screen: 'JournalHome',
      params: { prefill },
    });
  }

  function navigatePrev() {
    if (chapter > 1) navigation.replace('Verses', { bookId, bookName, chapter: chapter - 1 });
  }
  function navigateNext() {
    navigation.replace('Verses', { bookId, bookName, chapter: chapter + 1 });
  }

  const anySelectedHighlighted = useMemo(
    () => [...selected].some((v) => highlights[v] !== undefined),
    [selected, highlights],
  );

  const readerColors = useMemo(
    () => ({ ...DarkColors, primary: colors.primary, primaryLight: colors.primaryLight } as ColorScheme),
    [colors.primary, colors.primaryLight],
  );
  const styles = useMemo(() => buildStyles(readerColors), [readerColors]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.navBtn} onPress={() => { setSelected(new Set()); navigation.goBack(); }}>
          <Icon source="arrow-left" size={22} color={TEXT} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.titleBtn} onPress={() => navigation.navigate('Books')}>
          <Text style={styles.headerTitle} numberOfLines={1}>{bookName} {chapter}</Text>
          <Icon source="menu-down" size={18} color={TEXT_MUTED} />
        </TouchableOpacity>

        <View style={styles.navBtn}>
          {hasSelection && (
            <TouchableOpacity onPress={() => setSelected(new Set())} hitSlop={8}>
              <Icon source="close-circle-outline" size={22} color={TEXT_MUTED} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={VNUM_CLR} />
          <Text style={styles.loadingHint}>Fetching {bookName} {chapter}…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Icon source="wifi-off" size={44} color={TEXT_MUTED} />
          <Text style={styles.emptyText}>Could not load chapter</Text>
          <Text style={styles.emptySub}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => setRetryKey((k) => k + 1)}>
            <Icon source="refresh" size={16} color={VNUM_CLR} />
            <Text style={styles.retryBtnLabel}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => { if (!hasSelection) return; }}
        >
          <Text style={styles.bookLabel}>{bookName}</Text>
          <Text style={styles.chapterNum}>{chapter}</Text>

          {verses.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Icon source="book-off-outline" size={44} color={TEXT_MUTED} />
              <Text style={styles.emptyText}>Chapter not available</Text>
              <Text style={styles.emptySub}>No verses found. Check your connection and try again.</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => setRetryKey((k) => k + 1)}>
                <Icon source="refresh" size={16} color={VNUM_CLR} />
                <Text style={styles.retryBtnLabel}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.paragraph}>
              {verses.map((v) => {
                const hlBg  = highlights[v.verse];
                const isSel = selected.has(v.verse);
                return (
                  <Text key={v.id}>
                    <Text
                      style={[styles.verseNum, isSel && styles.verseNumSelected]}
                      onPress={() => toggleVerse(v.verse)}
                    >
                      {v.verse}{' '}
                    </Text>
                    <Text
                      style={[
                        styles.verseText,
                        hlBg  ? { backgroundColor: hlBg }
                             : isSel ? styles.verseTextSelected
                             : undefined,
                      ]}
                      onPress={() => toggleVerse(v.verse)}
                    >
                      {v.text}{' '}
                    </Text>
                  </Text>
                );
              })}
            </Text>
          )}
        </ScrollView>
      )}

      {!hasSelection && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
          <TouchableOpacity
            style={[styles.bottomBtn, chapter <= 1 && styles.bottomBtnDisabled]}
            onPress={navigatePrev}
            disabled={chapter <= 1}
          >
            <Icon source="chevron-left" size={24} color={chapter <= 1 ? TEXT_MUTED : TEXT} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomCenter} onPress={() => navigation.navigate('Books')}>
            <Text style={styles.bottomLabel}>{bookName} {chapter}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bottomBtn} onPress={navigateNext}>
            <Icon source="chevron-right" size={24} color={TEXT} />
          </TouchableOpacity>
        </View>
      )}

      {hasSelection && (
        <View style={[styles.toolbar, { paddingBottom: insets.bottom + 6 }]}>
          <Text style={styles.toolbarCount}>
            {selected.size} verse{selected.size > 1 ? 's' : ''} selected
          </Text>

          <View style={styles.toolbarActions}>
            <TouchableOpacity style={styles.toolBtn} onPress={() => setPickerOpen(true)}>
              <Icon source="marker" size={20} color={TEXT} />
              <Text style={styles.toolBtnLabel}>Highlight</Text>
            </TouchableOpacity>

            {anySelectedHighlighted && (
              <TouchableOpacity style={styles.toolBtn} onPress={removeHighlights}>
                <Icon source="eraser-variant" size={20} color={TEXT} />
                <Text style={styles.toolBtnLabel}>Clear</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.toolBtn} onPress={handleCopy}>
              <Icon source="content-copy" size={20} color={TEXT} />
              <Text style={styles.toolBtnLabel}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolBtn} onPress={handleShare}>
              <Icon source="share-variant-outline" size={20} color={TEXT} />
              <Text style={styles.toolBtnLabel}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolBtn} onPress={handleJournal}>
              <Icon source="notebook-edit-outline" size={20} color={VNUM_CLR} />
              <Text style={[styles.toolBtnLabel, { color: VNUM_CLR }]}>Journal</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPickerOpen(false)} />

        <View style={[styles.panel, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelRef}>{selectedReference}</Text>
            <TouchableOpacity onPress={() => setPickerOpen(false)} hitSlop={12}>
              <Icon source="close" size={20} color={TEXT_MUTED} />
            </TouchableOpacity>
          </View>

          <Text style={styles.panelSectionLabel}>CHOOSE HIGHLIGHT COLOR</Text>

          <View style={styles.swatchRow}>
            {HIGHLIGHT_COLORS.map((h) => (
              <TouchableOpacity
                key={h.key}
                style={[styles.swatch, { backgroundColor: h.swatch }]}
                onPress={() => applyHighlight(h.key)}
                activeOpacity={0.75}
              />
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
