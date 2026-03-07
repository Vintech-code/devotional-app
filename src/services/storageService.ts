import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SoapEntry,
  McpwaEntry,
  SwordEntry,
  SermonNote,
  UserProfile,
  ReminderSettings,
  DevotionalMethodId,
} from '../types';

const LEVEL_TITLES = [
  'Faith Seeker',
  'Scripture Builder',
  'Prayer Warrior',
  'Disciple Maker',
  'Kingdom Mentor',
];

function getDayKey(timestamp: number): string {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function calculateCurrentStreak(timestamps: number[]): number {
  if (timestamps.length === 0) return 0;

  const days = new Set(timestamps.map(getDayKey));
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function calculateLevel(completedCount: number): { level: number; levelTitle: string } {
  // Every 10 completed entries advances a level.
  const level = Math.max(1, Math.floor(completedCount / 10) + 1);
  const levelTitle = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  return { level, levelTitle };
}

// ─── Keys ────────────────────────────────────────────────────────────────────

const KEYS = {
  SOAP_ENTRIES: '@devotional/soap_entries',
  MCPWA_ENTRIES: '@devotional/mcpwa_entries',
  SWORD_ENTRIES: '@devotional/sword_entries',
  SERMON_NOTES: '@devotional/sermon_notes',
  USER_PROFILE: '@devotional/user_profile',
  REMINDER_SETTINGS: '@devotional/reminder_settings',
  SELECTED_METHOD: '@devotional/selected_method',
  ONBOARDING_DONE: '@devotional/onboarding_done',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function setJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ─── SOAP ────────────────────────────────────────────────────────────────────

export async function getSoapEntries(): Promise<SoapEntry[]> {
  return getJson<SoapEntry[]>(KEYS.SOAP_ENTRIES, []);
}

export async function saveSoapEntry(entry: SoapEntry): Promise<void> {
  const entries = await getSoapEntries();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) entries[idx] = entry;
  else entries.unshift(entry);
  await setJson(KEYS.SOAP_ENTRIES, entries);
  await refreshProfileProgress();
}

export async function deleteSoapEntry(id: string): Promise<void> {
  const entries = await getSoapEntries();
  await setJson(KEYS.SOAP_ENTRIES, entries.filter((e) => e.id !== id));
  await refreshProfileProgress();
}

// ─── MCPWA ───────────────────────────────────────────────────────────────────

export async function getMcpwaEntries(): Promise<McpwaEntry[]> {
  return getJson<McpwaEntry[]>(KEYS.MCPWA_ENTRIES, []);
}

export async function saveMcpwaEntry(entry: McpwaEntry): Promise<void> {
  const entries = await getMcpwaEntries();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) entries[idx] = entry;
  else entries.unshift(entry);
  await setJson(KEYS.MCPWA_ENTRIES, entries);
  await refreshProfileProgress();
}

export async function deleteMcpwaEntry(id: string): Promise<void> {
  const entries = await getMcpwaEntries();
  await setJson(KEYS.MCPWA_ENTRIES, entries.filter((e) => e.id !== id));
  await refreshProfileProgress();
}

// ─── SWORD ───────────────────────────────────────────────────────────────────

export async function getSwordEntries(): Promise<SwordEntry[]> {
  return getJson<SwordEntry[]>(KEYS.SWORD_ENTRIES, []);
}

export async function saveSwordEntry(entry: SwordEntry): Promise<void> {
  const entries = await getSwordEntries();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) entries[idx] = entry;
  else entries.unshift(entry);
  await setJson(KEYS.SWORD_ENTRIES, entries);
  await refreshProfileProgress();
}

export async function deleteSwordEntry(id: string): Promise<void> {
  const entries = await getSwordEntries();
  await setJson(KEYS.SWORD_ENTRIES, entries.filter((e) => e.id !== id));
  await refreshProfileProgress();
}

// ─── Sermon Notes ────────────────────────────────────────────────────────────

export async function getSermonNotes(): Promise<SermonNote[]> {
  return getJson<SermonNote[]>(KEYS.SERMON_NOTES, []);
}

export async function saveSermonNote(note: SermonNote): Promise<void> {
  const notes = await getSermonNotes();
  const idx = notes.findIndex((n) => n.id === note.id);
  if (idx >= 0) notes[idx] = note;
  else notes.unshift(note);
  await setJson(KEYS.SERMON_NOTES, notes);
  await refreshProfileProgress();
}

export async function deleteSermonNote(id: string): Promise<void> {
  const notes = await getSermonNotes();
  await setJson(KEYS.SERMON_NOTES, notes.filter((n) => n.id !== id));
  await refreshProfileProgress();
}

// ─── User Profile ─────────────────────────────────────────────────────────────

const DEFAULT_PROFILE: UserProfile = {
  name: 'New Member',
  memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  level: 1,
  levelTitle: 'Faith Seeker',
  completedCount: 0,
  dayStreak: 0,
};

export async function getUserProfile(): Promise<UserProfile> {
  return getJson<UserProfile>(KEYS.USER_PROFILE, DEFAULT_PROFILE);
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setJson(KEYS.USER_PROFILE, profile);
}

export async function refreshProfileProgress(): Promise<UserProfile> {
  const [soapEntries, mcpwaEntries, swordEntries, sermonNotes, profile] = await Promise.all([
    getSoapEntries(),
    getMcpwaEntries(),
    getSwordEntries(),
    getSermonNotes(),
    getUserProfile(),
  ]);

  const completedCount =
    soapEntries.length + mcpwaEntries.length + swordEntries.length + sermonNotes.length;

  const allTimestamps = [
    ...soapEntries.map((e) => e.createdAt),
    ...mcpwaEntries.map((e) => e.createdAt),
    ...swordEntries.map((e) => e.createdAt),
    ...sermonNotes.map((e) => e.createdAt),
  ];

  const { level, levelTitle } = calculateLevel(completedCount);

  const nextProfile: UserProfile = {
    ...profile,
    completedCount,
    dayStreak: calculateCurrentStreak(allTimestamps),
    level,
    levelTitle,
  };

  await saveUserProfile(nextProfile);
  return nextProfile;
}

// ─── Reminder Settings ───────────────────────────────────────────────────────

const DEFAULT_REMINDERS: ReminderSettings = {
  dailyEnabled: true,
  scheduledTime: '07:30',
  repeatDays: [0, 1, 2, 3, 4, 5, 6],
  weeklyReviewEnabled: false,
  alertSound: 'Gentle Morning Chime',
  vibration: 'Soft pulses only',
  contentPreview: true,
};

export async function getReminderSettings(): Promise<ReminderSettings> {
  return getJson<ReminderSettings>(KEYS.REMINDER_SETTINGS, DEFAULT_REMINDERS);
}

export async function saveReminderSettings(settings: ReminderSettings): Promise<void> {
  await setJson(KEYS.REMINDER_SETTINGS, settings);
}

// ─── Selected Method ─────────────────────────────────────────────────────────

export async function getSelectedMethod(): Promise<DevotionalMethodId> {
  return getJson<DevotionalMethodId>(KEYS.SELECTED_METHOD, 'SOAP');
}

export async function saveSelectedMethod(method: DevotionalMethodId): Promise<void> {
  await setJson(KEYS.SELECTED_METHOD, method);
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

export async function isOnboardingDone(): Promise<boolean> {
  return getJson<boolean>(KEYS.ONBOARDING_DONE, false);
}

export async function markOnboardingDone(): Promise<void> {
  await setJson(KEYS.ONBOARDING_DONE, true);
}
