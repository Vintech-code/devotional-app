import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
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
import { useColors } from '../../theme';
import { makeStyles } from './ReadingPlanDetail.styles';
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


