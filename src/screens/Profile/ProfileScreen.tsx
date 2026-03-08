import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, Linking, Alert } from 'react-native';
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
  const signOut = useAppStore((s) => s.signOut);
  const soapEntries   = useAppStore((s) => s.soapEntries);
  const mcpwaEntries  = useAppStore((s) => s.mcpwaEntries);
  const swordEntries  = useAppStore((s) => s.swordEntries);
  const sermonNotes   = useAppStore((s) => s.sermonNotes);

  const [showSignOutModal,  setShowSignOutModal]  = useState(false);
  const [showSupportModal,  setShowSupportModal]  = useState(false);
  const [signingOut,        setSigningOut]         = useState(false);

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

  function handleEmailSupport() {
    void Linking.openURL('mailto:clarkcabatuan09@gmail.com?subject=DevoVerse%20Support%20%26%20Feedback');
  }

  function handleFacebookSupport() {
    // Deep-link to the Facebook app; fall back to browser
    void Linking.openURL('fb://search/?q=Clark+Vincent+Cabatuan').catch(() =>
      Linking.openURL('https://www.facebook.com/search/top?q=Clark%20Vincent%20Cabatuan'),
    );
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
            icon="help-circle-outline"
            title="Support & Feedback"
            subtitle="Get help or send us your feedback"
            onPress={() => setShowSupportModal(true)}
            style={styles.lastRow}
          />
        </View>

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

      {/* ── Support & Feedback Modal ────────────────────────────────────── */}
      <Modal
        visible={showSupportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSupportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Icon source="help-circle-outline" size={28} color={colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Support & Feedback</Text>
            <Text style={styles.modalBody}>
              Have a question, bug report, or idea? We'd love to hear from you! Your feedback helps us improve the app and create a better experience for everyone.
            </Text>

            {/* Email */}
            <TouchableOpacity
              style={styles.contactRow}
              onPress={handleEmailSupport}
              activeOpacity={0.8}
            >
              <View style={[styles.contactIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Icon source="email-outline" size={20} color="#3B82F6" />
              </View>
              <View style={styles.contactTextWrap}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>clarkcabatuan09@gmail.com</Text>
              </View>
              <Icon source="open-in-new" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Facebook */}
            <TouchableOpacity
              style={[styles.contactRow, { marginBottom: 0 }]}
              onPress={handleFacebookSupport}
              activeOpacity={0.8}
            >
              <View style={[styles.contactIconWrap, { backgroundColor: '#EEF2FF' }]}>
                <Icon source="facebook" size={20} color="#4F46E5" />
              </View>
              <View style={styles.contactTextWrap}>
                <Text style={styles.contactLabel}>Facebook</Text>
                <Text style={styles.contactValue}>Clark Vincent Cabatuan</Text>
              </View>
              <Icon source="open-in-new" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, styles.modalBtnCancel, { marginTop: Spacing.xl, width: '100%' }]}
              onPress={() => setShowSupportModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
