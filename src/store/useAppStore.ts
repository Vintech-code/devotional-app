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
  PrayerRequest,
} from '../types';
import * as storage from '../services/storageService';
import { signOut as firebaseSignOut } from '../services/authService';
import { pushToCloud, pullFromCloud, mergeById } from '../services/userDataSyncService';

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

  // Prayer Journal
  prayerRequests: PrayerRequest[];
  setPrayerRequests: (requests: PrayerRequest[]) => void;

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
    const s = useAppStore.getState();

    // 1. Best-effort cloud backup before signing out (fire-and-forget if offline)
    if (s.firebaseUid) {
      void pushToCloud(s.firebaseUid, {
        soap:        s.soapEntries,
        mcpwa:       s.mcpwaEntries,
        sword:       s.swordEntries,
        sermons:     s.sermonNotes,
        prayer:      s.prayerRequests,
        readingPlans: s.readingPlans,
        profile:     s.profile,
        reminders:   s.reminderSettings,
        method:      s.selectedMethod,
        onboarding:  s.isOnboardingDone,
      }).catch(() => {});
    }

    // 2. Sign out of Firebase
    await firebaseSignOut();

    // 3. Clear active UID in storage (data stays on-device, scoped by uid)
    storage.setActiveUid(null);

    // 4. Reset in-memory state — local AsyncStorage data is NOT deleted
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
      prayerRequests: [],
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

  prayerRequests: [],
  setPrayerRequests: (requests) => set({ prayerRequests: requests }),

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
      prayerRequests,
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
      storage.getPrayerRequests(),
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
      prayerRequests,
    });

    // ── Background cloud sync: restore data from other devices / after reinstall ──
    void (async () => {
      try {
        const cloud = await pullFromCloud(uid);
        if (!cloud.journals && !cloud.settings) return;

        const updates: Record<string, unknown> = {};

        if (cloud.journals) {
          const j = cloud.journals;
          const mergedSoap    = mergeById(soapEntries,    j.soap    ?? []);
          const mergedMcpwa   = mergeById(mcpwaEntries,   j.mcpwa   ?? []);
          const mergedSword   = mergeById(swordEntries,   j.sword   ?? []);
          const mergedSermons = mergeById(sermonNotes,    j.sermons ?? []);
          const mergedPrayer  = mergeById(prayerRequests, j.prayer  ?? []);

          await Promise.all([
            storage.importEntries(storage.K.SOAP,    uid, mergedSoap),
            storage.importEntries(storage.K.MCPWA,   uid, mergedMcpwa),
            storage.importEntries(storage.K.SWORD,   uid, mergedSword),
            storage.importEntries(storage.K.SERMONS, uid, mergedSermons),
            storage.importEntries(storage.K.PRAYER,  uid, mergedPrayer),
          ]);
          updates.soapEntries    = mergedSoap;
          updates.mcpwaEntries   = mergedMcpwa;
          updates.swordEntries   = mergedSword;
          updates.sermonNotes    = mergedSermons;
          updates.prayerRequests = mergedPrayer;

          if (j.readingPlans && Object.keys(j.readingPlans).length > 0) {
            const mergedPlans = { ...j.readingPlans, ...readingPlans };
            await storage.saveUserReadingPlans(mergedPlans);
            updates.readingPlans = mergedPlans;
          }
        }

        if (cloud.settings?.profile) {
          const cp = cloud.settings.profile;
          if ((cp.completedCount ?? 0) > (profileWithAvatar.completedCount ?? 0)) {
            const merged = { ...cp, avatarUri: profileWithAvatar.avatarUri };
            await storage.saveUserProfile(merged);
            updates.profile = merged;
          }
        }

        if (Object.keys(updates).length > 0) set(updates as unknown as AppState);
      } catch { /* stay silent if cloud pull fails */ }
    })();
  },
}));
