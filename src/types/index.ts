// ─── Devotional Methods ──────────────────────────────────────────────────────

export type DevotionalMethodId = 'SOAP' | 'MCPWA' | 'SWORD';

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

export type JournalEntry = SoapEntry | McpwaEntry | SwordEntry;

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
  mainScripture: string;
  notes: string;
  tags: string[];
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
  alertSound: string;
  vibration: string;
  contentPreview: boolean;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  agreedToTerms: boolean;
}
