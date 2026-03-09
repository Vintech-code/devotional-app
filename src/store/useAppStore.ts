import { create } from 'zustand';
import {
  DevotionalMethodId,
  UserProfile,
  ReminderSettings,
  SoapEntry,
  McpwaEntry,
  SwordEntry,
  SermonNote,
  UserReadingPlan,
  UserReadingPlans,
} from '../types';
import * as storage from '../services/storageService';
import { signOut as firebaseSignOut } from '../services/authService';

interface AppState {
  // Auth / onboarding
  isOnboardingDone: boolean;
  setOnboardingDone: (done: boolean) => void;

  // Firebase UID of the signed-in user (null = signed out)
  firebaseUid: string | null;
  setFirebaseUid: (uid: string | null) => void;

  // Sign the user out and reset to the auth flow
  signOut: () => Promise<void>;

  // Theme (global — not per-user)
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Selected devotional method
  selectedMethod: DevotionalMethodId;
  setSelectedMethod: (method: DevotionalMethodId) => void;

  // User profile
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;

  // Reminders
  reminderSettings: ReminderSettings | null;
  setReminderSettings: (settings: ReminderSettings) => void;

  // Journal entries
  soapEntries: SoapEntry[];
  setSoapEntries: (entries: SoapEntry[]) => void;
  mcpwaEntries: McpwaEntry[];
  setMcpwaEntries: (entries: McpwaEntry[]) => void;
  swordEntries: SwordEntry[];
  setSwordEntries: (entries: SwordEntry[]) => void;
  sermonNotes: SermonNote[];
  setSermonNotes: (notes: SermonNote[]) => void;

  // Bible
  bibleTranslation: string;
  setBibleTranslation: (id: string) => void;

  // Reading Plans
  readingPlans: UserReadingPlans;
  setReadingPlan: (plan: UserReadingPlan) => void;

  // Hydration
  // Load global (device-level) settings — call once on app start.
  hydrate: () => Promise<void>;
  // Load per-user data scoped to the given UID — call after Firebase auth resolves.
  hydrateForUser: (uid: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  isOnboardingDone: false,
  setOnboardingDone: (done) => set({ isOnboardingDone: done }),

  firebaseUid: null,
  setFirebaseUid: (uid) => set({ firebaseUid: uid }),

  signOut: async () => {
    // 1. Clear all UID-scoped AsyncStorage keys for this user
    await storage.clearUserData();
    // 2. Sign out of Firebase
    await firebaseSignOut();
    // 3. Clear active UID from storage service
    storage.setActiveUid(null);
    // 4. Reset in-memory store
    set({
      isOnboardingDone: false,
      profile: null,
      firebaseUid: null,
      soapEntries: [],
      mcpwaEntries: [],
      swordEntries: [],
      sermonNotes: [],
      reminderSettings: null,
      selectedMethod: 'SOAP',
      readingPlans: {},
    });
  },

  isDarkMode: true,
  toggleTheme: () =>
    set((s) => {
      const next = !s.isDarkMode;
      void storage.saveIsDarkMode(next);
      return { isDarkMode: next };
    }),

  selectedMethod: 'SOAP',
  setSelectedMethod: (method) => set({ selectedMethod: method }),

  profile: null,
  setProfile: (profile) => set({ profile }),

  reminderSettings: null,
  setReminderSettings: (settings) => set({ reminderSettings: settings }),

  soapEntries: [],
  setSoapEntries: (entries) => set({ soapEntries: entries }),
  mcpwaEntries: [],
  setMcpwaEntries: (entries) => set({ mcpwaEntries: entries }),
  swordEntries: [],
  setSwordEntries: (entries) => set({ swordEntries: entries }),
  sermonNotes: [],
  setSermonNotes: (notes) => set({ sermonNotes: notes }),

  bibleTranslation: 'kjv',
  setBibleTranslation: (id) => {
    void storage.saveBibleTranslation(id);
    set({ bibleTranslation: id });
  },

  readingPlans: {},
  setReadingPlan: (plan) => set((s) => ({
    readingPlans: { ...s.readingPlans, [plan.planId]: plan },
  })),

  // ── hydrate: global / device-level settings only ─────────────────────────
  hydrate: async () => {
    const [isDarkMode, bibleTranslation] = await Promise.all([
      storage.getIsDarkMode(),
      storage.getBibleTranslation(),
    ]);
    set({ isDarkMode, bibleTranslation });
  },

  // ── hydrateForUser: load all UID-scoped data for the signed-in user ───────
  hydrateForUser: async (uid: string) => {
    // Scope the storage service to this user FIRST
    storage.setActiveUid(uid);

    const [
      onboardingDone,
      selectedMethod,
      profile,
      reminderSettings,
      soapEntries,
      mcpwaEntries,
      swordEntries,
      sermonNotes,
      readingPlans,
    ] = await Promise.all([
      storage.isOnboardingDone(),
      storage.getSelectedMethod(),
      storage.getUserProfile(),
      storage.getReminderSettings(),
      storage.getSoapEntries(),
      storage.getMcpwaEntries(),
      storage.getSwordEntries(),
      storage.getSermonNotes(),
      storage.getUserReadingPlans(),
    ]);

    // Attach avatarUri to the profile object
    const avatarUri = await storage.getAvatarUri();
    const profileWithAvatar: UserProfile = { ...profile, avatarUri: avatarUri ?? undefined };

    set({
      isOnboardingDone: onboardingDone,
      selectedMethod,
      profile: profileWithAvatar,
      reminderSettings,
      soapEntries,
      mcpwaEntries,
      swordEntries,
      sermonNotes,
      firebaseUid: uid,
      readingPlans,
    });
  },
}));
