import React, { useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Modal, StyleSheet, ActivityIndicator, Platform, Alert, Switch,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Notifications from 'expo-notifications';

import { useColors, Typography } from '../../theme';
import { getDailyVerse, getVerseForDay } from '../../services/dailyVerseService';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import { makeStyles } from './VerseOfDay.styles';

// ─── Theme accent colors per verse theme keyword ──────────────────────────────

const THEME_COLORS: Record<string, string> = {
  hope:       '#0D9488',
  peace:      '#3B82F6',
  courage:    '#EF4444',
  strength:   '#8B5CF6',
  trust:      '#F59E0B',
  love:       '#EC4899',
  grace:      '#C8A86A',
  healing:    '#10B981',
  guidance:   '#6366F1',
  faith:      '#0D9488',
  rest:       '#64748B',
  protection: '#1E40AF',
  justice:    '#D97706',
};

// ─── Verse share card (capturable) ───────────────────────────────────────────

const VCC = {
  bg:      '#FEFCF3',
  top:     '#0D4D3A',
  title:   '#1A1A1A',
  body:    '#374151',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  ref:     '#0D4D3A',
  accent:  '#C8A86A',
  surface: '#F5F0E8',
} as const;

const vcs = StyleSheet.create({
  card: {
    backgroundColor: VCC.bg,
    width: 360,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  band: {
    backgroundColor: VCC.top,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bandLeft:  { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 3 },
  bandRight: { color: 'rgba(255,255,255,0.6)', fontSize: 10, letterSpacing: 0.5 },
  body: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 14 },
  bigQuote: {
    fontSize: 52,
    color: VCC.accent,
    opacity: 0.5,
    lineHeight: 42,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 4,
  },
  verseText: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    color: VCC.body,
    lineHeight: 27,
    marginBottom: 18,
  },
  accentBar: { width: 28, height: 3, backgroundColor: VCC.accent, borderRadius: 2, marginBottom: 10 },
  verseRef:  { fontSize: 13, fontWeight: '700', color: VCC.ref, letterSpacing: 0.5 },
  footer: {
    backgroundColor: VCC.surface,
    borderTopWidth: 1,
    borderTopColor: VCC.border,
    paddingHorizontal: 20,
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft:  { fontSize: 9, color: VCC.muted },
  footerRight: { fontSize: 9, color: VCC.ref, fontWeight: '800', letterSpacing: 2 },
});

function VerseShareCard({ reference, text, date }: { reference: string; text: string; date: string }) {
  return (
    <View style={vcs.card}>
      <View style={vcs.band}>
        <Text style={vcs.bandLeft}>✦ DEVOVERSE</Text>
        <Text style={vcs.bandRight}>VERSE OF THE DAY</Text>
      </View>
      <View style={vcs.body}>
        <Text style={vcs.bigQuote}>"</Text>
        <Text style={vcs.verseText}>{text}</Text>
        <View style={vcs.accentBar} />
        <Text style={vcs.verseRef}>{reference}</Text>
      </View>
      <View style={vcs.footer}>
        <Text style={vcs.footerLeft}>{date}</Text>
        <Text style={vcs.footerRight}>DEVOVERSE</Text>
      </View>
    </View>
  );
}

// ─── Modal styles ─────────────────────────────────────────────────────────────

const ms = StyleSheet.create({
  overlay:       { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.75)' },
  sheet:         { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', paddingBottom: 32 },
  handle:        { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 12 },
  previewTitle:  { fontSize: 10, fontWeight: '700', letterSpacing: 1, textAlign: 'center', marginBottom: 4, paddingHorizontal: 20 },
  scroll:        { flexGrow: 1 },
  scrollContent: { alignItems: 'center', padding: 16, paddingBottom: 8 },
  btnRow:  { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1 },
  closeBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  closeTxt: { fontSize: 14, fontWeight: '600' },
  shareBtn: { flex: 2, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  shareTxt: { fontSize: 14, fontWeight: '700' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

const UPCOMING_DAYS = 7; // show next 7 days' verses

export default function VerseOfDayScreen() {
  const colors   = useColors();
  const styles   = makeStyles(colors);
  const navigation = useNavigation();

  const cardRef = useRef<View>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [capturing,     setCapturing]     = useState(false);
  const [notifEnabled,  setNotifEnabled]  = useState(false);

  const todayVerse = getDailyVerse();
  const today      = new Date();
  const todayLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const accentColor = THEME_COLORS[todayVerse.theme] ?? colors.primary;

  const upcomingVerses = Array.from({ length: UPCOMING_DAYS }, (_, i) => ({
    offset: i + 1,
    verse:  getVerseForDay(i + 1),
    date:   (() => {
      const d = new Date(today);
      d.setDate(today.getDate() + i + 1);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    })(),
  }));

  async function handleCaptureAndShare() {
    if (!cardRef.current || capturing) return;
    setCapturing(true);
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share Verse' });
      }
    } catch {
      // dismissed or unavailable
    } finally {
      setCapturing(false);
    }
  }

  async function toggleDailyReminder() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Please allow notifications in your device settings to receive daily verses.');
        return;
      }
      if (notifEnabled) {
        await Notifications.cancelAllScheduledNotificationsAsync();
        setNotifEnabled(false);
      } else {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '✦ Verse of the Day',
            body: `"${todayVerse.text}" — ${todayVerse.reference}`,
            sound: true,
          },
          trigger: { hour: 8, minute: 0, repeats: true } as any,
        });
        setNotifEnabled(true);
        Alert.alert('Daily Reminder Set', 'You\'ll receive your verse every morning at 8:00 AM.');
      }
    } catch {
      Alert.alert(
        'Daily verse reminders',
        'Daily verse notifications require a development build. Enable reminders in the Reminders screen.',
      );
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Off-screen capture target */}
      <View ref={cardRef} collapsable={false} style={{ position: 'absolute', left: -5000, top: 0 }}>
        <VerseShareCard reference={todayVerse.reference} text={todayVerse.text} date={todayLabel} />
      </View>

      <ScreenHeader title="Verse of the Day" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ─── Hero ─── */}
        <View style={styles.heroWrap}>
          <View style={styles.heroCap}>
            <View style={styles.heroDateCol}>
              <Text style={styles.heroDayLabel}>TODAY</Text>
              <Text style={styles.heroDate}>{todayLabel}</Text>
            </View>
            <View style={[styles.themeBadge, { borderColor: accentColor + '50' }]}>
              <Icon source="bookmark-outline" size={12} color={accentColor} />
              <Text style={[styles.themeBadgeText, { color: accentColor }]}>{todayVerse.theme.toUpperCase()}</Text>
            </View>
          </View>

          {/* Main verse card */}
          <View style={styles.verseCard}>
            <Text style={[styles.quoteDecor, { color: accentColor }]}>"</Text>
            <Text style={styles.verseText}>{todayVerse.text}"</Text>
            <View style={styles.verseRefRow}>
              <Icon source="book-open-variant" size={14} color={accentColor} />
              <Text style={[styles.verseRef, { color: accentColor }]}>{todayVerse.reference}</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={() => setShowShareModal(true)} activeOpacity={0.85}>
              <Icon source="image-outline" size={16} color={colors.textOnPrimary} />
              <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, notifEnabled && { borderColor: accentColor, backgroundColor: accentColor + '18' }]}
              onPress={toggleDailyReminder}
              activeOpacity={0.85}
            >
              <Icon source={notifEnabled ? 'bell-check' : 'bell-plus-outline'} size={16} color={notifEnabled ? accentColor : colors.textSecondary} />
              <Text style={[styles.actionBtnText, notifEnabled && { color: accentColor }]}>
                {notifEnabled ? 'Reminder On' : 'Remind Me'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Daily reminder banner ─── */}
        <View style={styles.notifBanner}>
          <View style={styles.notifIconWrap}>
            <Icon source="calendar-clock" size={20} color={colors.primary} />
          </View>
          <View style={styles.notifText}>
            <Text style={styles.notifTitle}>Daily verse at 8:00 AM</Text>
            <Text style={styles.notifSub}>Start every morning with scripture</Text>
          </View>
          <Switch
            value={notifEnabled}
            onValueChange={toggleDailyReminder}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={notifEnabled ? colors.textOnPrimary : colors.textMuted}
          />
        </View>

        {/* ─── Upcoming verses ─── */}
        <Text style={styles.sectionLabel}>COMING UP</Text>
        {upcomingVerses.map(({ offset, verse, date }) => (
          <View key={offset} style={styles.miniCard}>
            <View style={[styles.miniAccent, { backgroundColor: THEME_COLORS[verse.theme] ?? colors.primary }]} />
            <View style={styles.miniBody}>
              <Text style={styles.miniDay}>{date}</Text>
              <Text style={styles.miniVerse} numberOfLines={2}>{verse.text}</Text>
              <Text style={styles.miniRef}>{verse.reference}</Text>
              <View style={styles.miniTheme}>
                <Text style={styles.miniThemeText}>{verse.theme.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ─── Share Modal ─── */}
      <Modal visible={showShareModal} transparent animationType="slide" onRequestClose={() => setShowShareModal(false)}>
        <View style={ms.overlay}>
          <View style={[ms.sheet, { backgroundColor: colors.surface }]}>
            <View style={[ms.handle, { backgroundColor: colors.border }]} />
            <Text style={[ms.previewTitle, { color: colors.textMuted }]}>PREVIEW</Text>

            <ScrollView style={ms.scroll} contentContainerStyle={ms.scrollContent} showsVerticalScrollIndicator={false}>
              <VerseShareCard reference={todayVerse.reference} text={todayVerse.text} date={todayLabel} />
            </ScrollView>

            <View style={[ms.btnRow, { borderTopColor: colors.border }]}>
              <TouchableOpacity style={[ms.closeBtn, { borderColor: colors.border }]} onPress={() => setShowShareModal(false)}>
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
