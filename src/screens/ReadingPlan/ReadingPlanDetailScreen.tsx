import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { HomeStackParamList } from '../../navigation/types';
import { useColors, Typography, Spacing, Radius } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import { getPlanById } from '../../services/readingPlanService';
import { saveUserReadingPlan } from '../../services/storageService';

type Nav   = NativeStackNavigationProp<HomeStackParamList, 'ReadingPlanDetail'>;
type Route = RouteProp<HomeStackParamList, 'ReadingPlanDetail'>;

const PLAN_COLORS: Record<string, string> = {
  'morning-devotion-21': '#F7884A',
  'gospels-30':          '#4A90D9',
  'psalms-proverbs-30':  '#9B59B6',
  'nt-90':               '#27AE60',
};

export default function ReadingPlanDetailScreen() {
  const colors     = useColors();
  const styles     = makeStyles(colors);
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();

  const readingPlans   = useAppStore((s) => s.readingPlans);
  const setReadingPlan = useAppStore((s) => s.setReadingPlan);

  const plan   = getPlanById(params.planId);
  const accent = PLAN_COLORS[params.planId] ?? colors.primary;

  const userPlan: import('../../types').UserReadingPlan = readingPlans[params.planId] ?? {
    planId: params.planId,
    startedAt: Date.now(),
    completedDays: [],
  };

  const completedDays = userPlan.completedDays ?? [];

  const pct = plan
    ? Math.round((completedDays.length / plan.durationDays) * 100)
    : 0;

  const toggleDay = useCallback(async (day: number) => {
    const next = completedDays.includes(day)
      ? completedDays.filter((d) => d !== day)
      : [...completedDays, day].sort((a, b) => a - b);

    const updated = { ...userPlan, completedDays: next };
    setReadingPlan(updated);
    await saveUserReadingPlan(updated);
  }, [userPlan, completedDays, setReadingPlan]);

  if (!plan) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Reading Plan" onBack={() => navigation.goBack()} />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Plan not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Figure out the current "focus" day — first incomplete day
  const currentDay = (() => {
    for (let i = 1; i <= plan.durationDays; i++) {
      if (!completedDays.includes(i)) return i;
    }
    return plan.durationDays; // all done
  })();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={plan.title} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ─── Plan Summary ─── */}
        <View style={[styles.summary, { borderColor: accent + '60' }]}>
          <View style={styles.summaryTop}>
            <Text style={styles.summaryTitle}>{plan.title}</Text>
            <Text style={[styles.summaryPct, { color: accent }]}>{pct}%</Text>
          </View>
          <Text style={styles.summaryDesc}>{plan.description}</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, {
              width: `${pct}%` as `${number}%`,
              backgroundColor: accent,
            }]} />
          </View>
          <Text style={styles.summarySub}>
          {completedDays.length} of {plan.durationDays} days completed
          </Text>
        </View>

        {/* ─── Day List ─── */}
        <Text style={styles.sectionLabel}>ALL DAYS — TAP TO MARK COMPLETE</Text>

        {plan.days.map((d) => {
          const done      = completedDays.includes(d.day);
          const isCurrent = d.day === currentDay && !done;
          return (
            <TouchableOpacity
              key={d.day}
              style={[
                styles.dayRow,
                done       && styles.dayRowDone,
                isCurrent  && { borderColor: accent, borderWidth: 2 },
              ]}
              activeOpacity={0.75}
              onPress={() => { void toggleDay(d.day); }}
            >
              {/* Check circle */}
              <View style={[
                styles.checkCircle,
                done && { backgroundColor: accent, borderColor: accent },
              ]}>
                {done && <Icon source="check" size={14} color="#fff" />}
              </View>

              <View style={styles.dayBody}>
                {/* Day number + current badge */}
                <View style={styles.dayTop}>
                  <Text style={[styles.dayNumber, done && styles.dayNumberDone]}>
                    Day {d.day}
                  </Text>
                  {isCurrent && (
                    <View style={[styles.todayBadge, { backgroundColor: accent + '22' }]}>
                      <Text style={[styles.todayBadgeText, { color: accent }]}>TODAY</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.dayTitle, done && styles.dayTitleDone]}>{d.title}</Text>
                <View style={styles.refsRow}>
                  {d.refs.map((ref, i) => (
                    <View key={i} style={[styles.refChip, done && { backgroundColor: accent + '18' }]}>
                      <Icon source="book-open-variant" size={10} color={done ? accent : colors.textMuted} />
                      <Text style={[styles.refText, done && { color: accent }]}>{ref}</Text>
                    </View>
                  ))}
                </View>
              </View>
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

    emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: colors.textSecondary, fontSize: Typography.size.md },

    summary: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      borderWidth: 1,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.07,
      shadowRadius: 4,
    },
    summaryTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.xs,
    },
    summaryTitle: {
      flex: 1,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      color: colors.textPrimary,
      marginRight: Spacing.sm,
    },
    summaryPct: {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
    },
    summaryDesc: {
      fontSize: Typography.size.sm,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: Spacing.md,
    },
    progressBarTrack: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: Radius.full,
      overflow: 'hidden',
      marginBottom: Spacing.xs,
    },
    progressBarFill: {
      height: 8,
      borderRadius: Radius.full,
    },
    summarySub: {
      fontSize: Typography.size.xs,
      color: colors.textMuted,
      marginTop: 2,
    },

    sectionLabel: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      color: colors.textMuted,
      letterSpacing: 1.5,
      marginBottom: Spacing.sm,
      marginTop: Spacing.sm,
    },

    // Day rows
    dayRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surface,
      borderRadius: Radius.md,
      padding: Spacing.md,
      marginBottom: Spacing.xs,
      gap: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dayRowDone: {
      opacity: 0.6,
    },
    checkCircle: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    dayBody: { flex: 1 },
    dayTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginBottom: 1,
    },
    dayNumber: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      color: colors.textMuted,
      letterSpacing: 0.5,
    },
    dayNumberDone: { textDecorationLine: 'line-through' },
    dayTitle: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semiBold,
      color: colors.textPrimary,
      marginBottom: Spacing.xs,
    },
    dayTitleDone: { textDecorationLine: 'line-through', color: colors.textMuted },
    refsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    refChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: Radius.sm,
    },
    refText: {
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: Typography.weight.medium,
    },
    todayBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: Radius.full,
    },
    todayBadgeText: { fontSize: 9, fontWeight: Typography.weight.bold, letterSpacing: 1 },
  });
