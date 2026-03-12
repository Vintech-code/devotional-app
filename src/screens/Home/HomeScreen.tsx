import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground, Image, Modal, Platform } from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useColors, Typography, Spacing, Radius } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { MainTabParamList, HomeStackParamList } from '../../navigation/types';
import { saveSelectedMethod } from '../../services/storageService';
import { getDailyVerse } from '../../services/dailyVerseService';
import { makeStyles } from './Home.styles';
import { READING_PLANS } from '../../services/readingPlanService';
import { sendImmediateReminder } from '../../services/notificationService';
import AppToast from '../../components/AppToast/AppToast';
import DailyBreadCustomizeSheet, { resolveFontFamily } from '../../components/DailyBreadCustomizeSheet/DailyBreadCustomizeSheet';

const DAILY_BREAD_IMAGES = [
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../../../assets/dailybread/Create_a_serene_minimal_and_cinematic_landscape_background_for_a_devotional_ap_20260308075354_01.png') as number,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../../../assets/dailybread/Create_a_serene_minimal_and_cinematic_landscape_background_for_a_devotional_ap_20260308075354_02.png') as number,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../../../assets/dailybread/Create_a_serene_minimal_and_cinematic_landscape_background_for_a_devotional_ap_20260308075356_03.png') as number,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../../../assets/dailybread/Create_a_serene_minimal_landscape_background_for_a_devotional_app_called_Daily_20260308075100_01.png') as number,
];

function getDailyBreadImage(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000);
  return DAILY_BREAD_IMAGES[dayOfYear % DAILY_BREAD_IMAGES.length];
}

function getPresetSource(presetIndex: number): number {
  if (presetIndex < 0) return getDailyBreadImage();
  return DAILY_BREAD_IMAGES[presetIndex] ?? getDailyBreadImage();
}

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>,
  BottomTabNavigationProp<MainTabParamList>
>;

// ─── Badge images for the 5 guided methods ───────────────────────────────────
const GUIDED_METHODS = [
  {
    id:    'MCPWA',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    badge: require('../../../assets/badges/mpcwa-method.png') as number,
    label: 'MCPWA',
  },
  {
    id:    'PRAY',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    badge: require('../../../assets/badges/pray-method.png') as number,
    label: 'PRAY',
  },
  {
    id:    'ACTS',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    badge: require('../../../assets/badges/acts-method.png') as number,
    label: 'ACTS',
  },
  {
    id:    'SWORD',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    badge: require('../../../assets/badges/sword-method.png') as number,
    label: 'SWORD',
  },
  {
    id:    'SERMON',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    badge: require('../../../assets/badges/sermon.png') as number,
    label: 'Sermon',
  },
] as const;

export default function HomeScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const navigation = useNavigation<Nav>();
  const profile = useAppStore((s) => s.profile);
  const selectedMethod = useAppStore((s) => s.selectedMethod);
  const setSelectedMethod = useAppStore((s) => s.setSelectedMethod);
  const readingPlans = useAppStore((s) => s.readingPlans);
  const soapEntries  = useAppStore((s) => s.soapEntries);
  const mcpwaEntries = useAppStore((s) => s.mcpwaEntries);
  const swordEntries = useAppStore((s) => s.swordEntries);
  const prayEntries  = useAppStore((s) => s.prayEntries);
  const actsEntries  = useAppStore((s) => s.actsEntries);
  const dailyBreadCustom = useAppStore((s) => s.dailyBreadCustom);
  const verse = getDailyVerse();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const pendingAuthToast    = useAppStore((s) => s.pendingAuthToast);
  const clearPendingAuthToast = useAppStore((s) => s.clearPendingAuthToast);
  const [authSnackVisible, setAuthSnackVisible] = useState(false);

  useEffect(() => {
    if (pendingAuthToast) setAuthSnackVisible(true);
  }, [pendingAuthToast]);

  const todayKey = new Date().toLocaleDateString('en-CA');
  const completedToday = useMemo(() => {
    const allEntries = [
      ...soapEntries, ...mcpwaEntries, ...swordEntries, ...prayEntries, ...actsEntries,
    ];
    return allEntries.some(
      (e) => new Date(e.createdAt).toLocaleDateString('en-CA') === todayKey,
    );
  }, [soapEntries, mcpwaEntries, swordEntries, prayEntries, actsEntries, todayKey]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  const nextSession = (() => {
    const hour = new Date().getHours();
    if (hour < 9)  return 'Morning Reflection';
    if (hour < 17) return 'Afternoon Devotional';
    return 'Evening Reflection';
  })();

  const METHOD_DURATIONS: Record<string, string> = {
    SOAP: '45 min', MCPWA: '60 min', SWORD: '35 min', PRAY: '30 min', ACTS: '30 min', SERMON: '60 min',
  };
  const methodDuration = METHOD_DURATIONS[selectedMethod] ?? '60 min';

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ─── Notification Drawer ─── */}
      <Modal
        visible={drawerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setDrawerOpen(false)}
      >
        <TouchableOpacity
          style={styles.drawerOverlay}
          activeOpacity={1}
          onPress={() => setDrawerOpen(false)}
        >
          {/* Inner touchable prevents the overlay tap from closing when tapping inside */}
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.drawerContainer}>
            <View style={styles.drawerHandle} />
            <Text style={styles.drawerTitle}>Notifications</Text>

            <View style={styles.notifCard}>
              <View style={styles.notifIconWrap}>
                <Icon
                  source={completedToday ? 'check-circle' : 'book-open-variant'}
                  size={28}
                  color={completedToday ? '#22c55e' : colors.primary}
                />
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>
                  {completedToday ? 'Devotional Complete!' : 'Daily Devotional'}
                </Text>
                <Text style={styles.notifDesc}>
                  {completedToday
                    ? "Great job! You've completed your devotional for today."
                    : "You haven't completed your devotional today. Take a few minutes to reflect."}
                </Text>
              </View>
            </View>

            {!completedToday && (
              <View style={styles.drawerActions}>
                <TouchableOpacity
                  style={styles.startBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    setDrawerOpen(false);
                    navigation.navigate('Journal', { screen: 'JournalHome' });
                  }}
                >
                  <Text style={styles.startBtnText}>Start Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.remindBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    void sendImmediateReminder(
                      'Time to Reflect',
                      "Don't forget your daily devotional!",
                    );
                    setDrawerOpen(false);
                  }}
                >
                  <Text style={styles.remindBtnText}>Remind Me Later</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ─── Header ─── */}
      <View style={styles.header}>
        <Image
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          source={require('../../../assets/logotransparent1.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={[styles.bellBtn, styles.bellWrapper]}
          onPress={() => setDrawerOpen(true)}
        >
          <Icon source="bell" size={20} color={colors.textPrimary} />
          {!completedToday && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>1</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Greeting ─── */}
        <View style={styles.greetingRow}>
          <Text style={styles.greetingText}>
            {greeting},{' '}
            <Text style={styles.greetingName}>{profile?.name?.split(' ')[0] ?? 'Friend'}</Text>
          </Text>
        </View>

        {/* ─── Today's Mission ─── */}
        <Text style={styles.sectionLabel}>TODAY'S MISSION</Text>
        <TouchableOpacity
          style={styles.missionCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Journal', { screen: 'JournalHome' })}
        >
          <View style={styles.missionLeft}>
            <Text style={styles.missionTitle}>Start Daily Devotional</Text>
            <Text style={styles.missionSub}>{selectedMethod} Method {'\u00B7'} {methodDuration}</Text>
          </View>
          <View style={styles.missionArrow}>
            <Icon source="chevron-right" size={18} color={colors.textPrimary} />
          </View>
        </TouchableOpacity>

        {/* ─── Guided Methods ─── */}
        <Text style={styles.sectionLabel}>GUIDED METHODS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.methodsRow}
        >
          {GUIDED_METHODS.map((m) => {
            const isActive = m.id === selectedMethod;
            return (
              <TouchableOpacity
                key={m.id}
                style={styles.methodItem}
                activeOpacity={0.8}
                onPress={() => {
                  const nextMethod = m.id as 'MCPWA' | 'PRAY' | 'ACTS' | 'SWORD' | 'SERMON';
                  void (async () => {
                    setSelectedMethod(nextMethod);
                    await saveSelectedMethod(nextMethod);
                  })();
                }}
              >
                <Image
                  source={m.badge}
                  style={[
                    styles.methodBadge,
                    isActive && styles.methodBadgeActive,
                  ]}
                  resizeMode="contain"
                />
                <Text style={[
                  styles.methodLabel,
                  isActive && styles.methodLabelActive,
                ]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ─── Inspiration ─── */}
        <View style={styles.verseSectionHeader}>
          <Text style={styles.sectionLabel}>INSPIRATION</Text>
          <TouchableOpacity
            style={styles.customizeIconBtn}
            onPress={() => setShowCustomize(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon source="palette-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ─── Verse card (dynamic background) ─── */}
        {(() => {
          const { bgType, bgColor, bgPhotoUri, presetIndex, fontKey, fontSize } = dailyBreadCustom;
          const verseTextStyle = {
            fontFamily: resolveFontFamily(fontKey),
            fontSize,
            lineHeight: fontSize * 1.75,
          };
          const inner = (
            <View style={styles.verseCardOverlay}>
              <View style={styles.verseMeta}>
                <Text style={styles.breadTitle}>Daily Bread</Text>
                <Text style={styles.breadDate}>{today}</Text>
              </View>
              <Text style={[styles.verseText, verseTextStyle]}>
                {`"${verse.text}"`}
              </Text>
              <View style={styles.verseRefRow}>
                <View style={styles.verseRefLeft}>
                  <Text style={styles.verseRef}>{verse.reference}</Text>
                  <Text style={styles.verseBibleVersion}>NIV</Text>
                </View>
                <View style={styles.verseRefRight}>
                  <Icon source="heart-outline" size={16} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.verseExplore}>Explore →</Text>
                </View>
              </View>
            </View>
          );

          if (bgType === 'color') {
            return (
              <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('VerseOfDay')}>
                <View style={[styles.verseCard, { backgroundColor: bgColor, overflow: 'hidden' }]}>
                  {inner}
                </View>
              </TouchableOpacity>
            );
          }

          const bgSource = bgType === 'photo' && bgPhotoUri
            ? { uri: bgPhotoUri }
            : getPresetSource(presetIndex);

          return (
            <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('VerseOfDay')}>
              <ImageBackground
                source={bgSource as number}
                style={styles.verseCard}
                imageStyle={styles.verseCardImg}
                resizeMode="cover"
              >
                {inner}
              </ImageBackground>
            </TouchableOpacity>
          );
        })()}

        <DailyBreadCustomizeSheet
          visible={showCustomize}
          onClose={() => setShowCustomize(false)}
        />

        <Text style={styles.sectionLabel}>MY PROGRESS</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressItem}>
            <Icon source="fire" size={26} color={colors.textPrimary} />
            <Text style={styles.progressNum}>{profile?.dayStreak ?? 0}</Text>
            <Text style={styles.progressLabel}>DAY STREAK</Text>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressItem}>
            <Icon source="book-multiple" size={26} color={colors.textPrimary} />
            <Text style={styles.progressNum}>{profile?.completedCount ?? 0}</Text>
            <Text style={styles.progressLabel}>COMPLETED</Text>
          </View>
        </View>

        {/* ─── Reading Plan ─── */}
        <Text style={styles.sectionLabel}>READING PLAN</Text>
        {(() => {
          // Pick the most recently started plan to show in the card
          const allActive = Object.values(readingPlans).sort((a, b) => b.startedAt - a.startedAt);
          const latest = allActive[0];
          if (!latest) {
            return (
              <TouchableOpacity
                style={styles.planCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('ReadingPlans')}
              >
                <Icon source="book-multiple" size={22} color={colors.textPrimary} />
                <View style={styles.planBody}>
                  <Text style={styles.planTitle}>Start a Reading Plan</Text>
                  <Text style={styles.planSub}>Choose a structured Bible reading journey</Text>
                </View>
                <Icon source="chevron-right" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            );
          }
          const plan = READING_PLANS.find((p) => p.id === latest.planId);
          const pct  = plan ? Math.round(((latest.completedDays ?? []).length / plan.durationDays) * 100) : 0;
          return (
            <TouchableOpacity
              style={styles.planCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ReadingPlans')}
            >
              <Icon source="book-multiple" size={22} color={colors.textPrimary} />
              <View style={styles.planBody}>
                <Text style={styles.planTitle}>{plan?.title ?? 'Reading Plan'}</Text>
                <View style={styles.planBarTrack}>
                  <View style={[styles.planBarFill, { width: `${pct}%` as `${number}%` }]} />
                </View>
                <Text style={styles.planSub}>
                  {(latest.completedDays ?? []).length}/{plan?.durationDays ?? '?'} days · {pct}%{allActive.length > 1 ? ` · ${allActive.length} plans` : ''}
                </Text>
              </View>
              <Icon source="chevron-right" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          );
        })()}

        {/* ─── Next Session ─── */}
        <Text style={styles.sectionLabel}>NEXT SESSION</Text>
        <TouchableOpacity
          style={styles.nextCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Journal', { screen: 'JournalHome' })}
        >
          <View style={styles.nextIconWrap}>
            <Icon source="moon-waning-crescent" size={24} color={colors.textPrimary} />
          </View>
          <View style={styles.nextBody}>
            <Text style={styles.nextTitle}>{nextSession}</Text>
            <Text style={styles.nextSub}>Keep your streak going!</Text>
          </View>
          <Icon source="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </ScrollView>

      <AppToast
        visible={authSnackVisible}
        emoji="👋"
        title="Welcome back!"
        message={pendingAuthToast ?? ''}
        onDismiss={() => {
          setAuthSnackVisible(false);
          clearPendingAuthToast();
        }}
      />
    </SafeAreaView>
  );
}
