import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SoapEntry,
  McpwaEntry,
  SwordEntry,
  SermonNote,
  UserProfile,
  ReminderSettings,
  DevotionalMethodId,
  UserReadingPlan,
  UserReadingPlans,
  PrayerRequest,
  PrayEntry,
  ActsEntry,
  DailyBreadCustomization,
} from '../types';
import { trackEvent } from './analyticsService';

// ─── Active User ──────────────────────────────────────────────────────────────
// Call setActiveUid() whenever auth state changes so all per-user reads/writes
// are automatically scoped to the signed-in account.

let _uid: string | null = null;

export function setActiveUid(uid: string | null): void {
  _uid = uid;
}

export function getActiveUid(): string | null {
  return _uid;
}

/** Returns a UID-scoped key for per-user data. */
export function uk(base: string): string {
  return _uid ? `${base}/${_uid}` : base;
}

// ─── Level helpers ────────────────────────────────────────────────────────────

const LEVEL_TITLES = [
  'Faith Seeker',
  'Scripture Builder',
  'Prayer Warrior',
  'Disciple Maker',
  'Kingdom Mentor',
];

function getDayKey(timestamp: number): string {
  const d = new Date(timestamp);
  // Use local calendar day keys to avoid UTC shift errors that break streaks.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function calculateCurrentStreak(timestamps: number[]): number {
  if (timestamps.length === 0) return 0;
  const days = new Set(timestamps.map(getDayKey));
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  const keyOf = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  // If no entry today, allow yesterday as the streak start (grace period)
  if (!days.has(keyOf(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(keyOf(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(keyOf(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function calculateLevel(completedCount: number): { level: number; levelTitle: string } {
  const level = Math.max(1, Math.floor(completedCount / 10) + 1);
  const levelTitle = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  return { level, levelTitle };
}

// ─── Base key names (raw, not UID-scoped) ─────────────────────────────────────

export const K = {
  // Per-user (wrapped with uk() in every function below)
  SOAP:       '@devotional/soap_entries',
  MCPWA:      '@devotional/mcpwa_entries',
  SWORD:      '@devotional/sword_entries',
  SERMONS:    '@devotional/sermon_notes',
  PROFILE:    '@devotional/user_profile',
  REMINDERS:  '@devotional/reminder_settings',
  METHOD:     '@devotional/selected_method',
  ONBOARDING: '@devotional/onboarding_done',
  AVATAR:     '@devotional/avatar_uri',
  READING_PLAN: '@devotional/reading_plan',
  PRAYER:       '@devotional/prayer_requests',
  PRAY_JOURNAL: '@devotional/pray_entries',
  ACTS_JOURNAL: '@devotional/acts_entries',
  // Global / device-level (NOT UID-scoped)
  DARK_MODE:        '@devotional/dark_mode',
  BIBLE_POS:        '@devotional/bible_position',
  BIBLE_XLAT:       '@devotional/bible_translation',
  DAILY_BREAD_CUSTOM: '@devotional/daily_bread_custom',
  VERSE_NOTIF:      '@devotional/verse_notif_enabled',
};

// ─── JSON helpers ─────────────────────────────────────────────────────────────

async function getJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) {
      const backup = await AsyncStorage.getItem(`${key}__backup`);
      if (backup === null) return fallback;
      return JSON.parse(backup) as T;
    }
    return JSON.parse(raw) as T;
  } catch {
    try {
      const backup = await AsyncStorage.getItem(`${key}__backup`);
      if (backup === null) return fallback;
      return JSON.parse(backup) as T;
    } catch {
      return fallback;
    }
  }
}

export async function setJson<T>(key: string, value: T): Promise<void> {
  const raw = JSON.stringify(value);
  await AsyncStorage.multiSet([
    [key, raw],
    [`${key}__backup`, raw],
  ]);
}

/**
 * Directly write a merged entries array into local storage for the given uid.
 * Used by the cloud sync to import data pulled from Firestore.
 */
export async function importEntries<T>(baseKey: string, uid: string, entries: T[]): Promise<void> {
  await setJson(`${baseKey}/${uid}`, entries);
}

async function recoverLegacyEntriesForScopedKey<T>(baseKey: string, scopedKey: string): Promise<T[] | null> {
  // 1) Recover from pre-UID key format.
  const legacy = await getJson<T[]>(baseKey, []);
  if (Array.isArray(legacy) && legacy.length > 0) {
    await setJson(scopedKey, legacy);
    return legacy;
  }

  // 2) Recover from legacy UID-scoped keys by merging all valid candidates.
  // This restores entries created across older app versions that used different
  // UID key paths, while de-duplicating by id when possible.
  const keys = await AsyncStorage.getAllKeys();
  const candidateKeys = keys.filter((k) => (
    k.startsWith(`${baseKey}/`)
    && !k.endsWith('__backup')
    && k !== scopedKey
  ));

  if (candidateKeys.length === 0) return null;

  const arrays = await Promise.all(candidateKeys.map((k) => getJson<T[]>(k, [])));
  const combined = arrays.flat().filter(Boolean);
  if (combined.length === 0) return null;

  const byId = new Map<string, T>();
  const passthrough: T[] = [];
  combined.forEach((item) => {
    const anyItem = item as unknown as { id?: unknown };
    if (typeof anyItem?.id === 'string' && anyItem.id.length > 0) {
      byId.set(anyItem.id, item);
      return;
    }
    passthrough.push(item);
  });

  const migrated = [...byId.values(), ...passthrough] as T[];
  await setJson(scopedKey, migrated);
  return migrated;
}

// ─── SOAP ─────────────────────────────────────────────────────────────────────

export async function getSoapEntries(): Promise<SoapEntry[]> {
  const scopedKey = uk(K.SOAP);
  const scoped = await getJson<SoapEntry[]>(scopedKey, []);
  if (scoped.length > 0 || !_uid) return scoped;
  const recovered = await recoverLegacyEntriesForScopedKey<SoapEntry>(K.SOAP, scopedKey);
  return recovered ?? scoped;
}

export async function saveSoapEntry(entry: SoapEntry): Promise<void> {
  const entries = await getSoapEntries();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) entries[idx] = entry; else entries.unshift(entry);
  await setJson(uk(K.SOAP), entries);
  await refreshProfileProgress();
  await trackEvent('create_note', { method: 'SOAP' });
  await trackEvent('save_success', { method: 'SOAP' });
}

export async function deleteSoapEntry(id: string): Promise<void> {
  const entries = await getSoapEntries();
  await setJson(uk(K.SOAP), entries.filter((e) => e.id !== id));
  await refreshProfileProgress();
}

// ─── MCPWA ────────────────────────────────────────────────────────────────────

export async function getMcpwaEntries(): Promise<McpwaEntry[]> {
  const scopedKey = uk(K.MCPWA);
  const scoped = await getJson<McpwaEntry[]>(scopedKey, []);
  if (scoped.length > 0 || !_uid) return scoped;
  const recovered = await recoverLegacyEntriesForScopedKey<McpwaEntry>(K.MCPWA, scopedKey);
  return recovered ?? scoped;
}

export async function saveMcpwaEntry(entry: McpwaEntry): Promise<void> {
  const entries = await getMcpwaEntries();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) entries[idx] = entry; else entries.unshift(entry);
  await setJson(uk(K.MCPWA), entries);
  await refreshProfileProgress();
  await trackEvent('create_note', { method: 'MCPWA' });
  await trackEvent('save_success', { method: 'MCPWA' });
}

export async function deleteMcpwaEntry(id: string): Promise<void> {
  const entries = await getMcpwaEntries();
  await setJson(uk(K.MCPWA), entries.filter((e) => e.id !== id));
  await refreshProfileProgress();
}

// ─── SWORD ────────────────────────────────────────────────────────────────────

export async function getSwordEntries(): Promise<SwordEntry[]> {
  const scopedKey = uk(K.SWORD);
  const scoped = await getJson<SwordEntry[]>(scopedKey, []);
  if (scoped.length > 0 || !_uid) return scoped;
  const recovered = await recoverLegacyEntriesForScopedKey<SwordEntry>(K.SWORD, scopedKey);
  return recovered ?? scoped;
}

export async function saveSwordEntry(entry: SwordEntry): Promise<void> {
  const entries = await getSwordEntries();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) entries[idx] = entry; else entries.unshift(entry);
  await setJson(uk(K.SWORD), entries);
  await refreshProfileProgress();
  await trackEvent('create_note', { method: 'SWORD' });
  await trackEvent('save_success', { method: 'SWORD' });
}

export async function deleteSwordEntry(id: string): Promise<void> {
  const entries = await getSwordEntries();
  await setJson(uk(K.SWORD), entries.filter((e) => e.id !== id));
  await refreshProfileProgress();
}

// ─── Sermon Notes ─────────────────────────────────────────────────────────────

export async function getSermonNotes(): Promise<SermonNote[]> {
  const scopedKey = uk(K.SERMONS);
  const scoped = await getJson<SermonNote[]>(scopedKey, []);
  if (scoped.length > 0 || !_uid) return scoped;
  const recovered = await recoverLegacyEntriesForScopedKey<SermonNote>(K.SERMONS, scopedKey);
  return recovered ?? scoped;
}

export async function saveSermonNote(note: SermonNote): Promise<void> {
  const notes = await getSermonNotes();
  const idx = notes.findIndex((n) => n.id === note.id);
  if (idx >= 0) notes[idx] = note; else notes.unshift(note);
  await setJson(uk(K.SERMONS), notes);
  await refreshProfileProgress();
  await trackEvent('create_note', { method: 'SERMON' });
  await trackEvent('save_success', { method: 'SERMON' });
}

export async function deleteSermonNote(id: string): Promise<void> {
  const notes = await getSermonNotes();
  await setJson(uk(K.SERMONS), notes.filter((n) => n.id !== id));
  await refreshProfileProgress();
}

// --- PRAY Journal ---

export async function getPrayEntries(): Promise<PrayEntry[]> {
  const scopedKey = uk(K.PRAY_JOURNAL);
  const scoped = await getJson<PrayEntry[]>(scopedKey, []);
  if (scoped.length > 0 || !_uid) return scoped;
  const recovered = await recoverLegacyEntriesForScopedKey<PrayEntry>(K.PRAY_JOURNAL, scopedKey);
  return recovered ?? scoped;
}

export async function savePrayEntry(entry: PrayEntry): Promise<void> {
  const entries = await getPrayEntries();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) entries[idx] = entry; else entries.unshift(entry);
  await setJson(uk(K.PRAY_JOURNAL), entries);
  await refreshProfileProgress();
  await trackEvent('create_note', { method: 'PRAY' });
  await trackEvent('save_success', { method: 'PRAY' });
}

export async function deletePrayEntry(id: string): Promise<void> {
  const entries = await getPrayEntries();
  await setJson(uk(K.PRAY_JOURNAL), entries.filter((e) => e.id !== id));
  await refreshProfileProgress();
}

// --- ACTS Journal ---

export async function getActsEntries(): Promise<ActsEntry[]> {
  const scopedKey = uk(K.ACTS_JOURNAL);
  const scoped = await getJson<ActsEntry[]>(scopedKey, []);
  if (scoped.length > 0 || !_uid) return scoped;
  const recovered = await recoverLegacyEntriesForScopedKey<ActsEntry>(K.ACTS_JOURNAL, scopedKey);
  return recovered ?? scoped;
}

export async function saveActsEntry(entry: ActsEntry): Promise<void> {
  const entries = await getActsEntries();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) entries[idx] = entry; else entries.unshift(entry);
  await setJson(uk(K.ACTS_JOURNAL), entries);
  await refreshProfileProgress();
  await trackEvent('create_note', { method: 'ACTS' });
  await trackEvent('save_success', { method: 'ACTS' });
}

export async function deleteActsEntry(id: string): Promise<void> {
  const entries = await getActsEntries();
  await setJson(uk(K.ACTS_JOURNAL), entries.filter((e) => e.id !== id));
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
  return getJson<UserProfile>(uk(K.PROFILE), DEFAULT_PROFILE);
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setJson(uk(K.PROFILE), profile);
}

export async function refreshProfileProgress(): Promise<UserProfile> {
  const hasStoredProfile = (await AsyncStorage.getItem(uk(K.PROFILE))) !== null;
  const [soap, mcpwa, sword, sermons, pray, acts, profile] = await Promise.all([
    getSoapEntries(),
    getMcpwaEntries(),
    getSwordEntries(),
    getSermonNotes(),
    getPrayEntries(),
    getActsEntries(),
    getUserProfile(),
  ]);

  const completedCount = soap.length + mcpwa.length + sword.length + sermons.length + pray.length + acts.length;
  const allTs = [
    ...soap.map((e) => e.createdAt),
    ...mcpwa.map((e) => e.createdAt),
    ...sword.map((e) => e.createdAt),
    ...sermons.map((e) => e.createdAt),
    ...pray.map((e) => e.createdAt),
    ...acts.map((e) => e.createdAt),
  ];
  const { level, levelTitle } = calculateLevel(completedCount);
  const next: UserProfile = {
    ...profile,
    completedCount,
    dayStreak: calculateCurrentStreak(allTs),
    level,
    levelTitle,
  };
  // Avoid persisting placeholder defaults before signup has saved the real profile.
  if (hasStoredProfile) {
    await saveUserProfile(next);
  }
  return next;
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

export async function getAvatarUri(): Promise<string | null> {
  return getJson<string | null>(uk(K.AVATAR), null);
}

export async function saveAvatarUri(uri: string | null): Promise<void> {
  await setJson(uk(K.AVATAR), uri);
}

// ─── Reminder Settings ────────────────────────────────────────────────────────

const DEFAULT_REMINDERS: ReminderSettings = {
  dailyEnabled: true,
  scheduledTime: '07:30',
  repeatDays: [0, 1, 2, 3, 4, 5, 6],
  weeklyReviewEnabled: false,
  streakProtectionEnabled: false,
  alertSound: 'Gentle Morning Chime',
  vibration: 'Soft pulses only',
  contentPreview: true,
};

export async function getReminderSettings(): Promise<ReminderSettings> {
  return getJson<ReminderSettings>(uk(K.REMINDERS), DEFAULT_REMINDERS);
}

export async function saveReminderSettings(settings: ReminderSettings): Promise<void> {
  await setJson(uk(K.REMINDERS), settings);
}

// ─── Daily Bread Customization (device-global, not UID-scoped) ───────────────

const DEFAULT_DAILY_BREAD_CUSTOM: DailyBreadCustomization = {
  bgType: 'preset',
  presetIndex: -1,
  bgColor: '#0d4d3a',
  bgPhotoUri: '',
  fontKey: 'serif',
  fontSize: 16,
};

export async function getDailyBreadCustom(): Promise<DailyBreadCustomization> {
  return getJson<DailyBreadCustomization>(K.DAILY_BREAD_CUSTOM, DEFAULT_DAILY_BREAD_CUSTOM);
}

export async function saveDailyBreadCustom(custom: DailyBreadCustomization): Promise<void> {
  await setJson(K.DAILY_BREAD_CUSTOM, custom);
}

export async function getVerseNotifEnabled(): Promise<boolean> {
  return getJson<boolean>(K.VERSE_NOTIF, false);
}

export async function saveVerseNotifEnabled(enabled: boolean): Promise<void> {
  await setJson(K.VERSE_NOTIF, enabled);
}

// ─── Selected Method ──────────────────────────────────────────────────────────

export async function getSelectedMethod(): Promise<DevotionalMethodId> {
  return getJson<DevotionalMethodId>(uk(K.METHOD), 'SOAP');
}

export async function saveSelectedMethod(method: DevotionalMethodId): Promise<void> {
  await setJson(uk(K.METHOD), method);
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export async function isOnboardingDone(): Promise<boolean> {
  return getJson<boolean>(uk(K.ONBOARDING), false);
}

export async function markOnboardingDone(): Promise<void> {
  await setJson(uk(K.ONBOARDING), true);
}

// ─── Theme (global — not per-user) ───────────────────────────────────────────

export async function getIsDarkMode(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(K.DARK_MODE);
  return raw !== 'false'; // defaults dark
}

export async function saveIsDarkMode(isDark: boolean): Promise<void> {
  await AsyncStorage.setItem(K.DARK_MODE, String(isDark));
}

// ─── Bible position (global) ─────────────────────────────────────────────────

export async function getBiblePosition(): Promise<{ book: string; chapter: number } | null> {
  return getJson<{ book: string; chapter: number } | null>(K.BIBLE_POS, null);
}

export async function saveBiblePosition(book: string, chapter: number): Promise<void> {
  await setJson(K.BIBLE_POS, { book, chapter });
}

// ─── Bible translation (global) ──────────────────────────────────────────────

export async function getBibleTranslation(): Promise<string> {
  const raw = await AsyncStorage.getItem(K.BIBLE_XLAT);
  return raw ?? 'kjv';
}

export async function saveBibleTranslation(id: string): Promise<void> {
  await AsyncStorage.setItem(K.BIBLE_XLAT, id);
}

// ─── Data export / import (for cloud sync) ───────────────────────────────────

export interface LocalUserData {
  profile: UserProfile;
  soapEntries: SoapEntry[];
  mcpwaEntries: McpwaEntry[];
  swordEntries: SwordEntry[];
  sermonNotes: SermonNote[];
  reminderSettings: ReminderSettings;
  selectedMethod: DevotionalMethodId;
  avatarUri: string | null;
}

export async function exportUserData(): Promise<LocalUserData> {
  const [profile, soap, mcpwa, sword, sermons, reminders, method, avatar] = await Promise.all([
    getUserProfile(),
    getSoapEntries(),
    getMcpwaEntries(),
    getSwordEntries(),
    getSermonNotes(),
    getReminderSettings(),
    getSelectedMethod(),
    getAvatarUri(),
  ]);
  return {
    profile,
    soapEntries:    soap,
    mcpwaEntries:   mcpwa,
    swordEntries:   sword,
    sermonNotes:    sermons,
    reminderSettings: reminders,
    selectedMethod: method,
    avatarUri:      avatar,
  };
}

export async function importUserData(data: Partial<LocalUserData>): Promise<void> {
  const ops: Promise<void>[] = [];
  if (data.profile)          ops.push(saveUserProfile(data.profile));
  if (data.soapEntries)      ops.push(setJson(uk(K.SOAP), data.soapEntries));
  if (data.mcpwaEntries)     ops.push(setJson(uk(K.MCPWA), data.mcpwaEntries));
  if (data.swordEntries)     ops.push(setJson(uk(K.SWORD), data.swordEntries));
  if (data.sermonNotes)      ops.push(setJson(uk(K.SERMONS), data.sermonNotes));
  if (data.reminderSettings) ops.push(saveReminderSettings(data.reminderSettings));
  if (data.selectedMethod)   ops.push(saveSelectedMethod(data.selectedMethod));
  if (data.avatarUri !== undefined) ops.push(saveAvatarUri(data.avatarUri));
  await Promise.all(ops);
}

// ─── Reading Plans ─────────────────────────────────────────────────────────────────────

export async function getUserReadingPlans(): Promise<UserReadingPlans> {
  const raw = await getJson<unknown>(uk(K.READING_PLAN), {});
  if (!raw || typeof raw !== 'object') return {};
  // Migrate old format: a single UserReadingPlan object (has top-level `planId` string key)
  const obj = raw as Record<string, unknown>;
  if (typeof obj.planId === 'string') {
    const migrated: UserReadingPlans = { [obj.planId]: obj as unknown as UserReadingPlan };
    await setJson(uk(K.READING_PLAN), migrated);
    return migrated;
  }
  return obj as UserReadingPlans;
}

export async function saveUserReadingPlans(plans: UserReadingPlans): Promise<void> {
  await setJson(uk(K.READING_PLAN), plans);
}

export async function saveUserReadingPlan(plan: UserReadingPlan): Promise<void> {
  const all = await getUserReadingPlans();
  all[plan.planId] = plan;
  await setJson(uk(K.READING_PLAN), all);
}

// ─── Prayer Requests ─────────────────────────────────────────────────────────

export async function getPrayerRequests(): Promise<PrayerRequest[]> {
  return getJson<PrayerRequest[]>(uk(K.PRAYER), []);
}

export async function savePrayerRequests(requests: PrayerRequest[]): Promise<void> {
  await setJson(uk(K.PRAYER), requests);
}

// ─── Clear all user-scoped data (called on sign-out) ────────────────────

export async function clearUserData(): Promise<void> {
  if (!_uid) return;
  const uid = _uid;
  await AsyncStorage.multiRemove([
    `${K.SOAP}/${uid}`,
    `${K.MCPWA}/${uid}`,
    `${K.SWORD}/${uid}`,
    `${K.SERMONS}/${uid}`,
    `${K.PROFILE}/${uid}`,
    `${K.REMINDERS}/${uid}`,
    `${K.METHOD}/${uid}`,
    `${K.ONBOARDING}/${uid}`,
    `${K.AVATAR}/${uid}`,
    `${K.READING_PLAN}/${uid}`,
    `${K.PRAYER}/${uid}`,
    `${K.PRAY_JOURNAL}/${uid}`,
    `${K.ACTS_JOURNAL}/${uid}`,
  ]);
}
