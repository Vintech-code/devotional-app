// Notifications are temporarily stubbed out for Expo Go preview.
// Re-enable this file when building with EAS / a development build.
import { ReminderSettings } from '../types';

export async function requestNotificationPermissions(): Promise<boolean> {
  return false;
}

export async function scheduleDailyReminder(_settings: ReminderSettings): Promise<void> {
  // no-op in Expo Go
}

export async function cancelAllReminders(): Promise<void> {
  // no-op in Expo Go
}

export async function createNotificationChannel(): Promise<void> {
  // no-op in Expo Go
}
