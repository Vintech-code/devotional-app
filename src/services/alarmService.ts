// Alarm service — wraps notification scheduling with a user-friendly API.
// Extend this file when hardware alarm support is added (e.g. react-native-alarm-manager).

import { scheduleDailyReminder, cancelAllReminders } from './notificationService';
import { saveReminderSettings, getReminderSettings } from './storageService';
import { ReminderSettings } from '../types';

export async function enableAlarm(settings: ReminderSettings): Promise<void> {
  const updated: ReminderSettings = { ...settings, dailyEnabled: true };
  await saveReminderSettings(updated);
  await scheduleDailyReminder(updated);
}

export async function disableAlarm(): Promise<void> {
  const settings = await getReminderSettings();
  const updated: ReminderSettings = { ...settings, dailyEnabled: false };
  await saveReminderSettings(updated);
  await cancelAllReminders();
}

export async function updateAlarmTime(time: string): Promise<void> {
  const settings = await getReminderSettings();
  const updated: ReminderSettings = { ...settings, scheduledTime: time };
  await saveReminderSettings(updated);
  if (updated.dailyEnabled) {
    await scheduleDailyReminder(updated);
  }
}
