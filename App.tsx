import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '@rneui/themed';
import { onAuthStateChanged } from 'firebase/auth';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import AnimatedSplash from './src/components/AnimatedSplash/AnimatedSplash';

// Keep the native splash on-screen until we are ready to show the animated one.
void SplashScreen.preventAutoHideAsync();

import RootNavigator from './src/navigation/RootNavigator';
import { useAppStore } from './src/store/useAppStore';
import { DarkColors, LightColors, makePaperTheme, makeRneuiTheme } from './src/theme';
import { auth } from './src/services/firebase';
import { syncOnLogin } from './src/services/syncService';
import { LocalUserData, setActiveUid } from './src/services/storageService';
import { checkIfDisabled, registerOrUpdateUserMeta } from './src/services/feedbackService';
import { createNotificationChannel } from './src/services/notificationService';
import { RootStackParamList } from './src/navigation/types';

interface AppContentProps {
  navRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
}

function AppContent({ navRef }: AppContentProps) {
  const hydrate         = useAppStore((s) => s.hydrate);
  const hydrateForUser  = useAppStore((s) => s.hydrateForUser);
  const isDarkMode      = useAppStore((s) => s.isDarkMode);
  const setProfile      = useAppStore((s) => s.setProfile);
  const setSoapEntries  = useAppStore((s) => s.setSoapEntries);
  const setMcpwaEntries = useAppStore((s) => s.setMcpwaEntries);
  const setSwordEntries = useAppStore((s) => s.setSwordEntries);
  const setSermonNotes  = useAppStore((s) => s.setSermonNotes);
  const soapEntries     = useAppStore((s) => s.soapEntries);
  const signOut         = useAppStore((s) => s.signOut);
  const [ready, setReady]           = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const authStateVersionRef = useRef(0);

  const colors        = isDarkMode ? DarkColors : LightColors;
  const appPaperTheme = useMemo(() => makePaperTheme(colors, isDarkMode), [colors, isDarkMode]);
  const appRneuiTheme = useMemo(() => makeRneuiTheme(colors), [colors]);

  useEffect(() => {
    // Set up notification channel once on startup
    void createNotificationChannel();

    // Route notification taps to the relevant area of the app
    const notifSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = (response.notification.request.content.data ?? {}) as Record<string, unknown>;
      const type = typeof data.type === 'string' ? data.type : '';

      if (type === 'rate-app-reminder' || type === 'feedback-reminder') {
        navRef.current?.navigate('Main', { screen: 'Profile' } as never);
        return;
      }

      navRef.current?.navigate('Main', { screen: 'Journal', params: { screen: 'JournalHome' } } as never);
    });

    // 1. Load global / device settings (dark mode, bible translation) immediately
    void hydrate();

    // 2. Wait for Firebase auth to resolve (fires from cache on restart = instant)
    const authUnsub = onAuthStateChanged(auth, async (user) => {
      const version = ++authStateVersionRef.current;
      if (user) {
        setActiveUid(user.uid);
        // Load this user's UID-scoped data from AsyncStorage
        await hydrateForUser(user.uid);
        if (version !== authStateVersionRef.current) return;

        // Show the app immediately — background tasks run after
        setReady(true);

        // Background: cloud sync (push/pull), user meta registration, disabled check
        const localIsEmpty = soapEntries.length === 0;

        syncOnLogin(user.uid, localIsEmpty, (cloud: LocalUserData) => {
          if (cloud.profile)      setProfile(cloud.profile);
          if (cloud.soapEntries)  setSoapEntries(cloud.soapEntries);
          if (cloud.mcpwaEntries) setMcpwaEntries(cloud.mcpwaEntries);
          if (cloud.swordEntries) setSwordEntries(cloud.swordEntries);
          if (cloud.sermonNotes)  setSermonNotes(cloud.sermonNotes);
        });

        // Keep user roster up-to-date in Firestore for admin view
        void registerOrUpdateUserMeta(
          user.uid,
          user.displayName ?? 'User',
          user.email ?? '',
          user.photoURL,
        );

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
    };
  }, []);

  // While Firebase/hydration resolves, keep the native splash visible.
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

