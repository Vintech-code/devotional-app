import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { HomeStackParamList } from '../../navigation/types';
import { useColors, Typography, Spacing, Radius } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import { READING_PLANS } from '../../services/readingPlanService';
import { saveUserReadingPlan } from '../../services/storageService';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const PLAN_ICONS: Record<string, string> = {
  'morning-devotion-21': 'weather-sunset',
  'gospels-30':          'book-open-variant',
  'psalms-proverbs-30':  'music-note',
  'nt-90':               'book-multiple',
};

const PLAN_COLORS: Record<string, string> = {
  'morning-devotion-21': '#F7884A',
  'gospels-30':          '#4A90D9',
  'psalms-proverbs-30':  '#9B59B6',
  'nt-90':               '#27AE60',
};

export default function ReadingPlansScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const navigation = useNavigation<Nav>();
  const readingPlans   = useAppStore((s) => s.readingPlans);
  const setReadingPlan = useAppStore((s) => s.setReadingPlan);

  async function handleStartPlan(planId: string) {
    const existing = readingPlans[planId];
    if (existing) {
      // Already started — just open it
      navigation.navigate('ReadingPlanDetail', { planId });
      return;
    }
    // Not yet started — create, save, then open
    const plan: import('../../types').UserReadingPlan = {
      planId,
      startedAt: Date.now(),
      completedDays: [],
    };
    setReadingPlan(plan);
    await saveUserReadingPlan(plan);
    navigation.navigate('ReadingPlanDetail', { planId });
  }

  // Show all plans that have been started, sorted by most recently started
  const activePlans = Object.values(readingPlans ?? {}).sort((a, b) => b.startedAt - a.startedAt);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Reading Plans" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ─── Active Plans ─── */}
        {activePlans.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>MY PLANS</Text>
            {activePlans.map((up) => {
              const plan = READING_PLANS.find((p) => p.id === up.planId);
              if (!plan) return null;
              const pct = Math.round(((up.completedDays ?? []).length / plan.durationDays) * 100);
              const accent = PLAN_COLORS[plan.id] ?? colors.primary;
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={styles.activeBanner}
                  onPress={() => navigation.navigate('ReadingPlanDetail', { planId: plan.id })}
                  activeOpacity={0.85}
                >
                  <View style={[styles.activeIconWrap, { backgroundColor: accent + '22' }]}>
                    <Icon source={PLAN_ICONS[plan.id] ?? 'book-open-variant'} size={28} color={accent} />
                  </View>
                  <View style={styles.activeBody}>
                    <Text style={styles.activeTitle}>{plan.title}</Text>
                    <View style={styles.progressBarTrack}>
                      <View style={[styles.progressBarFill, { width: `${pct}%` as `${number}%`, backgroundColor: accent }]} />
                    </View>
                    <Text style={styles.activeSub}>
                      {(up.completedDays ?? []).length} / {plan.durationDays} days · {pct}%
                    </Text>
                  </View>
                  <Icon source="chevron-right" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ─── All Plans ─── */}
        <Text style={styles.sectionLabel}>{activePlans.length > 0 ? 'ALL PLANS' : 'CHOOSE A PLAN'}</Text>

        {READING_PLANS.map((plan) => {
          const up     = readingPlans[plan.id];
          const isActive = !!up;
          const accent = PLAN_COLORS[plan.id] ?? colors.primary;
          return (
            <TouchableOpacity
              key={plan.id}
              style={styles.planCard}
              activeOpacity={0.85}
              onPress={() => { void handleStartPlan(plan.id); }}
            >
              <View style={[styles.planIconWrap, { backgroundColor: accent + '22' }]}>
                <Icon
                  source={PLAN_ICONS[plan.id] ?? 'book-open-variant'}
                  size={26}
                  color={accent}
                />
              </View>
              <View style={styles.planBody}>
                <View style={styles.planTitleRow}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  {isActive && (
                    <View style={[styles.activeBadge, { backgroundColor: accent + '22' }]}>
                      <Text style={[styles.activeBadgeText, { color: accent }]}>ACTIVE</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.planDesc} numberOfLines={2}>{plan.description}</Text>
                <Text style={styles.planDays}>{plan.durationDays} days</Text>
              </View>
              <Icon source="chevron-right" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    safe:      { flex: 1, backgroundColor: colors.background },
    container: { padding: Spacing.md, paddingBottom: Spacing.xxl },

    sectionLabel: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      color: colors.textMuted,
      letterSpacing: 1.5,
      marginBottom: Spacing.sm,
      marginTop: Spacing.md,
    },

    // Active plan banner
    activeBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      gap: Spacing.md,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.07,
      shadowRadius: 4,
    },
    activeIconWrap: {
      width: 52,
      height: 52,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeBody: { flex: 1 },
    activeTitle: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semiBold,
      color: colors.textPrimary,
      marginBottom: 6,
    },
    activeSub: {
      fontSize: Typography.size.xs,
      color: colors.textMuted,
      marginTop: 4,
    },
    progressBarTrack: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: Radius.full,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: 6,
      borderRadius: Radius.full,
    },

    // Plan cards
    planCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      gap: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    planIconWrap: {
      width: 48,
      height: 48,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    planBody:     { flex: 1 },
    planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 2 },
    planTitle: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semiBold,
      color: colors.textPrimary,
      flexShrink: 1,
    },
    activeBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: Radius.full,
    },
    activeBadgeText: { fontSize: 9, fontWeight: Typography.weight.bold, letterSpacing: 1 },
    planDesc: {
      fontSize: Typography.size.sm,
      color: colors.textSecondary,
      marginBottom: 2,
      lineHeight: 18,
    },
    planDays: {
      fontSize: Typography.size.xs,
      color: colors.textMuted,
      fontWeight: Typography.weight.medium,
    },
  });
