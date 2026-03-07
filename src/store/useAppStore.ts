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

interface AppState {
  // Auth / onboarding
  isOnboardingDone: boolean;
  setOnboardingDone: (done: boolean) => void;

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

  // Hydration
  hydrate: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  isOnboardingDone: false,
  setOnboardingDone: (done) => set({ isOnboardingDone: done }),

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
    });
  },
}));
