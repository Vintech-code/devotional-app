// ─── Devotional Methods ──────────────────────────────────────────────────────

export type DevotionalMethodId = 'SOAP' | 'MCPWA' | 'SWORD' | 'PRAY' | 'ACTS' | 'SERMON';

export interface DevotionalMethod {
  id: DevotionalMethodId;
  name: string;
  acronym: string;
  description: string;
  steps: string[];
}

// ─── SOAP Entry ──────────────────────────────────────────────────────────────

export interface SoapEntry {
  id: string;
  date: string;
  scripture: string;
  fullVerse: string;
  observation: string;
  application: string;
  prayer: string;
  createdAt: number;
}

// ─── MCPWA Entry ─────────────────────────────────────────────────────────────

export interface McpwaEntry {
  id: string;
  date: string;
  scripture: string;
  message: string;
  command: string;
  promise: string;
  warning: string;
  application: string;
  createdAt: number;
}

// ─── SWORD Entry ─────────────────────────────────────────────────────────────

export interface SwordEntry {
  id: string;
  date: string;
  scripture: string;
  word: string;
  observation: string;
  response: string;
  dailyLiving: string;
  createdAt: number;
}

// ─── PRAY Entry ──────────────────────────────────────────────────────────────

export interface PrayEntry {
  id: string;
  date: string;
  scripture: string;
  fullVerse: string;
  praise: string;      // P – Praise
  repent: string;      // R – Repent
  ask: string;         // A – Ask
  yield_: string;      // Y – Yield  (avoid reserved keyword 'yield')
  createdAt: number;
}

// ─── ACTS Entry ───────────────────────────────────────────────────────────────

export interface ActsEntry {
  id: string;
  date: string;
  scripture: string;
  fullVerse: string;
  adoration: string;     // A – Adoration
  confession: string;    // C – Confession
  thanksgiving: string;  // T – Thanksgiving
  supplication: string;  // S – Supplication
  createdAt: number;
}

export type JournalEntry = SoapEntry | McpwaEntry | SwordEntry | PrayEntry | ActsEntry;

// ─── Sermon Notes ────────────────────────────────────────────────────────────

export type SermonTag =
  | 'Faith'
  | 'Grace'
  | 'Hope'
  | 'Love'
  | 'Wisdom'
  | 'Healing'
  | 'Prayer'
  | 'Leadership'
  | 'Gospel';

export interface SermonNote {
  id: string;
  title: string;
  preacher: string;
  church: string;
  serviceDate: string;
  mainScripture?: string;
  notes: string;
  tags: string[];
  noteFontSize?: number;
  imageUris?: string[];
  createdAt: number;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  memberSince: string;
  level: number;
  levelTitle: string;
  completedCount: number;
  dayStreak: number;
  avatarUri?: string;
}

// ─── Reminders ───────────────────────────────────────────────────────────────

export type DayOfWeek = 'S' | 'M' | 'T' | 'W' | 'F';

export interface ReminderSettings {
  dailyEnabled: boolean;
  scheduledTime: string; // 'HH:MM'
  repeatDays: number[]; // 0=Sun … 6=Sat
  weeklyReviewEnabled: boolean;
  streakProtectionEnabled: boolean; // evening reminder if no entry logged today
  alertSound: string;
  vibration: string;
  contentPreview: boolean;
}

// ─── Daily Bread Customization ───────────────────────────────────────────────

export type VerseFontKey = 'serif' | 'sans' | 'mono' | 'elegant';

export interface DailyBreadCustomization {
  bgType: 'preset' | 'color' | 'photo';
  /** -1 = rotate daily, 0-3 = fixed preset index */
  presetIndex: number;
  bgColor: string;
  bgPhotoUri: string;
  fontKey: VerseFontKey;
  fontSize: number; // 12–22
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  agreedToTerms: boolean;
}

// ─── Reading Plans ────────────────────────────────────────────────────────────

export interface ReadingPlanDay {
  day: number;      // 1-based
  refs: string[];   // e.g. ['Matthew 1', 'Matthew 2']
  title: string;
}

export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  days: ReadingPlanDay[];
}

export interface UserReadingPlan {
  planId: string;
  startedAt: number;       // Unix ms
  completedDays: number[]; // day numbers that have been checked off
}

/** All plans the user has ever started, keyed by planId */
export type UserReadingPlans = Record<string, UserReadingPlan>;

// ─── Prayer Journal ───────────────────────────────────────────────────────────

export type PrayerStatus = 'Pending' | 'In Progress' | 'Answered';

export interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  status: PrayerStatus;
  scriptureRef?: string;
  answeredDate?: number;
  createdAt: number;
}
