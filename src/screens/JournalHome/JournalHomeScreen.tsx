import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { JournalStackParamList } from '../../navigation/types';
import { useColors, Spacing } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { makeStyles } from './JournalHome.styles';

type Nav = NativeStackNavigationProp<JournalStackParamList>;
type JournalHomeRoute = RouteProp<JournalStackParamList, 'JournalHome'>;

const METHODS = [
  {
    key: 'SOAP',
    screen: 'SoapJournal' as keyof JournalStackParamList,
    title: 'SOAP Method',
    acronym: 'S · O · A · P',
    steps: 'Scripture  ·  Observation  ·  Application  ·  Prayer',
    duration: '10–15 min',
    accent: '#00ACAA',
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    image: require('../../../assets/cards/soap.png') as number,
  },
  {
    key: 'MCPWA',
    screen: 'McpwaJournal' as keyof JournalStackParamList,
    title: 'MCPWA Method',
    acronym: 'M · C · P · W · A',
    steps: 'Message  ·  Command  ·  Promise  ·  Warning  ·  Application',
    duration: '15–20 min',
    accent: '#5A82B8',
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    image: require('../../../assets/cards/mcpwa.jpg') as number,
  },
  {
    key: 'SWORD',
    screen: 'SwordJournal' as keyof JournalStackParamList,
    title: 'SWORD Method',
    acronym: 'S · W · O · R · D',
    steps: 'Scripture  ·  Word  ·  Observation  ·  Response  ·  Daily Living',
    duration: '15–20 min',
    accent: '#C8A86A',
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    image: require('../../../assets/cards/sword.png') as number,
  },
  {
    key: 'PRAY',
    screen: 'PrayJournal' as keyof JournalStackParamList,
    title: 'PRAY Method',
    acronym: 'P · R · A · Y',
    steps: 'Praise  ·  Repent  ·  Ask  ·  Yield',
    duration: '10–15 min',
    accent: '#A855F7',
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    image: require('../../../assets/cards/pray.png') as number,
  },
  {
    key: 'ACTS',
    screen: 'ActsJournal' as keyof JournalStackParamList,
    title: 'ACTS Method',
    acronym: 'A · C · T · S',
    steps: 'Adoration  ·  Confession  ·  Thanksgiving  ·  Supplication',
    duration: '10–15 min',
    accent: '#10B981',
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    image: require('../../../assets/cards/acts.png') as number,
  },
  {
    key: 'SERMON',
    screen: 'SermonNotes' as keyof JournalStackParamList,
    title: 'Sermon Notes',
    acronym: 'N · O · T · E',
    steps: 'Title & Preacher  ·  Main Scripture  ·  Key Points  ·  Application',
    duration: '5–10 min',
    accent: '#8B7BF0',
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    image: require('../../../assets/cards/sermon.png') as number,
  },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function JournalHomeScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const navigation = useNavigation<Nav>();
  const route = useRoute<JournalHomeRoute>();
  const prefill      = route.params?.prefill;
  const soapEntries  = useAppStore((s) => s.soapEntries);
  const mcpwaEntries = useAppStore((s) => s.mcpwaEntries);
  const swordEntries = useAppStore((s) => s.swordEntries);
  const sermonNotes  = useAppStore((s) => s.sermonNotes);
  const prayEntries  = useAppStore((s) => s.prayEntries);
  const actsEntries  = useAppStore((s) => s.actsEntries);
  const profile      = useAppStore((s) => s.profile);

  const totalEntries = soapEntries.length + mcpwaEntries.length + swordEntries.length + sermonNotes.length + prayEntries.length + actsEntries.length;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const recentEntries = useMemo(() => {
    const all = [
      ...soapEntries.map((e)  => ({ id: e.id, method: 'SOAP',   label: e.scripture || e.date,       createdAt: e.createdAt, color: '#00ACAA' })),
      ...mcpwaEntries.map((e) => ({ id: e.id, method: 'MCPWA',  label: e.scripture || e.date,       createdAt: e.createdAt, color: '#5A82B8' })),
      ...swordEntries.map((e) => ({ id: e.id, method: 'SWORD',  label: e.scripture || e.date,       createdAt: e.createdAt, color: '#C8A86A' })),
      ...sermonNotes.map((e)  => ({ id: e.id, method: 'Sermon', label: e.title || e.serviceDate,    createdAt: e.createdAt, color: '#8B7BF0' })),
      ...prayEntries.map((e)  => ({ id: e.id, method: 'PRAY',   label: e.scripture || e.date,       createdAt: e.createdAt, color: '#A855F7' })),
      ...actsEntries.map((e)  => ({ id: e.id, method: 'ACTS',   label: e.scripture || e.date,       createdAt: e.createdAt, color: '#10B981' })),
    ];
    return all.sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
  }, [soapEntries, mcpwaEntries, swordEntries, sermonNotes, prayEntries, actsEntries]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Bible verse prefill banner ───────────────────────────────────── */}
        {prefill && (
          <View style={styles.prefillBanner}>
            <Icon source="book-open-variant" size={16} color={colors.primary} />
            <Text style={styles.prefillRef} numberOfLines={1}>{prefill.reference}</Text>
            <Text style={styles.prefillHint}>· Choose a method to journal</Text>
          </View>
        )}

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dateLabel}>{today.toUpperCase()}</Text>
            <Text style={styles.heading}>Devotional Journal</Text>
            <Text style={styles.greeting}>{getGreeting()}, {profile?.name ?? 'Friend'}</Text>
          </View>
          <View style={styles.streakBox}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakNum}>{profile?.dayStreak ?? 0}</Text>
            <Text style={styles.streakCaption}>day streak</Text>
          </View>
        </View>

        {/* ── Quick stats ─────────────────────────────────────────────────── */}
        <View style={styles.statsRow}>
          {[
            { n: totalEntries,          l: 'Total'   },
            { n: soapEntries.length,    l: 'SOAP'    },
            { n: mcpwaEntries.length,   l: 'MCPWA'   },
            { n: swordEntries.length,   l: 'SWORD'   },
            { n: prayEntries.length,    l: 'PRAY'    },
            { n: actsEntries.length,    l: 'ACTS'    },
            { n: sermonNotes.length,    l: 'Sermons' },
          ].map(({ n, l }) => (
            <View key={l} style={styles.statChip}>
              <Text style={styles.statChipNum}>{n}</Text>
              <Text style={styles.statChipLabel}>{l}</Text>
            </View>
          ))}
        </View>

        {/* ── Method cards (image-based) ─────────────────────────────────── */}
        <Text style={styles.sectionLabel}>CHOOSE A METHOD</Text>
        {METHODS.map((m) => (
          <TouchableOpacity
            key={m.key}
            activeOpacity={0.88}
            style={styles.imageCardWrap}
            onPress={() =>
              navigation.navigate(
                m.screen as 'SoapJournal',
                prefill ? { prefill } : {}
              )
            }
          >
            <ImageBackground
              source={m.image}
              style={styles.imageCard}
              imageStyle={styles.imageCardImg}
              resizeMode="cover"
            >
              {/* Full dark overlay covering whole image */}
              <View style={styles.imageCardOverlay}>
                <Text style={styles.imageCardTitle}>{m.title}</Text>
                <Text style={styles.imageCardSteps} numberOfLines={1}>{m.steps}</Text>
                <View style={styles.imageCardFooter}>
                  <View style={styles.imageCardDurationPill}>
                    <Icon source="clock-outline" size={11} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.imageCardDuration}>{m.duration}</Text>
                  </View>
                  <Text style={[styles.imageCardBegin, { color: m.accent }]}>Begin  →</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}

        {/* ── Prayer Journal card ─────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>PRAYER JOURNAL</Text>
        <TouchableOpacity
          style={styles.prayerCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('PrayerJournal')}
        >
          <View style={styles.prayerIconWrap}>
            <Icon source="hands-pray" size={26} color="#A855F7" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.prayerTitle}>Prayer Requests</Text>
            <Text style={styles.prayerSub}>Track your prayers · celebrate answered ones</Text>
          </View>
          <Icon source="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* ── Recent entries ───────────────────────────────────────────────── */}
        {recentEntries.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>RECENT ENTRIES</Text>
            {recentEntries.map((entry) => (
              <View key={entry.id} style={styles.recentRow}>
                <View style={[styles.recentDot, { backgroundColor: entry.color }]} />
                <View style={[styles.methodTag, { backgroundColor: entry.color + '22' }]}>
                  <Text style={[styles.methodTagText, { color: entry.color }]}>{entry.method}</Text>
                </View>
                <Text style={styles.recentLabel} numberOfLines={1}>{entry.label}</Text>
              </View>
            ))}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
