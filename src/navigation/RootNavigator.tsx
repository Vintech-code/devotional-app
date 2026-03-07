import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  JournalStackParamList,
  ProfileStackParamList,
} from './types';

import { Icon } from 'react-native-paper';
import { Colors, Typography, Spacing } from '../theme';
import { useAppStore } from '../store/useAppStore';

// ─── Screens ──────────────────────────────────────────────────────────────────

import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPassword/ForgotPasswordScreen';
import MethodSelectionScreen from '../screens/MethodSelection/MethodSelectionScreen';
import CreateAccountScreen from '../screens/CreateAccount/CreateAccountScreen';

import HomeScreen from '../screens/Home/HomeScreen';
import BibleScreen from '../screens/Bible/BibleScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import RemindersScreen from '../screens/Reminders/RemindersScreen';
import JournalHistoryScreen from '../screens/JournalHistory/JournalHistoryScreen';

import JournalHomeScreen from '../screens/JournalHome/JournalHomeScreen';
import SoapJournalScreen from '../screens/SoapJournal/SoapJournalScreen';
import McpwaJournalScreen from '../screens/McpwaJournal/McpwaJournalScreen';
import SwordJournalScreen from '../screens/SwordJournal/SwordJournalScreen';
import SermonNotesScreen from '../screens/SermonNotes/SermonNotesScreen';

// ─── Tab Icon Component ───────────────────────────────────────────────────────

interface TabIconProps {
  label: string;
  focused: boolean;
}

const TAB_ICONS: Record<string, string> = {
  Home:    'home',
  Bible:   'book-open-variant',
  Journal: 'notebook',
  Profile: 'account',
};

function TabIcon({ label, focused }: TabIconProps) {
  return (
    <Icon
      source={TAB_ICONS[label] ?? 'circle'}
      size={24}
      color={focused ? Colors.primary : Colors.textMuted}
    />
  );
}

// ─── Auth Stack ───────────────────────────────────────────────────────────────

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="MethodSelection" component={MethodSelectionScreen} />
      <AuthStack.Screen name="CreateAccount" component={CreateAccountScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Journal Stack ────────────────────────────────────────────────────────────

const JournalStack = createNativeStackNavigator<JournalStackParamList>();

function JournalNavigator() {
  return (
    <JournalStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <JournalStack.Screen name="JournalHome" component={JournalHomeScreen} />
      <JournalStack.Screen name="SoapJournal" component={SoapJournalScreen} />
      <JournalStack.Screen name="McpwaJournal" component={McpwaJournalScreen} />
      <JournalStack.Screen name="SwordJournal" component={SwordJournalScreen} />
      <JournalStack.Screen name="SermonNotes" component={SermonNotesScreen} />
    </JournalStack.Navigator>
  );
}

// ─── Profile Stack ────────────────────────────────────────────────────────────

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Reminders" component={RemindersScreen} />
      <ProfileStack.Screen name="JournalHistory" component={JournalHistoryScreen} />
    </ProfileStack.Navigator>
  );
}

// ─── Tab Navigator ────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarLabel: ({ focused }) => (
          <Text
            style={[
              styles.tabLabel,
              { color: focused ? Colors.primary : Colors.textMuted },
            ]}
          >
            {route.name}
          </Text>
        ),
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bible" component={BibleScreen} />
      <Tab.Screen name="Journal" component={JournalNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────

const Root = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const isOnboardingDone = useAppStore((s) => s.isOnboardingDone);

  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      {!isOnboardingDone ? (
        <Root.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Root.Screen name="Main" component={MainNavigator} />
      )}
    </Root.Navigator>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: Spacing.sm,
  },
  tabLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },
});
