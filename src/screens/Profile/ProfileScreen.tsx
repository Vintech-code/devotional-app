import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, Alert, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { copyAsync, documentDirectory } from 'expo-file-system/legacy';

import { ProfileStackParamList } from '../../navigation/types';
import { useColors, Typography, Spacing, Radius } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import SettingsRow from '../../components/SettingsRow/SettingsRow';
import ToggleCard from '../../components/ToggleCard/ToggleCard';
import ReadingHeatmap from '../../components/ReadingHeatmap/ReadingHeatmap';
import { makeStyles } from './Profile.styles';
import { saveAvatarUri, getActiveUid } from '../../services/storageService';
import { auth } from '../../services/firebase';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

export default function ProfileScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const navigation = useNavigation<Nav>();
  const profile = useAppStore((s) => s.profile);
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const signOut = useAppStore((s) => s.signOut);
  const setProfile = useAppStore((s) => s.setProfile);
  const soapEntries   = useAppStore((s) => s.soapEntries);
  const mcpwaEntries  = useAppStore((s) => s.mcpwaEntries);
  const swordEntries  = useAppStore((s) => s.swordEntries);
  const sermonNotes   = useAppStore((s) => s.sermonNotes);

  const [showSignOutModal,  setShowSignOutModal]  = useState(false);
  const [signingOut,        setSigningOut]         = useState(false);
  const [avatarLoading,     setAvatarLoading]      = useState(false);

  const isAdmin = auth.currentUser?.email === 'clarkcabatuan09@gmail.com';

  const lastMonthCount = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    const end   = new Date(now.getFullYear(), now.getMonth(),     1).getTime();
    return [...soapEntries, ...mcpwaEntries, ...swordEntries, ...sermonNotes]
      .filter((e) => e.createdAt >= start && e.createdAt < end).length;
  }, [soapEntries, mcpwaEntries, swordEntries, sermonNotes]);

  async function handleConfirmSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
      setShowSignOutModal(false);
    }
  }

  async function handlePickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled) return;

    setAvatarLoading(true);
    try {
      const src = result.assets[0].uri;
      const uid = getActiveUid() ?? 'local';
      const dest = `${documentDirectory ?? ''}avatar_${uid}.jpg`;
      await copyAsync({ from: src, to: dest });
      await saveAvatarUri(dest);
      const updated = { ...(profile ?? {}), avatarUri: dest } as typeof profile & { avatarUri: string };
      setProfile(updated as NonNullable<typeof profile>);
    } catch {
      Alert.alert('Error', 'Could not save the photo. Please try again.');
    } finally {
      setAvatarLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header bar — settings icon removed */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar — tap the pencil badge to pick a photo */}
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={() => { void handlePickAvatar(); }}
          activeOpacity={0.8}
        >
          {profile?.avatarUri ? (
            <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>
                {(profile?.name ?? 'U')[0].toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.editBadge}>
            {avatarLoading
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Icon source="camera" size={12} color={colors.primary} />}
          </View>
        </TouchableOpacity>

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

        {/* Activity Heatmap */}
        <ReadingHeatmap
          entries={[...soapEntries, ...mcpwaEntries, ...swordEntries, ...sermonNotes]}
          label="DEVOTIONAL ACTIVITY"
        />

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
            icon="help-circle-outline"
            title="Support & Feedback"
            subtitle="Send us your suggestions or report a bug"
            onPress={() => navigation.navigate('Feedback')}
            style={styles.lastRow}
          />
        </View>

        {/* Admin — only visible to Clark */}
        {isAdmin && (
          <View style={styles.card}>
            <SettingsRow
              icon="shield-account"
              title="Admin Dashboard"
              subtitle="Monitor users · Reply to feedback"
              onPress={() => navigation.navigate('Admin')}
              iconBg="rgba(66,138,155,0.15)"
              style={styles.lastRow}
            />
          </View>
        )}

        {/* Sign out */}
        <View style={styles.card}>
          <SettingsRow
            icon="logout"
            title="Sign Out"
            onPress={() => setShowSignOutModal(true)}
            iconBg="#FDECEA"
            style={styles.lastRow}
          />
        </View>

        <Text style={styles.version}>DEVOVERSE VERSION 2.4.1 (BUILD 82)</Text>
      </ScrollView>

      {/* ── Sign-Out Confirmation Modal ─────────────────────────────────── */}
      <Modal
        visible={showSignOutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignOutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Icon source="logout" size={28} color="#80378f" />
            </View>
            <Text style={styles.modalTitle}>Sign Out?</Text>
            <Text style={styles.modalBody}>
              Are you sure you want to sign out? You will need to sign back in to continue your devotional journey.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setShowSignOutModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={() => { void handleConfirmSignOut(); }}
                activeOpacity={0.8}
                disabled={signingOut}
              >
                <Icon source="logout" size={16} color="#fff" />
                <Text style={styles.modalBtnConfirmText}>
                  {signingOut ? 'Signing out…' : 'Yes, Sign Out'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
