import React, { useEffect, useMemo, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '@rneui/themed';
import { onAuthStateChanged } from 'firebase/auth';

import RootNavigator from './src/navigation/RootNavigator';
import { useAppStore } from './src/store/useAppStore';
import { DarkColors, LightColors, makePaperTheme, makeRneuiTheme } from './src/theme';
import { auth } from './src/services/firebase';
import { syncOnLogin } from './src/services/syncService';
import { LocalUserData } from './src/services/storageService';
import { checkIfDisabled, registerOrUpdateUserMeta } from './src/services/feedbackService';

function AppContent() {
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
  const [ready, setReady] = useState(false);

  const colors        = isDarkMode ? DarkColors : LightColors;
  const appPaperTheme = useMemo(() => makePaperTheme(colors, isDarkMode), [colors, isDarkMode]);
  const appRneuiTheme = useMemo(() => makeRneuiTheme(colors), [colors]);

  useEffect(() => {
    // 1. Load global / device settings (dark mode, bible translation) immediately
    void hydrate();

    // 2. Wait for Firebase auth to resolve (fires from cache on restart = instant)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Load this user's UID-scoped data from AsyncStorage
        await hydrateForUser(user.uid);

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
      // Whether user is null or set, we're done loading
      setReady(true);
    });

    return unsubscribe;
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={appPaperTheme}>
      <ThemeProvider theme={appRneuiTheme}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <RootNavigator />
      </ThemeProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
