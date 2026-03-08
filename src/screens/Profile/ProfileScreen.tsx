import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ProfileStackParamList } from '../../navigation/types';
import { useColors, Typography, Spacing, Radius } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import SettingsRow from '../../components/SettingsRow/SettingsRow';
import ToggleCard from '../../components/ToggleCard/ToggleCard';
import { makeStyles } from './Profile.styles';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

export default function ProfileScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const navigation = useNavigation<Nav>();
  const profile = useAppStore((s) => s.profile);
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const setOnboardingDone = useAppStore((s) => s.setOnboardingDone);
  const soapEntries   = useAppStore((s) => s.soapEntries);
  const mcpwaEntries  = useAppStore((s) => s.mcpwaEntries);
  const swordEntries  = useAppStore((s) => s.swordEntries);
  const sermonNotes   = useAppStore((s) => s.sermonNotes);

  const lastMonthCount = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    const end   = new Date(now.getFullYear(), now.getMonth(),     1).getTime();
    return [...soapEntries, ...mcpwaEntries, ...swordEntries, ...sermonNotes]
      .filter((e) => e.createdAt >= start && e.createdAt < end).length;
  }, [soapEntries, mcpwaEntries, swordEntries, sermonNotes]);

  function handleSignOut() {
    setOnboardingDone(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header bar */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Profile</Text>
        <Icon source="cog" size={22} color={colors.textPrimary} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitials}>
              {(profile?.name ?? 'U')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.editBadge}>
            <Icon source="pencil" size={12} color={colors.textPrimary} />
          </View>
        </View>

        <Text style={styles.name}>{profile?.name ?? 'New Member'}</Text>
        <Text style={styles.memberSince}>
          Faithful member since {profile?.memberSince ?? 'today'}
        </Text>

        <Text style={styles.levelText}>
          {profile?.levelTitle ?? 'Faith Explorer'} Level
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
          <Icon source="book-multiple" size={24} color={colors.textPrimary} />
            <Text style={styles.statNum}>{profile?.completedCount ?? 0}</Text>
            <Text style={styles.statLabel}>COMPLETED</Text>
            <Text style={styles.statSub}>{lastMonthCount > 0 ? '+' : ''}{lastMonthCount} from last month</Text>
          </View>
          <View style={styles.statCard}>
          <Icon source="fire" size={24} color={colors.textPrimary} />
            <Text style={styles.statNum}>{profile?.dayStreak ?? 0}</Text>
            <Text style={styles.statLabel}>DAY STREAK</Text>
            <Text style={styles.statSub}>Your personal best!</Text>
          </View>
        </View>

        {/* My Progress */}
        <Text style={styles.sectionLabel}>MY PROGRESS</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="bell"
            title="Reminders"
            subtitle="Daily devotional notifications"
            onPress={() => navigation.navigate('Reminders')}
            style={styles.lastRow}
          />
        </View>

        {/* App Preferences */}
        <Text style={styles.sectionLabel}>APP PREFERENCES</Text>
        <ToggleCard
          icon="moon-waning-crescent"
          title="Dark Mode"
          description="Easier on the eyes at night"
          value={isDarkMode}
          onValueChange={toggleTheme}
        />
        <View style={styles.card}>
          <SettingsRow
            icon="help-circle"
            title="Support & Feedback"
            subtitle="Help us improve DevoVerse"
            onPress={() => {}}
            style={styles.lastRow}
          />
        </View>

        {/* Sign out */}
        <View style={styles.card}>
          <SettingsRow
            icon="lock-open-variant"
            title="Sign Out"
            onPress={handleSignOut}
            iconBg="#FDECEA"
            style={styles.lastRow}
          />
        </View>

        <Text style={styles.version}>DEVOVERSE VERSION 2.4.1 (BUILD 82)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
