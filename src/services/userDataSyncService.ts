/**
 * User Data Sync Service — bidirectional Firestore backup.
 *
 * Firestore structure:
 *   userJournals/{uid}  → { soap, mcpwa, sword, sermons, prayer, readingPlans, updatedAt }
 *   userSettings/{uid}  → { profile, reminders, method, onboarding, updatedAt }
 *
 * Design:
 *  - pushToCloud()   writes current data to Firestore (called on sign-out and manually)
 *  - pullFromCloud() fetches Firestore data and returns it (caller merges + saves locally)
 *  - All failures are silently swallowed — cloud sync is best-effort
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type {
  SoapEntry, McpwaEntry, SwordEntry, SermonNote,
  UserProfile, ReminderSettings, UserReadingPlans, PrayerRequest,
  PrayEntry, ActsEntry,
  DevotionalMethodId,
} from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CloudJournals {
  soap:         SoapEntry[];
  mcpwa:        McpwaEntry[];
  sword:        SwordEntry[];
  sermons:      SermonNote[];
  prayer:       PrayerRequest[];
  pray_journal: PrayEntry[];
  acts_journal: ActsEntry[];
  readingPlans: UserReadingPlans;
  updatedAt:    number;
}

export interface CloudSettings {
  profile:    UserProfile;
  reminders:  ReminderSettings;
  method:     DevotionalMethodId;
  onboarding: boolean;
  updatedAt:  number;
}

// ─── Push ─────────────────────────────────────────────────────────────────────

export async function pushToCloud(
  uid: string,
  payload: {
    soap:         SoapEntry[];
    mcpwa:        McpwaEntry[];
    sword:        SwordEntry[];
    sermons:      SermonNote[];
    prayer:       PrayerRequest[];
    pray_journal: PrayEntry[];
    acts_journal: ActsEntry[];
    readingPlans: UserReadingPlans;
    profile:      UserProfile | null;
    reminders:    ReminderSettings | null;
    method:       DevotionalMethodId;
    onboarding:   boolean;
  },
): Promise<void> {
  const now = Date.now();
  await Promise.all([
    setDoc(doc(db, 'userJournals', uid), {
      soap:        payload.soap,
      mcpwa:       payload.mcpwa,
      sword:       payload.sword,
      sermons:     payload.sermons,
      prayer:      payload.prayer,
      pray_journal: payload.pray_journal,
      acts_journal: payload.acts_journal,
      readingPlans: payload.readingPlans,
      updatedAt:   now,
    }),
    setDoc(doc(db, 'userSettings', uid), {
      profile:    payload.profile ?? {},
      reminders:  payload.reminders ?? {},
      method:     payload.method,
      onboarding: payload.onboarding,
      updatedAt:  now,
    }),
  ]);
}

// ─── Pull ─────────────────────────────────────────────────────────────────────

export interface CloudSnapshot {
  journals: CloudJournals | null;
  settings: CloudSettings | null;
}

/** Returns whatever Firestore has. Returns null fields if offline or missing. */
export async function pullFromCloud(uid: string): Promise<CloudSnapshot> {
  try {
    const [jSnap, sSnap] = await Promise.all([
      getDoc(doc(db, 'userJournals', uid)),
      getDoc(doc(db, 'userSettings', uid)),
    ]);
    return {
      journals: jSnap.exists() ? (jSnap.data() as CloudJournals) : null,
      settings: sSnap.exists() ? (sSnap.data() as CloudSettings) : null,
    };
  } catch {
    return { journals: null, settings: null };
  }
}

// ─── Merge helpers ────────────────────────────────────────────────────────────

/** Merge two arrays by `id`. Cloud entries fill gaps in the local set. */
export function mergeById<T extends { id: string }>(local: T[], cloud: T[]): T[] {
  const map = new Map<string, T>();
  cloud.forEach((e) => map.set(e.id, e));
  // Local overwrites cloud for same id (user's last edit wins)
  local.forEach((e) => map.set(e.id, e));
  return [...map.values()].sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}
