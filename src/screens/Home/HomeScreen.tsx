import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground, Image } from 'react-native';
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

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>,
  BottomTabNavigationProp<MainTabParamList>
>;

const GUIDED_METHODS = [
  { id: 'SOAP',  icon: 'pencil',  label: 'SOAP'  },
  { id: 'MCPWA', icon: 'shield',  label: 'MCPWA' },
  { id: 'SWORD', icon: 'sword',   label: 'SWORD' },
];

export default function HomeScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const navigation = useNavigation<Nav>();
  const profile = useAppStore((s) => s.profile);
  const selectedMethod = useAppStore((s) => s.selectedMethod);
  const setSelectedMethod = useAppStore((s) => s.setSelectedMethod);
  const readingPlans = useAppStore((s) => s.readingPlans);
  const verse = getDailyVerse();

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
    SOAP: '15 min', MCPWA: '20 min', SWORD: '15 min',
  };
  const methodDuration = METHOD_DURATIONS[selectedMethod] ?? '15 min';

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <Image
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          source={require('../../../assets/logotransparent1.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Profile')}>
          <Icon source="bell" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
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
          {GUIDED_METHODS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.methodItem}
              activeOpacity={0.8}
              onPress={() => {
                void (async () => {
                  const nextMethod = m.id as 'SOAP' | 'MCPWA' | 'SWORD';
                  setSelectedMethod(nextMethod);
                  await saveSelectedMethod(nextMethod);
                })();
              }}
            >
              <View style={[
                styles.methodCircle,
                m.id === selectedMethod && styles.methodCircleActive,
              ]}>
                <Icon source={m.icon} size={22} color={m.id === selectedMethod ? colors.textOnPrimary : colors.textPrimary} />
              </View>
              <Text style={[
                styles.methodLabel,
                m.id === selectedMethod && styles.methodLabelActive,
              ]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ─── Inspiration ─── */}
        <Text style={styles.sectionLabel}>INSPIRATION</Text>
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('VerseOfDay')}>
          <ImageBackground
            source={getDailyBreadImage()}
            style={styles.verseCard}
            imageStyle={styles.verseCardImg}
            resizeMode="cover"
          >
            <View style={styles.verseCardOverlay}>
              <View style={styles.verseMeta}>
                <Text style={styles.breadTitle}>Daily Bread</Text>
                <Text style={styles.breadDate}>{today}</Text>
              </View>
              <Text style={styles.verseText}>
                {`"${verse.text}"`}
              </Text>
              <View style={styles.verseRefRow}>
                <Text style={styles.verseRef}>{verse.reference}</Text>
                <View style={styles.verseRefRight}>
                  <Icon source="heart-outline" size={16} color="rgba(255,255,255,0.85)" />
                  <Text style={styles.verseExplore}>Explore →</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
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
    </SafeAreaView>
  );
}
