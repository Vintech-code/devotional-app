import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ActivityIndicator, Alert, Text } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '@rneui/themed';
import { onAuthStateChanged } from 'firebase/auth';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedSplash from './src/components/AnimatedSplash/AnimatedSplash';

// Keep the native splash on-screen until we are ready to show the animated one.
void SplashScreen.preventAutoHideAsync();

import RootNavigator from './src/navigation/RootNavigator';
import { useAppStore } from './src/store/useAppStore';
import { DarkColors, LightColors, makePaperTheme, makeRneuiTheme } from './src/theme';
import { auth } from './src/services/firebase';
import { markOnboardingDone, saveUserProfile, setActiveUid } from './src/services/storageService';
import {
  checkIfDisabled,
  registerOrUpdateUserMeta,
  APP_ADMIN_EMAIL,
  getAllUsers,
  getAllFeedbacks,
  getAllAppRatingsForAdmin,
  getUserFeedbacks,
} from './src/services/feedbackService';
import { createNotificationChannel, sendImmediateReminder } from './src/services/notificationService';
import { RootStackParamList } from './src/navigation/types';

interface AppContentProps {
  navRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
}

function AppContent({ navRef }: AppContentProps) {
  const hydrate         = useAppStore((s) => s.hydrate);
  const hydrateForUser  = useAppStore((s) => s.hydrateForUser);
  const isDarkMode      = useAppStore((s) => s.isDarkMode);
  const setProfile      = useAppStore((s) => s.setProfile);
  const setOnboardingDone = useAppStore((s) => s.setOnboardingDone);
  const signOut         = useAppStore((s) => s.signOut);
  const [ready, setReady]           = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const authStateVersionRef = useRef(0);

  const colors        = isDarkMode ? DarkColors : LightColors;
  const appPaperTheme = useMemo(() => makePaperTheme(colors, isDarkMode), [colors, isDarkMode]);
  const appRneuiTheme = useMemo(() => makeRneuiTheme(colors), [colors]);

  const clearIntervalSafe = (id: ReturnType<typeof setInterval> | null) => {
    if (id) clearInterval(id);
  };

  const pollAdminDashboardUpdates = async (uid: string, adminEmail: string) => {
    try {
      const [users, feedbacks, ratings] = await Promise.all([
        getAllUsers(),
        getAllFeedbacks(),
        getAllAppRatingsForAdmin(adminEmail),
      ]);

      const pendingFeedbacks = feedbacks.filter((f) => f.status === 'pending').length;
      const snapshot = {
        users: users.length,
        pending: pendingFeedbacks,
        ratings: ratings.length,
      };

      const key = `@devotional/admin_dashboard_snapshot/${uid}`;
      const raw = await AsyncStorage.getItem(key);
      const prev = raw ? (JSON.parse(raw) as { users: number; pending: number; ratings: number }) : null;

      if (prev) {
        const userDelta = snapshot.users - prev.users;
        const pendingDelta = snapshot.pending - prev.pending;
        const ratingDelta = snapshot.ratings - prev.ratings;
        const parts: string[] = [];

        if (userDelta > 0) parts.push(`${userDelta} new user${userDelta > 1 ? 's' : ''}`);
        if (pendingDelta > 0) parts.push(`${pendingDelta} new feedback${pendingDelta > 1 ? 's' : ''}`);
        if (ratingDelta > 0) parts.push(`${ratingDelta} new rating${ratingDelta > 1 ? 's' : ''}`);

        if (parts.length > 0) {
          await sendImmediateReminder(
            'Admin Dashboard Update',
            parts.join(' • '),
            { type: 'admin-dashboard-update', screen: 'Profile' },
          );
        }
      }

      await AsyncStorage.setItem(key, JSON.stringify(snapshot));
    } catch {
      // Ignore polling failures so app startup/navigation is never blocked.
    }
  };

  const pollUserFeedbackReplies = async (uid: string) => {
    try {
      const items = await getUserFeedbacks(uid);
      const latestRepliedAt = items.reduce((max, item) => {
        if (item.status !== 'replied') return max;
        return Math.max(max, item.repliedAt ?? 0);
      }, 0);

      const key = `@devotional/user_feedback_reply_seen/${uid}`;
      const raw = await AsyncStorage.getItem(key);
      const prevSeen = raw ? Number(raw) : 0;

      if (prevSeen > 0 && latestRepliedAt > prevSeen) {
        const newReplyCount = items.filter((item) => item.status === 'replied' && (item.repliedAt ?? 0) > prevSeen).length;
        await sendImmediateReminder(
          'Feedback Replied',
          `You have ${newReplyCount} new admin repl${newReplyCount === 1 ? 'y' : 'ies'} to your feedback.`,
          { type: 'feedback-replied', screen: 'Profile' },
        );
      }

      if (latestRepliedAt > 0) {
        await AsyncStorage.setItem(key, String(latestRepliedAt));
      }
    } catch {
      // Ignore polling failures so app startup/navigation is never blocked.
    }
  };

  useEffect(() => {
    // Set up notification channel once on startup
    void createNotificationChannel();

    let adminTimer: ReturnType<typeof setInterval> | null = null;
    let userReplyTimer: ReturnType<typeof setInterval> | null = null;

    // Route notification taps to the relevant area of the app
    const notifSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = (response.notification.request.content.data ?? {}) as Record<string, unknown>;
      const type = typeof data.type === 'string' ? data.type : '';

      if (type === 'rate-app-reminder' || type === 'feedback-reminder') {
        navRef.current?.navigate('Main', { screen: 'Profile' } as never);
        return;
      }

      if (type === 'admin-dashboard-update' || type === 'feedback-replied') {
        navRef.current?.navigate('Main', { screen: 'Profile' } as never);
        return;
      }

      navRef.current?.navigate('Main', { screen: 'Journal', params: { screen: 'JournalHome' } } as never);
    });

    // 1. Load global / device settings (dark mode, bible translation) immediately
    void hydrate();

    // 2. Wait for Firebase auth to resolve (fires from cache on restart = instant)
    const authUnsub = onAuthStateChanged(auth, async (user) => {
      clearIntervalSafe(adminTimer);
      clearIntervalSafe(userReplyTimer);
      adminTimer = null;
      userReplyTimer = null;

      const version = ++authStateVersionRef.current;
      if (user) {
        setActiveUid(user.uid);
        // Load this user's UID-scoped data from AsyncStorage
        try {
          await Promise.race([
            hydrateForUser(user.uid),
            new Promise((_, reject) => setTimeout(() => reject(new Error('hydrate-timeout')), 8000)),
          ]);
        } catch {
          // If hydration hangs, fall back to showing the app shell.
          setReady(true);
        }
        if (version !== authStateVersionRef.current) return;

        const hydratedProfile = useAppStore.getState().profile;
        const displayName = (user.displayName ?? '').trim();
        const emailHandle = (user.email?.split('@')[0] ?? '').trim();
        const providerPhoto = user.providerData.find((p) => !!p.photoURL)?.photoURL ?? undefined;
        const resolvedName = displayName || emailHandle || hydratedProfile?.name || 'Member';
        const resolvedAvatar = hydratedProfile?.avatarUri ?? user.photoURL ?? providerPhoto ?? undefined;
        if (hydratedProfile) {
          const needsNameRepair = !hydratedProfile.name
            || hydratedProfile.name.trim() === ''
            || hydratedProfile.name === 'New Member';
          const needsAvatarRepair = !hydratedProfile.avatarUri && !!resolvedAvatar;
          if (needsNameRepair || needsAvatarRepair) {
            const repairedProfile = {
              ...hydratedProfile,
              name: resolvedName,
              avatarUri: resolvedAvatar,
            };
            await saveUserProfile(repairedProfile);
            setProfile(repairedProfile);
          }
        }

        const creation = user.metadata.creationTime ?? '';
        const lastSignIn = user.metadata.lastSignInTime ?? '';
        const isFirstSignIn = creation !== '' && lastSignIn !== '' && creation === lastSignIn;

        if (!isFirstSignIn) {
          void markOnboardingDone();
          setOnboardingDone(true);
        }

        // Show the app immediately — background tasks run after
        setReady(true);

        // Background: user meta registration + disabled check.
        // Cloud journal/settings sync is handled centrally inside hydrateForUser.

        // Keep user roster up-to-date in Firestore for admin view
        void registerOrUpdateUserMeta(
          user.uid,
          resolvedName,
          user.email ?? '',
          resolvedAvatar,
        );

        // Background notifications for admin dashboard updates and user feedback replies.
        const isAdminUser = (user.email ?? '').toLowerCase() === APP_ADMIN_EMAIL.toLowerCase();
        if (isAdminUser && user.email) {
          void pollAdminDashboardUpdates(user.uid, user.email);
          adminTimer = setInterval(() => {
            void pollAdminDashboardUpdates(user.uid, user.email ?? APP_ADMIN_EMAIL);
          }, 120_000);
        } else {
          void pollUserFeedbackReplies(user.uid);
          userReplyTimer = setInterval(() => {
            void pollUserFeedbackReplies(user.uid);
          }, 120_000);
        }

        // Disabled-account enforcement (fire-and-forget; never blocks UI)
        checkIfDisabled(user.uid)
          .then(async (disabled) => {
            if (disabled) {
              await signOut();
              Alert.alert(
                'Account Suspended',
                'Your account has been suspended by the administrator. Please contact support for assistance.',
              );
            }
          })
          .catch(() => {});

        return;
      }
      setActiveUid(null);
      if (version !== authStateVersionRef.current) return;
      // Whether user is null or set, we're done loading
      setReady(true);
    });

    return () => {
      authUnsub();
      notifSub.remove();
      clearIntervalSafe(adminTimer);
      clearIntervalSafe(userReplyTimer);
    };
  }, [hydrate, hydrateForUser, setOnboardingDone, setProfile, signOut, navRef]);

  useEffect(() => {
    if (ready) return;
    const timer = setTimeout(() => setReady(true), 10000);
    return () => clearTimeout(timer);
  }, [ready]);

  useEffect(() => {
    if (!ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <PaperProvider theme={appPaperTheme}>
      <ThemeProvider theme={appRneuiTheme}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        {/* Real app — rendered beneath the animated splash so it's warm when splash exits */}
        <RootNavigator />
        {/* Animated splash sits on top and fades out, then unmounts */}
        {!splashDone && (
          <AnimatedSplash onComplete={() => setSplashDone(true)} />
        )}
      </ThemeProvider>
    </PaperProvider>
  );
}

export default function App() {
  const navRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navRef}>
        <AppContent navRef={navRef} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

