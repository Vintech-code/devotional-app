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
  PrayEntry,
  ActsEntry,
  DailyBreadCustomization,
} from '../types';
import * as storage from '../services/storageService';
import { signOut as firebaseSignOut } from '../services/authService';
import { pushToCloud, pullFromCloud, mergeById } from '../services/userDataSyncService';
import { syncPublicStats } from '../services/partnerService';
import { scheduleDailyReminder } from '../services/notificationService';

interface AppState {
  // Auth / onboarding
  isOnboardingDone: boolean;
  setOnboardingDone: (done: boolean) => void;

  // Firebase UID of the signed-in user (null = signed out)
  firebaseUid: string | null;
  setFirebaseUid: (uid: string | null) => void;

  // Sign the user out and reset to the auth flow
  signOut: () => Promise<void>;
  // Pending one-time toast for sign-in / sign-out feedback
  pendingAuthToast: string | null;
  setPendingAuthToast: (msg: string) => void;
  clearPendingAuthToast: () => void;
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
  prayEntries: PrayEntry[];
  setPrayEntries: (entries: PrayEntry[]) => void;
  actsEntries: ActsEntry[];
  setActsEntries: (entries: ActsEntry[]) => void;

  // Bible
  bibleTranslation: string;
  setBibleTranslation: (id: string) => void;

  // Reading Plans
  readingPlans: UserReadingPlans;
  setReadingPlan: (plan: UserReadingPlan) => void;

  // Prayer Journal
  prayerRequests: PrayerRequest[];
  setPrayerRequests: (requests: PrayerRequest[]) => void;

  // Daily Bread / Verse display customization (device-global)
  dailyBreadCustom: DailyBreadCustomization;
  setDailyBreadCustom: (custom: DailyBreadCustomization) => void;

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
        pray_journal: s.prayEntries,
        acts_journal: s.actsEntries,
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
      prayEntries: [],
      actsEntries: [],
      pendingAuthToast: 'You have been signed out.',
    });
  },

  pendingAuthToast: null,
  setPendingAuthToast: (msg) => set({ pendingAuthToast: msg }),
  clearPendingAuthToast: () => set({ pendingAuthToast: null }),

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
  setProfile: (profile) => {
    const uid = useAppStore.getState().firebaseUid;
    if (uid) void syncPublicStats(uid, profile.dayStreak ?? 0, profile.completedCount ?? 0, profile.avatarUri).catch(() => {});
    set({ profile });
  },

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
  prayEntries: [],
  setPrayEntries: (entries) => set({ prayEntries: entries }),
  actsEntries: [],
  setActsEntries: (entries) => set({ actsEntries: entries }),

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

  dailyBreadCustom: {
    bgType: 'preset',
    presetIndex: -1,
    bgColor: '#0d4d3a',
    bgPhotoUri: '',
    fontKey: 'serif',
    fontSize: 16,
  },
  setDailyBreadCustom: (custom) => {
    void storage.saveDailyBreadCustom(custom).catch(() => {});
    set({ dailyBreadCustom: custom });
  },

  // ── hydrate: global / device-level settings only ─────────────────────────
  hydrate: async () => {
    const [isDarkMode, bibleTranslation, dailyBreadCustom] = await Promise.all([
      storage.getIsDarkMode(),
      storage.getBibleTranslation(),
      storage.getDailyBreadCustom(),
    ]);
    set({ isDarkMode, bibleTranslation, dailyBreadCustom });
  },

  // ── hydrateForUser: load all UID-scoped data for the signed-in user ───────
  hydrateForUser: async (uid: string) => {
    // Scope the storage service to this user FIRST
    storage.setActiveUid(uid);

    const [
      onboardingDone,
      selectedMethod,
      reminderSettings,
      soapEntries,
      mcpwaEntries,
      swordEntries,
      sermonNotes,
      prayEntries,
      actsEntries,
      readingPlans,
      prayerRequests,
    ] = await Promise.all([
      storage.isOnboardingDone(),
      storage.getSelectedMethod(),
      storage.getReminderSettings(),
      storage.getSoapEntries(),
      storage.getMcpwaEntries(),
      storage.getSwordEntries(),
      storage.getSermonNotes(),
      storage.getPrayEntries(),
      storage.getActsEntries(),
      storage.getUserReadingPlans(),
      storage.getPrayerRequests(),
    ]);

    // Always recalculate streak & counts from actual entries (fixes reset-on-sign-in bug)
    const [freshProfile, avatarUri] = await Promise.all([
      storage.refreshProfileProgress(),
      storage.getAvatarUri(),
    ]);
    const profileWithAvatar: UserProfile = { ...freshProfile, avatarUri: avatarUri ?? undefined };

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
      prayEntries,
      actsEntries,
    });

    // Push fresh stats to Firestore so partners see up-to-date streak/completed/lastActive
    void syncPublicStats(uid, profileWithAvatar.dayStreak ?? 0, profileWithAvatar.completedCount ?? 0, profileWithAvatar.avatarUri).catch(() => {});

    // Re-schedule daily reminder after sign-in so notifications fire even after
    // the OS clears them (device restart, battery optimisation, re-install, etc.)
    if (reminderSettings?.dailyEnabled) {
      void scheduleDailyReminder(reminderSettings).catch(() => {});
    }

    // ── Background cloud sync: restore data from other devices / after reinstall ──
    void (async () => {
      try {
        const cloud = await pullFromCloud(uid);
        if (!cloud.journals && !cloud.settings) return;

        const updates: Record<string, unknown> = {};

        if (cloud.journals) {
          const j = cloud.journals;
          const mergedSoap    = mergeById(soapEntries,    j.soap         ?? []);
          const mergedMcpwa   = mergeById(mcpwaEntries,   j.mcpwa        ?? []);
          const mergedSword   = mergeById(swordEntries,   j.sword        ?? []);
          const mergedSermons = mergeById(sermonNotes,    j.sermons      ?? []);
          const mergedPrayer  = mergeById(prayerRequests, j.prayer       ?? []);
          const mergedPray    = mergeById(prayEntries,    j.pray_journal ?? []);
          const mergedActs    = mergeById(actsEntries,    j.acts_journal ?? []);

          await Promise.all([
            storage.importEntries(storage.K.SOAP,         uid, mergedSoap),
            storage.importEntries(storage.K.MCPWA,        uid, mergedMcpwa),
            storage.importEntries(storage.K.SWORD,        uid, mergedSword),
            storage.importEntries(storage.K.SERMONS,      uid, mergedSermons),
            storage.importEntries(storage.K.PRAYER,       uid, mergedPrayer),
            storage.importEntries(storage.K.PRAY_JOURNAL, uid, mergedPray),
            storage.importEntries(storage.K.ACTS_JOURNAL, uid, mergedActs),
          ]);
          updates.soapEntries    = mergedSoap;
          updates.mcpwaEntries   = mergedMcpwa;
          updates.swordEntries   = mergedSword;
          updates.sermonNotes    = mergedSermons;
          updates.prayerRequests = mergedPrayer;
          updates.prayEntries    = mergedPray;
          updates.actsEntries    = mergedActs;

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
