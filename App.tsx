import React, { useEffect, useMemo, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
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

function AppContent() {
  const hydrate = useAppStore((s) => s.hydrate);
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const setFirebaseUid = useAppStore((s) => s.setFirebaseUid);
  const [ready, setReady] = useState(false);

  const colors = isDarkMode ? DarkColors : LightColors;
  const appPaperTheme = useMemo(() => makePaperTheme(colors, isDarkMode), [colors, isDarkMode]);
  const appRneuiTheme = useMemo(() => makeRneuiTheme(colors), [colors]);

  useEffect(() => {
    // Hydrate local state first, then mark ready
    hydrate().then(() => setReady(true));

    // Keep the store in sync with Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUid(user ? user.uid : null);
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
