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
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
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

import { Spacing, Typography, useColors } from '../../theme';
import type { ColorScheme } from '../../theme/colors';
import { getVerses } from '../../services/bibleService';
import { useAppStore } from '../../store/useAppStore';
import { saveBiblePosition } from '../../services/storageService';
import type { BibleVerse } from '../../types/bible';
import type { BibleStackParamList, MainTabParamList } from '../../navigation/types';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<BibleStackParamList, 'Verses'>,
  BottomTabNavigationProp<MainTabParamList>
>;
type Route = RouteProp<BibleStackParamList, 'Verses'>;

// Screen-local YouVersion dark palette (follows app theme)
// BG, SURFACE, etc. are declared inside the component below

const SEL_TINT = 'rgba(78,205,196,0.20)'; // subtle tint while selected but no color chosen yet

const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

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

  // Theme-adaptive palette
  const colors = useColors();
  const BG       = colors.background;
  const SURFACE  = colors.surface;
  const SURFACE2 = colors.surfaceAlt;
  const BORDER   = colors.border;
  const TEXT     = colors.textPrimary;
  const TEXT_MUTED = colors.textSecondary;
  const VNUM_CLR = colors.primary;

  const bibleTranslation = useAppStore((s) => s.bibleTranslation);

  const [verses,    setVerses]    = useState<BibleVerse[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [retryKey,  setRetryKey]  = useState(0);
  const [selected,  setSelected]  = useState<Set<number>>(new Set());
  // Whether the highlight-color picker sheet is open
  const [pickerOpen, setPickerOpen] = useState(false);
  // verse number -> currently applied highlight bg color
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

  // Toggle a verse in/out of the selection set
  const toggleVerse = useCallback((verseNum: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(verseNum)) next.delete(verseNum);
      else                     next.add(verseNum);
      return next;
    });
  }, []);

  const hasSelection = selected.size > 0;

  // Apply one color to ALL selected verses
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

  // Remove highlights from all selected verses
  function removeHighlights() {
    setHighlights((prev) => {
      const next = { ...prev };
      selected.forEach((v) => { delete next[v]; });
      return next;
    });
    setSelected(new Set());
    setPickerOpen(false);
  }

  // Build a combined reference + text string for the selected verses
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
    } catch { /* dismissed */ }
    setSelected(new Set());
  }

  function handleJournal() {
    if (!selectedVerseTexts) return;
    const prefill = { reference: selectedReference, text: selectedVerseTexts };
    setSelected(new Set());
    // Navigate cross-tab to Journal → JournalHome with the verse prefilled
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

  // Are ALL currently-selected verses already highlighted?
  const anySelectedHighlighted = useMemo(
    () => [...selected].some((v) => highlights[v] !== undefined),
    [selected, highlights]
  );

  const styles = useMemo(() => buildStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
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

      {/* ── Content ────────────────────────────────────────────────────────── */}
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
            /* ── Flowing paragraph ──────────────────────────────────────────── */
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

      {/* ── Bottom chapter navigation ───────────────────────────────────────── */}
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

      {/* ── Selection toolbar (replaces chapter nav while verses are selected) ── */}
      {hasSelection && (
        <View style={[styles.toolbar, { paddingBottom: insets.bottom + 6 }]}>
          {/* Selection count badge */}
          <Text style={styles.toolbarCount}>
            {selected.size} verse{selected.size > 1 ? 's' : ''} selected
          </Text>

          <View style={styles.toolbarActions}>
            {/* Highlight */}
            <TouchableOpacity style={styles.toolBtn} onPress={() => setPickerOpen(true)}>
              <Icon source="marker" size={20} color={TEXT} />
              <Text style={styles.toolBtnLabel}>Highlight</Text>
            </TouchableOpacity>

            {/* Remove highlight — only if any selected verse has one */}
            {anySelectedHighlighted && (
              <TouchableOpacity style={styles.toolBtn} onPress={removeHighlights}>
                <Icon source="eraser-variant" size={20} color={TEXT} />
                <Text style={styles.toolBtnLabel}>Clear</Text>
              </TouchableOpacity>
            )}

            {/* Copy */}
            <TouchableOpacity style={styles.toolBtn} onPress={handleCopy}>
              <Icon source="content-copy" size={20} color={TEXT} />
              <Text style={styles.toolBtnLabel}>Copy</Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity style={styles.toolBtn} onPress={handleShare}>
              <Icon source="share-variant-outline" size={20} color={TEXT} />
              <Text style={styles.toolBtnLabel}>Share</Text>
            </TouchableOpacity>

            {/* Journal */}
            <TouchableOpacity style={styles.toolBtn} onPress={handleJournal}>
              <Icon source="notebook-edit-outline" size={20} color={VNUM_CLR} />
              <Text style={[styles.toolBtnLabel, { color: VNUM_CLR }]}>Journal</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Color picker Modal (appears over everything when "Highlight" tapped) ── */}
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

function buildStyles(c: ColorScheme) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    backgroundColor: c.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  titleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: c.textPrimary, fontFamily: SERIF },

  // ── Scroll content ──────────────────────────────────────────────────────────
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 80 },
  bookLabel: {
    fontSize: 12,
    color: c.textSecondary,
    fontFamily: SERIF,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  chapterNum: {
    fontSize: 88,
    fontWeight: '800',
    color: c.textPrimary,
    fontFamily: SERIF,
    textAlign: 'center',
    lineHeight: 96,
    marginBottom: 24,
  },

  // ── Verse text ──────────────────────────────────────────────────────────────
  paragraph: { fontSize: 19, fontFamily: SERIF, color: c.textPrimary, lineHeight: 35, letterSpacing: 0.15 },
  verseNum: { fontSize: 11, fontWeight: '700', color: c.primary, fontFamily: SERIF, lineHeight: 35 },
  verseNumSelected: { color: c.primary, fontWeight: '800' },
  verseText: { fontSize: 19, fontFamily: SERIF, color: c.textPrimary, lineHeight: 35 },
  // Dotted underline when selected but not yet highlighted (iOS: dotted; Android: plain underline)
  verseTextSelected: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: c.primary,
  },

  // ── Empty / error state ─────────────────────────────────────────────────────
  emptyWrap: { alignItems: 'center', paddingTop: 52, gap: 14 },
  emptyText: { fontSize: 16, fontWeight: '600', color: c.textSecondary, textAlign: 'center' },
  emptySub: { fontSize: 13, color: c.textSecondary, textAlign: 'center', lineHeight: 20 },
  loadingHint: { fontSize: 13, color: c.textSecondary, marginTop: 10 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: c.primary,
    marginTop: 4,
  },
  retryBtnLabel: { fontSize: 14, fontWeight: '600', color: c.primary },

  // ── Chapter pagination bar (visible when nothing is selected) ───────────────
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.border,
    paddingHorizontal: Spacing.sm,
    paddingTop: 10,
  },
  bottomBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBtnDisabled: { opacity: 0.3 },
  bottomCenter: { flex: 1, alignItems: 'center' },
  bottomLabel: { fontSize: 15, fontWeight: '700', color: c.textPrimary },

  // ── Multi-select sticky toolbar (replaces bottomBar while verses are selected)
  toolbar: {
    backgroundColor: c.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.border,
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  toolbarCount: {
    fontSize: 12,
    fontWeight: '600',
    color: c.primary,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  toolBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 52,
  },
  toolBtnLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: c.textPrimary,
    letterSpacing: 0.2,
  },

  // ── Color picker bottom sheet ────────────────────────────────────────────────
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  panel: {
    backgroundColor: c.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.border,
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 14,
  },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelRef: { fontSize: 14, fontWeight: '700', color: c.primary, letterSpacing: 0.3 },
  panelSectionLabel: { fontSize: 11, fontWeight: '700', color: c.textSecondary, letterSpacing: 1.5 },
  swatchRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingBottom: 4 },
  swatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  });
}
