import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  HomeStackParamList,
  BibleStackParamList,
  HistoryStackParamList,
  JournalStackParamList,
  ProfileStackParamList,
} from './types';

import { Icon } from 'react-native-paper';
import { useColors, Typography, Spacing } from '../theme';
import { useAppStore } from '../store/useAppStore';

// ─── Screens ──────────────────────────────────────────────────────────────────

import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import AllSetScreen from '../screens/AllSet/AllSetScreen';
import LoginScreen from '../screens/Login/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPassword/ForgotPasswordScreen';
import MethodSelectionScreen from '../screens/MethodSelection/MethodSelectionScreen';
import CreateAccountScreen from '../screens/CreateAccount/CreateAccountScreen';

import HomeScreen from '../screens/Home/HomeScreen';
import BooksScreen from '../screens/BibleBooks/BooksScreen';
import ChaptersScreen from '../screens/BibleChapters/ChaptersScreen';
import VersesScreen from '../screens/BibleVerses/VersesScreen';
import BibleScreen from '../screens/Bible/BibleScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import RemindersScreen from '../screens/Reminders/RemindersScreen';
import FeedbackScreen from '../screens/Feedback/FeedbackScreen';
import AdminScreen from '../screens/Admin/AdminScreen';
import JournalHistoryScreen from '../screens/JournalHistory/JournalHistoryScreen';
import DevotionalDetailScreen from '../screens/DevotionalDetail/DevotionalDetailScreen';

import JournalHomeScreen from '../screens/JournalHome/JournalHomeScreen';
import SoapJournalScreen from '../screens/SoapJournal/SoapJournalScreen';
import McpwaJournalScreen from '../screens/McpwaJournal/McpwaJournalScreen';
import SwordJournalScreen from '../screens/SwordJournal/SwordJournalScreen';
import PrayJournalScreen from '../screens/PrayJournal/PrayJournalScreen';
import ActsJournalScreen from '../screens/ActsJournal/ActsJournalScreen';
import SermonNotesScreen from '../screens/SermonNotes/SermonNotesScreen';
import PrayerJournalScreen from '../screens/PrayerJournal/PrayerJournalScreen';
import VerseOfDayScreen from '../screens/VerseOfDay/VerseOfDayScreen';
import ReadingPlansScreen from '../screens/ReadingPlan/ReadingPlansScreen';
import AccountabilityScreen from '../screens/Accountability/AccountabilityScreen';
import ReadingPlanDetailScreen from '../screens/ReadingPlan/ReadingPlanDetailScreen';

// ─── Tab Icon Component ───────────────────────────────────────────────────────

interface TabIconProps {
  label: string;
  focused: boolean;
}

const TAB_ICONS: Record<string, string> = {
  Home:    'home',
  Bible:   'book-open-variant',
  Journal: 'notebook',
  History: 'history',
  Profile: 'account',
};

function TabIcon({ label, focused }: TabIconProps) {
  const colors = useColors();
  return (
    <Icon
      source={TAB_ICONS[label] ?? 'circle'}
      size={24}
      color={focused ? colors.textPrimary : colors.textSecondary}
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
      <AuthStack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <AuthStack.Screen name="AllSet" component={AllSetScreen} />
      <AuthStack.Screen name="MethodSelection" component={MethodSelectionScreen} />
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
      <JournalStack.Screen name="PrayJournal" component={PrayJournalScreen} />
      <JournalStack.Screen name="ActsJournal" component={ActsJournalScreen} />
      <JournalStack.Screen name="SermonNotes" component={SermonNotesScreen} />
      <JournalStack.Screen name="PrayerJournal" component={PrayerJournalScreen} />
    </JournalStack.Navigator>
  );
}

// ─── Bible Stack ──────────────────────────────────────────────────────────────

const BibleStack = createNativeStackNavigator<BibleStackParamList>();

function BibleNavigator() {
  return (
    <BibleStack.Navigator screenOptions={{ headerShown: false }}>
      <BibleStack.Screen name="Books"    component={BooksScreen} />
      <BibleStack.Screen name="Chapters" component={ChaptersScreen} />
      <BibleStack.Screen name="Verses"   component={VersesScreen} />
    </BibleStack.Navigator>
  );
}

// ─── Home Stack ──────────────────────────────────────────────────────────────

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain"          component={HomeScreen} />
      <HomeStack.Screen name="VerseOfDay"        component={VerseOfDayScreen} />
      <HomeStack.Screen name="ReadingPlans"      component={ReadingPlansScreen} />
      <HomeStack.Screen name="ReadingPlanDetail" component={ReadingPlanDetailScreen} />
    </HomeStack.Navigator>
  );
}

// ─── History Stack ────────────────────────────────────────────────────────────

const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();

function HistoryNavigator() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="HistoryMain" component={JournalHistoryScreen} />
      <HistoryStack.Screen name="DevotionalDetail" component={DevotionalDetailScreen} />
    </HistoryStack.Navigator>
  );
}

// ─── Profile Stack ────────────────────────────────────────────────────────────

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain"    component={ProfileScreen} />
      <ProfileStack.Screen name="Reminders"      component={RemindersScreen} />
      <ProfileStack.Screen name="Feedback"       component={FeedbackScreen} />
      <ProfileStack.Screen name="Admin"          component={AdminScreen} />
      <ProfileStack.Screen name="Accountability" component={AccountabilityScreen} />
    </ProfileStack.Navigator>
  );
}

// ─── Tab Navigator ────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<MainTabParamList>();

function MainNavigator() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const styles = StyleSheet.create({
    tabBar: {
      backgroundColor: colors.surface,
      borderTopColor: colors.border,
      borderTopWidth: 1,
      height: 64 + insets.bottom,
      paddingBottom: Spacing.sm + insets.bottom,
    },
    tabLabel: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.medium,
    },
  });
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarLabel: ({ focused }) => (
          <Text
            style={[
              styles.tabLabel,
              { color: focused ? colors.primary : colors.textMuted },
            ]}
          >
            {route.name}
          </Text>
        ),
        tabBarStyle: styles.tabBar,
      })}
    >
      <Tab.Screen name="Home"    component={HomeNavigator} />
      <Tab.Screen name="Bible"   component={BibleNavigator} />
      <Tab.Screen name="Journal" component={JournalNavigator} />
      <Tab.Screen name="History" component={HistoryNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────

const Root = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const isOnboardingDone = useAppStore((s) => s.isOnboardingDone);

  return (
    <Root.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {!isOnboardingDone ? (
        <Root.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Root.Screen name="Main" component={MainNavigator} />
      )}
    </Root.Navigator>
  );
}


