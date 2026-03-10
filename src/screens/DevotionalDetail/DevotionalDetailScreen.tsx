import React, { useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  Modal, StyleSheet, ActivityIndicator, Platform,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { useColors } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import { HistoryStackParamList } from '../../navigation/types';
import { makeStyles } from './DevotionalDetail.styles';

type Nav = NativeStackNavigationProp<HistoryStackParamList>;
type Route = RouteProp<HistoryStackParamList, 'DevotionalDetail'>;

const TYPE_COLORS: Record<string, string> = {
  SOAP:   '#0D9488',
  MCPWA:  '#7C3AED',
  SWORD:  '#0891B2',
  Sermon: '#D97706',
  PRAY:   '#A855F7',
  ACTS:   '#10B981',
};

// ─── Card themes ──────────────────────────────────────────────────────────────

type CardTheme = {
  id: string; label: string; swatch: string;
  bg: string; header: string; title: string; body: string;
  muted: string; border: string; accent: string; surface: string; label_: string;
};

const CARD_THEMES: CardTheme[] = [
  { id: 'light',  label: 'Light',  swatch: '#E5E7EB',
    bg: '#FEFEFE',  header: '#0D9488', title: '#111827', body: '#374151',
    muted: '#9CA3AF', border: '#E5E7EB', accent: '#C8A86A', surface: '#F5F5F0', label_: '#0D9488' },
  { id: 'dark',   label: 'Dark',   swatch: '#1A1A2E',
    bg: '#1A1A2E',  header: '#0F3460', title: '#E2E8F0', body: '#CBD5E0',
    muted: '#718096', border: '#2D3748', accent: '#C8A86A', surface: '#16213E', label_: '#63B3ED' },
  { id: 'forest', label: 'Forest', swatch: '#1E3A2F',
    bg: '#1E3A2F',  header: '#145A32', title: '#E8F5E9', body: '#C8E6C9',
    muted: '#81C784', border: '#2E7D32', accent: '#FFD700', surface: '#1B5E20', label_: '#A5D6A7' },
  { id: 'purple', label: 'Purple', swatch: '#1E1B4B',
    bg: '#1E1B4B',  header: '#4C1D95', title: '#EDE9FE', body: '#DDD6FE',
    muted: '#A78BFA', border: '#4C1D95', accent: '#F59E0B', surface: '#312E81', label_: '#C4B5FD' },
  { id: 'sepia',  label: 'Sepia',  swatch: '#D4A27A',
    bg: '#FDF5E6',  header: '#8B4513', title: '#3E1F00', body: '#5C3317',
    muted: '#A0735C', border: '#DEB887', accent: '#8B4513', surface: '#FAF0D7', label_: '#8B4513' },
  { id: 'navy',   label: 'Navy',   swatch: '#0D1B2A',
    bg: '#0D1B2A',  header: '#1B3A6B', title: '#E8F4FD', body: '#B8D4E8',
    muted: '#6B9CC2', border: '#1E3A5F', accent: '#C8A86A', surface: '#0F2237', label_: '#93C5FD' },
];

// cs holds layout-only styles; colors are applied inline via the active CardTheme
const cs = StyleSheet.create({
  card: {
    width: 360,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  cardHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appLogo:     { width: 130, height: 38, resizeMode: 'contain' },
  typePill:    {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  typePillText: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },

  cardBody:  { padding: 20 },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 3,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  cardDate:  { fontSize: 11, marginBottom: 14, letterSpacing: 0.3 },
  accentBar: { width: 32, height: 3, borderRadius: 2, marginBottom: 16 },

  sLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 2, marginBottom: 5 },
  sText:  { fontSize: 12, lineHeight: 19, marginBottom: 14 },
  verseBox: {
    borderRadius: 6,
    padding: 12,
    marginBottom: 14,
  },
  verseText: {
    fontSize: 13,
    lineHeight: 21,
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  tagRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 14 },
  tagChip: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  tagChipText: { fontSize: 9 },

  cardFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft:  { fontSize: 9, letterSpacing: 0.3 },
  footerLogo:  { width: 110, height: 30, resizeMode: 'contain', opacity: 0.7 },
});

// ─── CardRow ─────────────────────────────────────────────────────────────────

function CardRow({ label, content, t }: { label: string; content?: string; t: CardTheme }) {
  if (!content?.trim()) return null;
  return (
    <>
      <Text style={[cs.sLabel, { color: t.label_ }]}>{label}</Text>
      <Text style={[cs.sText, { color: t.body }]}>{content}</Text>
    </>
  );
}

// ─── ShareCardContent ─────────────────────────────────────────────────────────

function ShareCardContent({ entry, entryType, t }: { entry: Record<string, any>; entryType: string; t: CardTheme }) {
  const date  = entryType === 'Sermon' ? entry.serviceDate : entry.date;
  const title = entryType === 'Sermon' ? (entry.title ?? 'Sermon Notes') : (entry.scripture ?? `${entryType} Study`);

  return (
    <View style={[cs.card, { backgroundColor: t.bg }]}>
      <View style={[cs.cardHeader, { backgroundColor: t.header }]}>
        <Image source={require('../../../assets/logotransparent1.png')} style={cs.appLogo} />
        <View style={cs.typePill}>
          <Text style={cs.typePillText}>{entryType.toUpperCase()}</Text>
        </View>
      </View>

      <View style={cs.cardBody}>
        <Text style={[cs.cardTitle, { color: t.title }]}>{title}</Text>
        <Text style={[cs.cardDate, { color: t.muted }]}>{date}</Text>
        <View style={[cs.accentBar, { backgroundColor: t.accent }]} />

        {entryType === 'SOAP' && (
          <>
            {entry.fullVerse ? (
              <View style={[cs.verseBox, { backgroundColor: t.surface, borderLeftColor: t.accent }]}>
                <Text style={[cs.verseText, { color: t.body }]}>"{entry.fullVerse}"</Text>
              </View>
            ) : null}
            <CardRow label="OBSERVATION"  content={entry.observation} t={t} />
            <CardRow label="APPLICATION"  content={entry.application} t={t} />
            <CardRow label="PRAYER"       content={entry.prayer}       t={t} />
          </>
        )}

        {entryType === 'MCPWA' && (
          <>
            <CardRow label="MESSAGE"      content={entry.message}     t={t} />
            <CardRow label="COMMAND"      content={entry.command}     t={t} />
            <CardRow label="PROMISE"      content={entry.promise}     t={t} />
            <CardRow label="WARNING"      content={entry.warning}     t={t} />
            <CardRow label="APPLICATION"  content={entry.application} t={t} />
          </>
        )}

        {entryType === 'SWORD' && (
          <>
            <CardRow label="WORD"         content={entry.word}        t={t} />
            <CardRow label="OBSERVATION"  content={entry.observation} t={t} />
            <CardRow label="RESPONSE"     content={entry.response}    t={t} />
            <CardRow label="DAILY LIVING" content={entry.dailyLiving} t={t} />
          </>
        )}

        {entryType === 'PRAY' && (
          <>
            {entry.fullVerse ? (
              <View style={[cs.verseBox, { backgroundColor: t.surface, borderLeftColor: t.accent }]}>
                <Text style={[cs.verseText, { color: t.body }]}>"{entry.fullVerse}"</Text>
              </View>
            ) : null}
            <CardRow label="PRAISE"  content={entry.praise}  t={t} />
            <CardRow label="REPENT"  content={entry.repent}  t={t} />
            <CardRow label="ASK"     content={entry.ask}     t={t} />
            <CardRow label="YIELD"   content={entry.yield_}  t={t} />
          </>
        )}

        {entryType === 'ACTS' && (
          <>
            {entry.fullVerse ? (
              <View style={[cs.verseBox, { backgroundColor: t.surface, borderLeftColor: t.accent }]}>
                <Text style={[cs.verseText, { color: t.body }]}>"{entry.fullVerse}"</Text>
              </View>
            ) : null}
            <CardRow label="ADORATION"    content={entry.adoration}    t={t} />
            <CardRow label="CONFESSION"   content={entry.confession}   t={t} />
            <CardRow label="THANKSGIVING" content={entry.thanksgiving} t={t} />
            <CardRow label="SUPPLICATION" content={entry.supplication} t={t} />
          </>
        )}

        {entryType === 'Sermon' && (
          <>
            {(entry.preacher || entry.church) && (
              <>
                <Text style={[cs.sLabel, { color: t.label_ }]}>PREACHER</Text>
                <Text style={[cs.sText,  { color: t.body   }]}>{[entry.preacher, entry.church].filter(Boolean).join(' · ')}</Text>
              </>
            )}
            {entry.mainScripture ? (
              <View style={[cs.verseBox, { backgroundColor: t.surface, borderLeftColor: t.accent }]}>
                <Text style={[cs.verseText, { color: t.body }]}>{entry.mainScripture}</Text>
              </View>
            ) : null}
            <CardRow label="NOTES" content={entry.notes} t={t} />
            {entry.tags?.length > 0 && (
              <View style={cs.tagRow}>
                {entry.tags.map((tag: string, i: number) => (
                  <View key={i} style={[cs.tagChip, { backgroundColor: t.surface }]}>
                    <Text style={[cs.tagChipText, { color: t.muted }]}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      <View style={[cs.cardFooter, { backgroundColor: t.surface, borderTopColor: t.border }]}>
        <Text style={[cs.footerLeft, { color: t.muted }]}>DevoVerse Devotional App</Text>
        <Image source={require('../../../assets/logotransparent1.png')} style={cs.footerLogo} />
      </View>
    </View>
  );
}

// ─── Detail section helper ────────────────────────────────────────────────────

function Section({
  label, content, verse = false, styles,
}: {
  label: string; content?: string; verse?: boolean;
  styles: ReturnType<typeof makeStyles>;
}) {
  if (!content?.trim()) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={verse ? styles.verseContent : styles.sectionContent}>{content}</Text>
    </View>
  );
}

// ─── Modal styles ─────────────────────────────────────────────────────────────

const ms = StyleSheet.create({
  overlay:     { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.75)' },
  sheet:       { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%', paddingBottom: 32 },
  handle:      { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 8 },
  themeLabel:  { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, paddingHorizontal: 16, marginBottom: 4 },
  swatchRow:   { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 10, alignItems: 'center' },
  swatch:      { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  swatchRing:  { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  previewTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  scroll:        { flexGrow: 1 },
  scrollContent: { alignItems: 'center', padding: 16, paddingBottom: 8 },
  btnRow:  { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1 },
  closeBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  closeTxt: { fontSize: 14, fontWeight: '600' },
  shareBtn: { flex: 2, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  shareTxt: { fontSize: 14, fontWeight: '700' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DevotionalDetailScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { entryId, entryType } = route.params;

  const cardRef = useRef<View>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(CARD_THEMES[0]);

  const soapEntries  = useAppStore((s) => s.soapEntries);
  const mcpwaEntries = useAppStore((s) => s.mcpwaEntries);
  const swordEntries = useAppStore((s) => s.swordEntries);
  const sermonNotes  = useAppStore((s) => s.sermonNotes);
  const prayEntries  = useAppStore((s) => s.prayEntries);
  const actsEntries  = useAppStore((s) => s.actsEntries);

  const entry = useMemo(() => {
    if (entryType === 'SOAP')   return soapEntries.find((e) => e.id === entryId) as Record<string, any> | undefined;
    if (entryType === 'MCPWA')  return mcpwaEntries.find((e) => e.id === entryId) as Record<string, any> | undefined;
    if (entryType === 'SWORD')  return swordEntries.find((e) => e.id === entryId) as Record<string, any> | undefined;
    if (entryType === 'PRAY')   return prayEntries.find((e) => e.id === entryId) as Record<string, any> | undefined;
    if (entryType === 'ACTS')   return actsEntries.find((e) => e.id === entryId) as Record<string, any> | undefined;
    return sermonNotes.find((e) => e.id === entryId) as Record<string, any> | undefined;
  }, [entryId, entryType, soapEntries, mcpwaEntries, swordEntries, sermonNotes, prayEntries, actsEntries]);

  async function handleCaptureAndShare() {
    if (!cardRef.current || capturing || !entry) return;
    setCapturing(true);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share Devotional' });
      }
    } catch {
      // dismissed or unavailable
    } finally {
      setCapturing(false);
    }
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Devotional" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Icon source="alert-circle-outline" size={40} color={colors.textSecondary} />
          <Text style={styles.notFoundText}>Entry not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const badgeColor = TYPE_COLORS[entryType] ?? colors.primary;
  const title = entryType === 'Sermon'
    ? (entry.title ?? 'Sermon Notes')
    : (entry.scripture ?? `${entryType} Entry`);
  const date = entryType === 'Sermon' ? entry.serviceDate : entry.date;

  return (
    <SafeAreaView style={styles.safe}>
      {/*
        Off-screen snapshot target — always in the tree so captureRef works
        reliably on both iOS and Android without waiting for a modal to render.
      */}
      <View
        ref={cardRef}
        collapsable={false}
        style={{ position: 'absolute', left: -5000, top: 0 }}
      >
        <ShareCardContent entry={entry} entryType={entryType} t={selectedTheme} />
      </View>

      <ScreenHeader
        title={entryType === 'Sermon' ? 'Sermon Notes' : `${entryType} Devotional`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Type badge + date */}
        <View style={styles.metaRow}>
          <View style={[styles.typeBadge, { backgroundColor: badgeColor }]}>
            <Text style={styles.typeText}>{entryType.toUpperCase()}</Text>
          </View>
          <Text style={styles.entryDate}>{date}</Text>
        </View>

        {/* Title */}
        <Text style={styles.titleText}>{title}</Text>

        {/* ─── SOAP ─── */}
        {entryType === 'SOAP' && (
          <>
            <Section label="SCRIPTURE REFERENCE" content={entry.scripture} styles={styles} />
            <Section label="FULL VERSE"           content={entry.fullVerse}   styles={styles} verse />
            <Section label="OBSERVATION"          content={entry.observation} styles={styles} />
            <Section label="APPLICATION"          content={entry.application} styles={styles} />
            <Section label="PRAYER"               content={entry.prayer}      styles={styles} />
          </>
        )}

        {/* ─── MCPWA ─── */}
        {entryType === 'MCPWA' && (
          <>
            <Section label="SCRIPTURE"   content={entry.scripture}   styles={styles} />
            <Section label="MESSAGE"     content={entry.message}     styles={styles} />
            <Section label="COMMAND"     content={entry.command}     styles={styles} />
            <Section label="PROMISE"     content={entry.promise}     styles={styles} />
            <Section label="WARNING"     content={entry.warning}     styles={styles} />
            <Section label="APPLICATION" content={entry.application} styles={styles} />
          </>
        )}

        {/* ─── SWORD ─── */}
        {entryType === 'SWORD' && (
          <>
            <Section label="SCRIPTURE"    content={entry.scripture}   styles={styles} />
            <Section label="WORD"         content={entry.word}        styles={styles} />
            <Section label="OBSERVATION"  content={entry.observation} styles={styles} />
            <Section label="RESPONSE"     content={entry.response}    styles={styles} />
            <Section label="DAILY LIVING" content={entry.dailyLiving} styles={styles} />
          </>
        )}

        {/* ─── Sermon ─── */}
        {entryType === 'Sermon' && (
          <>
            <Section label="PREACHER"        content={entry.preacher}       styles={styles} />
            <Section label="CHURCH"          content={entry.church}         styles={styles} />
            <Section label="MAIN SCRIPTURE"  content={entry.mainScripture}  styles={styles} />
            <Section label="NOTES"           content={entry.notes}          styles={styles} />
            {entry.tags?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>TAGS</Text>
                <View style={styles.tagRow}>
                  {entry.tags.map((tag: string, i: number) => (
                    <View key={i} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* ─── PRAY ─── */}
        {entryType === 'PRAY' && (
          <>
            <Section label="SCRIPTURE REFERENCE" content={entry.scripture} styles={styles} />
            <Section label="FULL VERSE"           content={entry.fullVerse} styles={styles} verse />
            <Section label="PRAISE"               content={entry.praise}   styles={styles} />
            <Section label="REPENT"               content={entry.repent}   styles={styles} />
            <Section label="ASK"                  content={entry.ask}      styles={styles} />
            <Section label="YIELD"                content={entry.yield_}   styles={styles} />
          </>
        )}

        {/* ─── ACTS ─── */}
        {entryType === 'ACTS' && (
          <>
            <Section label="SCRIPTURE REFERENCE" content={entry.scripture}    styles={styles} />
            <Section label="FULL VERSE"           content={entry.fullVerse}    styles={styles} verse />
            <Section label="ADORATION"            content={entry.adoration}    styles={styles} />
            <Section label="CONFESSION"           content={entry.confession}   styles={styles} />
            <Section label="THANKSGIVING"         content={entry.thanksgiving} styles={styles} />
            <Section label="SUPPLICATION"         content={entry.supplication} styles={styles} />
          </>
        )}

        {/* Share / Print button */}
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => setShowShareModal(true)}
          activeOpacity={0.85}
        >
          <Icon source="image-outline" size={18} color={colors.textOnPrimary} />
          <Text style={styles.shareBtnText}>Share / Print as Image</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ─── Share Preview Bottom Sheet ─── */}
      <Modal
        visible={showShareModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={ms.overlay}>
          <View style={[ms.sheet, { backgroundColor: colors.surface }]}>
            <View style={[ms.handle, { backgroundColor: colors.border }]} />

            {/* Theme picker */}
            <Text style={[ms.themeLabel, { color: colors.textMuted }]}>CARD STYLE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ms.swatchRow}>
              {CARD_THEMES.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setSelectedTheme(t)}
                  style={[ms.swatchRing, { borderColor: selectedTheme.id === t.id ? colors.primary : 'transparent' }]}
                >
                  <View style={[ms.swatch, { backgroundColor: t.swatch }]} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[ms.previewTitle, { color: colors.textMuted }]}>PREVIEW</Text>
            <ScrollView
              style={ms.scroll}
              contentContainerStyle={ms.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <ShareCardContent entry={entry} entryType={entryType} t={selectedTheme} />
            </ScrollView>

            <View style={[ms.btnRow, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[ms.closeBtn, { borderColor: colors.border }]}
                onPress={() => setShowShareModal(false)}
              >
                <Text style={[ms.closeTxt, { color: colors.textSecondary }]}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[ms.shareBtn, { backgroundColor: colors.primary }]}
                onPress={handleCaptureAndShare}
                disabled={capturing}
                activeOpacity={0.85}
              >
                {capturing ? (
                  <ActivityIndicator size="small" color={colors.textOnPrimary} />
                ) : (
                  <>
                    <Icon source="share-variant" size={16} color={colors.textOnPrimary} />
                    <Text style={[ms.shareTxt, { color: colors.textOnPrimary }]}>Share Image</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
