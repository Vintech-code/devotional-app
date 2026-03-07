import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { Colors, Typography, Spacing, Radius } from '../../theme';
import { ReminderSettings } from '../../types';
import { getReminderSettings } from '../../services/storageService';
import { enableAlarm, disableAlarm, updateAlarmTime } from '../../services/alarmService';
import { saveReminderSettings } from '../../services/storageService';
import { requestNotificationPermissions } from '../../services/notificationService';
import { useAppStore } from '../../store/useAppStore';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import ToggleCard from '../../components/ToggleCard/ToggleCard';
import SettingsRow from '../../components/SettingsRow/SettingsRow';
import { styles } from './Reminders.styles';

const QUICK_TIMES = ['06:00 AM', '07:30 AM', '08:15 AM', '10:00 PM'];
const ALERT_SOUNDS = ['Gentle Morning Chime', 'Soft Bells', 'Classic Alarm'];
const VIBRATION_MODES = ['Soft pulses only', 'Short pulse', 'Long pulse'];

function to24(time12: string): string {
  const [time, period] = time12.split(' ');
  const [h, m] = time.split(':');
  let hour = parseInt(h, 10);
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${m}`;
}

function to12(time24: string): string {
  const [h, m] = time24.split(':');
  const hour = parseInt(h, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = ((hour + 11) % 12) + 1;
  return `${String(h12).padStart(2, '0')}:${m} ${period}`;
}

const DAYS_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function RemindersScreen() {
  const navigation = useNavigation();
  const storeSettings = useAppStore((s) => s.reminderSettings);
  const setReminderSettings = useAppStore((s) => s.setReminderSettings);

  const [settings, setSettings] = useState<ReminderSettings | null>(storeSettings);

  useEffect(() => {
    if (!settings) {
      getReminderSettings().then((s) => setSettings(s));
    }
  }, []);

  if (!settings) return null;

  async function toggleDaily(enabled: boolean) {
    if (!settings) return;
    await requestNotificationPermissions();
    if (enabled) await enableAlarm(settings);
    else await disableAlarm();
    const updated = { ...settings, dailyEnabled: enabled };
    setSettings(updated);
    setReminderSettings(updated);
  }

  async function selectTime(time12: string) {
    if (!settings) return;
    const t24 = to24(time12);
    await updateAlarmTime(t24);
    const updated = { ...settings, scheduledTime: t24 };
    setSettings(updated);
    setReminderSettings(updated);
  }

  async function toggleDay(day: number) {
    if (!settings) return;
    const repeatDays = settings.repeatDays.includes(day)
      ? settings.repeatDays.filter((d) => d !== day)
      : [...settings.repeatDays, day];
    const updated = { ...settings, repeatDays };
    await saveReminderSettings(updated);
    setSettings(updated);
    setReminderSettings(updated);
  }

  async function toggleWeekly(enabled: boolean) {
    if (!settings) return;
    const updated = { ...settings, weeklyReviewEnabled: enabled };
    await saveReminderSettings(updated);
    setSettings(updated);
    setReminderSettings(updated);
  }

  async function cycleAlertSound() {
    if (!settings) return;
    const current = ALERT_SOUNDS.indexOf(settings.alertSound);
    const next = ALERT_SOUNDS[(current + 1) % ALERT_SOUNDS.length];
    const updated = { ...settings, alertSound: next };
    await saveReminderSettings(updated);
    setSettings(updated);
    setReminderSettings(updated);
  }

  async function cycleVibration() {
    if (!settings) return;
    const current = VIBRATION_MODES.indexOf(settings.vibration);
    const next = VIBRATION_MODES[(current + 1) % VIBRATION_MODES.length];
    const updated = { ...settings, vibration: next };
    await saveReminderSettings(updated);
    setSettings(updated);
    setReminderSettings(updated);
  }

  async function toggleContentPreview() {
    if (!settings) return;
    const updated = { ...settings, contentPreview: !settings.contentPreview };
    await saveReminderSettings(updated);
    setSettings(updated);
    setReminderSettings(updated);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Reminders"
        onBack={() => navigation.goBack()}
        rightLabel="Save"
        onRightPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Daily engagement */}
        <Text style={styles.sectionLabel}>DAILY ENGAGEMENT</Text>
        <View style={styles.card}>
          <ToggleCard
            icon="bell"
            title="Daily Devotional"
            description="Keep your streak alive with a daily nudge."
            value={settings.dailyEnabled}
            onValueChange={toggleDaily}
          />

          {settings.dailyEnabled && (
            <>
              <View style={styles.timeHeader}>
                <Icon source="clock-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.timeLabel}>Scheduled For</Text>
              </View>
              <Text style={styles.bigTime}>{to12(settings.scheduledTime)}</Text>

              {/* Quick-pick time chips */}
              <View style={styles.timeChips}>
                {QUICK_TIMES.map((t) => {
                  const active = to24(t) === settings.scheduledTime;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => selectTime(t)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Day selector */}
              <Text style={styles.repeatLabel}>REPEAT ON</Text>
              <View style={styles.daysRow}>
                {DAYS_LABELS.map((d, i) => {
                  const active = settings.repeatDays.includes(i);
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => toggleDay(i)}
                      style={[styles.dayCircle, active && styles.dayCircleActive]}
                    >
                      <Text style={[styles.dayText, active && styles.dayTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* Weekly reflection */}
        <Text style={styles.sectionLabel}>WEEKLY REFLECTION</Text>
        <View style={styles.card}>
          <ToggleCard
            icon="calendar"
            title="Weekly Review"
            description="Reflect on God's work over the past week."
            value={settings.weeklyReviewEnabled}
            onValueChange={toggleWeekly}
          />
        </View>

        {/* Notification preview */}
        <Text style={styles.sectionLabel}>NOTIFICATION PREVIEW</Text>
        <View style={styles.previewCard}>
          <View style={styles.previewInner}>
            <View style={styles.previewIcon}>
              <Icon source="bell-ring" size={20} color={Colors.primary} />
            </View>
            <View style={styles.previewContent}>
              <Text style={styles.previewApp}>ABIDE</Text>
              <Text style={styles.previewTitle}>Time for Morning Devotional</Text>
              <Text style={styles.previewBody}>"Thy word is a lamp unto my feet..."</Text>
            </View>
            <Text style={styles.previewTime}>Now</Text>
          </View>
          <Text style={styles.previewMode}>Preview Mode</Text>
        </View>

        {/* System preferences */}
        <Text style={styles.sectionLabel}>SYSTEM PREFERENCES</Text>
        <View style={styles.prefCard}>
          <SettingsRow
            icon="volume-high"
            title="Alert Sound"
            subtitle={settings.alertSound}
            onPress={() => {
              void cycleAlertSound();
            }}
          />
          <SettingsRow
            icon="vibrate"
            title="Vibration"
            subtitle={settings.vibration}
            onPress={() => {
              void cycleVibration();
            }}
          />
          <SettingsRow
            icon="information"
            title="Content Preview"
            subtitle={settings.contentPreview ? 'Show verse in banner' : 'Hidden in banner'}
            onPress={() => {
              void toggleContentPreview();
            }}
            style={styles.lastRow}
          />
        </View>

        <Text style={styles.footer}>
          Reminders help build the habit of spending time with God, but His grace is new every
          morning regardless of your streak.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
