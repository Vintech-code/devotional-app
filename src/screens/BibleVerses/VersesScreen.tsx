/**
 * YouVersion-style reader:
 *  - Charcoal dark background (screen-local, not from app theme)
 *  - Tap verse number OR text to add to selection set (multi-select)
 *  - Sticky bottom toolbar appears while verses are selected — does NOT cover screen
 *  - Pick a highlight color → all selected verses get that color → toolbar clears
 *  - Copy / Share / Journal buttons in the toolbar
 *  - Journal button navigates to Journal tab pre-filled with selected verse(s)
 */

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import { Icon } from 'react-native-paper';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
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
  const [shareCardOpen, setShareCardOpen] = useState(false);
  const [capturing,    setCapturing]    = useState(false);
  const shareCardRef  = useRef<View>(null);
  const ttsCancelRef   = useRef(false);

  const [ttsIdx, setTtsIdx] = useState(-1);
  const isListening = ttsIdx >= 0;

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

  // Stop TTS when the chapter changes
  useEffect(() => {
    ttsCancelRef.current = true;
    Speech.stop();
    setTtsIdx(-1);
  }, [bookId, chapter]);

  // Stop TTS on unmount
  useEffect(() => {
    return () => {
      ttsCancelRef.current = true;
      Speech.stop();
    };
  }, []);

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

  async function handleShareCard() {
    setShareCardOpen(true);
  }

  async function captureAndShare() {
    if (!shareCardRef.current || capturing) return;
    setCapturing(true);
    try {
      const uri = await captureRef(shareCardRef, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share Verse Card' });
      }
    } catch {
      /* dismissed */
    } finally {
      setCapturing(false);
    }
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

  function startTts(idx: number) {
    if (ttsCancelRef.current || idx >= verses.length) { setTtsIdx(-1); return; }
    setTtsIdx(idx);
    Speech.speak(verses[idx].text, {
      rate: 0.9,
      onDone:  () => { if (!ttsCancelRef.current) startTts(idx + 1); },
      onError: () => { if (!ttsCancelRef.current) setTtsIdx(-1); },
    });
  }

  function stopTts() {
    ttsCancelRef.current = true;
    Speech.stop();
    setTtsIdx(-1);
  }

  function toggleListen() {
    if (isListening) { stopTts(); return; }
    if (verses.length > 0) {
      ttsCancelRef.current = false;
      startTts(0);
    }
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
          {hasSelection ? (
            <TouchableOpacity onPress={() => setSelected(new Set())} hitSlop={8}>
              <Icon source="close-circle-outline" size={22} color={TEXT_MUTED} />
            </TouchableOpacity>
          ) : !loading && verses.length > 0 ? (
            <TouchableOpacity onPress={toggleListen} hitSlop={8}>
              <Icon
                source={isListening ? 'stop-circle-outline' : 'headphones'}
                size={22}
                color={isListening ? VNUM_CLR : TEXT_MUTED}
              />
            </TouchableOpacity>
          ) : null}
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
                const hlBg      = highlights[v.verse];
                const isSel     = selected.has(v.verse);
                const isSpeaking = isListening && verses[ttsIdx]?.verse === v.verse;
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
                        isSpeaking ? { backgroundColor: 'rgba(78,205,196,0.18)' }
                                   : hlBg  ? { backgroundColor: hlBg }
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

      {isListening && (
        <View style={audioBar.bar}>
          <Icon source="headphones" size={16} color={VNUM_CLR} />
          <Text style={audioBar.label} numberOfLines={1}>
            {verses[ttsIdx]
              ? `${bookName} ${chapter}:${verses[ttsIdx].verse}  ·  ${ttsIdx + 1} of ${verses.length}`
              : 'Reading…'}
          </Text>
          <TouchableOpacity onPress={stopTts} hitSlop={8}>
            <Icon source="stop-circle-outline" size={26} color="#FF453A" />
          </TouchableOpacity>
        </View>
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

            <TouchableOpacity style={styles.toolBtn} onPress={handleShareCard}>
              <Icon source="image-outline" size={20} color={VNUM_CLR} />
              <Text style={[styles.toolBtnLabel, { color: VNUM_CLR }]}>Card</Text>
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

      {/* ─── Share Card Modal ──────────────────────────────────────────────── */}
      <Modal
        visible={shareCardOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setShareCardOpen(false)}
      >
        <View style={scm.overlay}>
          <View style={scm.sheet}>
            <View style={scm.handle} />
            <Text style={scm.previewLabel}>PREVIEW</Text>

            <ScrollView contentContainerStyle={scm.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Capturable card */}
              <View ref={shareCardRef} collapsable={false} style={scm.card}>
                <View style={scm.band}>
                  <Image source={require('../../../assets/logo.png')} style={scm.bandLogo} />
                  <Text style={scm.bandRight}>VERSE CARD</Text>
                </View>
                <View style={scm.body}>
                  <Text style={scm.bigQuote}>“</Text>
                  <Text style={scm.verseText}>{selectedVerseTexts}</Text>
                  <View style={scm.accentBar} />
                  <Text style={scm.verseRef}>{selectedReference}</Text>
                </View>
                <View style={scm.footer}>
                  <Text style={scm.footerLeft}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                  <Image source={require('../../../assets/logo.png')} style={scm.footerLogo} />
                </View>
              </View>
            </ScrollView>

            <View style={scm.btnRow}>
              <TouchableOpacity
                style={scm.closeBtn}
                onPress={() => { setShareCardOpen(false); setSelected(new Set()); }}
              >
                <Text style={scm.closeTxt}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[scm.shareBtn, { backgroundColor: VNUM_CLR }]}
                onPress={captureAndShare}
                disabled={capturing}
                activeOpacity={0.85}
              >
                {capturing
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <>
                      <Icon source="share-variant" size={16} color="#fff" />
                      <Text style={scm.shareTxt}>Share Image</Text>
                    </>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Share Card Modal Styles ────────────────────────────────────────────────────────

const scm = StyleSheet.create({
  overlay:      { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' },
  sheet: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 16, paddingBottom: 32, maxHeight: '85%',
  },
  handle:       { width: 36, height: 4, borderRadius: 2, backgroundColor: '#444', alignSelf: 'center', marginTop: 10, marginBottom: 12 },
  previewLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textAlign: 'center', color: '#888', marginBottom: 12 },
  scrollContent:{ alignItems: 'center', paddingBottom: 8 },

  // Card design
  card: {
    width: 320, backgroundColor: '#FEFCF3',
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    elevation: 8,
  },
  band: {
    backgroundColor: '#0D4D3A',
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  bandLeft:  { fontSize: 9, fontWeight: '700', color: '#C8A86A', letterSpacing: 2 },
  bandLogo:  { width: 130, height: 38, resizeMode: 'contain' },
  bandRight: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 2 },
  body:      { padding: 24, paddingTop: 16 },
  bigQuote:  { fontSize: 56, color: '#C8A86A', lineHeight: 48, marginBottom: 4, fontFamily: 'serif' },
  verseText: { fontSize: 15, color: '#374151', lineHeight: 22, fontStyle: 'italic', marginBottom: 16 },
  accentBar: { height: 2, width: 40, backgroundColor: '#C8A86A', marginBottom: 10 },
  verseRef:  { fontSize: 13, fontWeight: '800', color: '#0D4D3A', letterSpacing: 0.5 },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#F5F0E8',
  },
  footerLeft:  { fontSize: 9, color: '#9CA3AF' },
  footerLogo:  { width: 110, height: 30, resizeMode: 'contain', opacity: 0.7 },
  footerRight: { fontSize: 9, color: '#0D4D3A', fontWeight: '800', letterSpacing: 2 },

  // Buttons
  btnRow:   { flexDirection: 'row', gap: 10, marginTop: 16 },
  closeBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#444' },
  closeTxt: { fontSize: 14, fontWeight: '600', color: '#aaa' },
  shareBtn: { flex: 2, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  shareTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

// ─── Audio Player Bar ─────────────────────────────────────────────────────────
const audioBar = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  label: {
    flex: 1,
    fontSize: 12,
    color: '#B0B0B0',
    fontWeight: '500',
  },
});
