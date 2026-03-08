import { create } from 'zustand';
import {
  DevotionalMethodId,
  UserProfile,
  ReminderSettings,
  SoapEntry,
  McpwaEntry,
  SwordEntry,
  SermonNote,
} from '../types';
import * as storage from '../services/storageService';
import { signOut as firebaseSignOut } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  // Auth / onboarding
  isOnboardingDone: boolean;
  setOnboardingDone: (done: boolean) => void;

  // Firebase UID of the signed-in user (null = signed out)
  firebaseUid: string | null;
  setFirebaseUid: (uid: string | null) => void;

  // Sign the user out and reset to the auth flow
  signOut: () => Promise<void>;

  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Selected method
  selectedMethod: DevotionalMethodId;
  setSelectedMethod: (method: DevotionalMethodId) => void;

  // User profile
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;

  // Reminders
  reminderSettings: ReminderSettings | null;
  setReminderSettings: (settings: ReminderSettings) => void;

  // SOAP entries
  soapEntries: SoapEntry[];
  setSoapEntries: (entries: SoapEntry[]) => void;

  // MCPWA entries
  mcpwaEntries: McpwaEntry[];
  setMcpwaEntries: (entries: McpwaEntry[]) => void;

  // SWORD entries
  swordEntries: SwordEntry[];
  setSwordEntries: (entries: SwordEntry[]) => void;

  // Sermon notes
  sermonNotes: SermonNote[];
  setSermonNotes: (notes: SermonNote[]) => void;

  // Bible translation
  bibleTranslation: string;
  setBibleTranslation: (id: string) => void;

  // Hydration
  hydrate: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  isOnboardingDone: false,
  setOnboardingDone: (done) => set({ isOnboardingDone: done }),

  firebaseUid: null,
  setFirebaseUid: (uid) => set({ firebaseUid: uid }),

  signOut: async () => {
    await firebaseSignOut();
    // Wipe every user-scoped key so the next sign-in starts completely fresh
    await AsyncStorage.multiRemove([
      '@devotional/onboarding_done',
      '@devotional/user_profile',
      '@devotional/soap_entries',
      '@devotional/mcpwa_entries',
      '@devotional/sword_entries',
      '@devotional/sermon_notes',
      '@devotional/reminder_settings',
      '@devotional/selected_method',
    ]);
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

  hydrate: async () => {
    await storage.refreshProfileProgress();

    const [
      onboardingDone,
      isDarkMode,
      selectedMethod,
      profile,
      reminderSettings,
      soapEntries,
      mcpwaEntries,
      swordEntries,
      sermonNotes,
      bibleTranslation,
    ] = await Promise.all([
      storage.isOnboardingDone(),
      storage.getIsDarkMode(),
      storage.getSelectedMethod(),
      storage.getUserProfile(),
      storage.getReminderSettings(),
      storage.getSoapEntries(),
      storage.getMcpwaEntries(),
      storage.getSwordEntries(),
      storage.getSermonNotes(),
      storage.getBibleTranslation(),
    ]);

    set({
      isOnboardingDone: onboardingDone,
      isDarkMode,
      selectedMethod,
      profile,
      reminderSettings,
      soapEntries,
      mcpwaEntries,
      swordEntries,
      sermonNotes,
      bibleTranslation,
    });
  },
}));
