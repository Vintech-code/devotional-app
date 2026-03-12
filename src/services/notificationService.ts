import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ReminderSettings } from '../types';

// Show notifications even when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge:  true,
    shouldShowBanner: true,
    shouldShowList:   true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function createNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('devotional-reminders', {
      name: 'Devotional Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00ACAA',
    });
  }
}

export async function scheduleDailyReminder(settings: ReminderSettings): Promise<void> {
  // Always cancel before rescheduling to avoid duplicates
  await cancelAllReminders();

  if (!settings.dailyEnabled) return;

  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await createNotificationChannel();

  const [h, m] = settings.scheduledTime.split(':').map(Number);
  const days = settings.repeatDays.length > 0 ? settings.repeatDays : [0, 1, 2, 3, 4, 5, 6];

  for (const weekday of days) {
    // expo-notifications uses 1=Sun … 7=Sat; our stored value is 0=Sun … 6=Sat
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time for your devotional 📖",
        body:  "Don't forget your daily devotional. Tap to open DevoVerse.",
        sound: true,
        data:  { screen: 'Journal' },
        ...(Platform.OS === 'android' && { channelId: 'devotional-reminders' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: weekday + 1, // convert 0-based → 1-based
        hour: h,
        minute: m,
      },
    });
  }
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Schedule a daily streak-protection notification at HH:MM (24h). */
export async function scheduleStreakProtection(hour: number, minute: number): Promise<void> {
  // Cancel any previously scheduled streak notification first
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.content.data as Record<string, unknown>)?.type === 'streak-protection') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
  const granted = await requestNotificationPermissions();
  if (!granted) return;
  await createNotificationChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔥 Keep your streak alive!',
      body: "You haven't done your devotional yet today. It only takes a few minutes — open DevoVerse now!",
      sound: true,
      data: { type: 'streak-protection', screen: 'Journal' },
      ...(Platform.OS === 'android' && { channelId: 'devotional-reminders' }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelStreakProtection(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.content.data as Record<string, unknown>)?.type === 'streak-protection') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

/** Schedule a weekly review nudge on Sundays at 7 PM. */
export async function scheduleWeeklyReview(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.content.data as Record<string, unknown>)?.type === 'weekly-review') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
  const granted = await requestNotificationPermissions();
  if (!granted) return;
  await createNotificationChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✏️ Weekly Reflection',
      body: "How did your devotional week go? Take a moment to review your journal entries and give thanks.",
      sound: true,
      data: { type: 'weekly-review', screen: 'Journal' },
      ...(Platform.OS === 'android' && { channelId: 'devotional-reminders' }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // Sunday (expo-notifications: 1=Sun)
      hour: 19,
      minute: 0,
    },
  });
}

export async function cancelWeeklyReview(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.content.data as Record<string, unknown>)?.type === 'weekly-review') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

/** Fire an immediate local notification (used by the bell "remind me now" feature). */
export async function sendImmediateReminder(title: string, body: string): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;
  await createNotificationChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      ...(Platform.OS === 'android' && { channelId: 'devotional-reminders' }),
    },
    trigger: null, // fire immediately
  });
}
