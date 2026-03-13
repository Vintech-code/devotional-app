import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ProfileStackParamList } from '../../navigation/types';
import { useColors, Spacing } from '../../theme';
import {
  getAllUsers,
  getAllAppRatingsForAdmin,
  toggleUserDisabled,
  AdminUserRecord,
  AppRating,
} from '../../services/feedbackService';
import { makeStyles } from './Admin.styles';
import { auth } from '../../services/firebase';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

function formatDate(ts: number): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminScreen() {
  const colors     = useColors();
  const styles     = makeStyles(colors);
  const navigation = useNavigation<Nav>();
  const adminUid   = auth.currentUser?.uid ?? '';

  const [activeTab,    setActiveTab]    = useState<'users' | 'ratings'>('users');
  const [users,        setUsers]        = useState<AdminUserRecord[]>([]);
  const [ratings,      setRatings]      = useState<AppRating[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [errorUsers,   setErrorUsers]   = useState('');
  const [errorRatings, setErrorRatings] = useState('');

  const [search,       setSearch]       = useState('');

  // ── Loaders ─────────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setErrorUsers('');
    try {
      const data = await getAllUsers();
      setUsers(data.sort((a, b) => b.registeredAt - a.registeredAt));
    } catch {
      setErrorUsers('Could not load users. Check Firestore rules and your connection.');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchRatings = useCallback(async () => {
    setLoadingRatings(true);
    setErrorRatings('');
    try {
      const adminEmail = auth.currentUser?.email ?? '';
      if (!adminEmail) {
        setRatings([]);
        return;
      }
      const data = await getAllAppRatingsForAdmin(adminEmail);
      setRatings(data);
    } catch {
      setErrorRatings('Could not load ratings. Check Firestore rules and your connection.');
    } finally {
      setLoadingRatings(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
    void fetchRatings();
  }, [fetchUsers, fetchRatings]);

  // ── Actions ──────────────────────────────────────────────────────────────

  function handleToggleDisabled(user: AdminUserRecord) {
    if (user.uid === adminUid) {
      Alert.alert('Not Allowed', 'You cannot disable your own admin account.');
      return;
    }
    const next = !user.disabled;
    Alert.alert(
      next ? 'Disable Account' : 'Enable Account',
      next
        ? `Are you sure you want to disable ${user.name}'s account? They will be signed out automatically.`
        : `Re-enable ${user.name}'s account so they can sign back in?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: next ? 'Disable' : 'Enable',
          style: next ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await toggleUserDisabled(user.uid, next);
              setUsers((prev) =>
                prev.map((u) => (u.uid === user.uid ? { ...u, disabled: next } : u)),
              );
            } catch {
              Alert.alert('Error', 'Failed to update account status. Please try again.');
            }
          },
        },
      ],
    );
  }

  // ── Derived lists ─────────────────────────────────────────────────────────

  const filteredUsers = users.filter((u) => {
    if (u.uid === adminUid) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const averageRating = ratings.length === 0
    ? 0
    : ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon source="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={styles.adminBadge}>
          <Icon source="shield-account" size={14} color={colors.primary} />
          <Text style={styles.adminBadgeText}>ADMIN</Text>
        </View>
      </View>

      {/* Greeting */}
      <View style={styles.greetingBanner}>
        <View style={styles.greetingIconWrap}>
          <Icon source="shield-crown-outline" size={26} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.greetingTitle}>Welcome, {auth.currentUser?.displayName ?? 'Admin'}</Text>
          <Text style={styles.greetingSubtitle}>
            Monitor users · Manage accounts · Review ratings
          </Text>
        </View>
      </View>

      {/* Stats pills */}
      <View style={styles.statsRow}>
        <View style={styles.statPill}>
          <Icon source="account-group-outline" size={18} color={colors.primary} />
          <View>
            <Text style={styles.statPillNum}>{users.length}</Text>
            <Text style={styles.statPillLabel}>Users</Text>
          </View>
        </View>
        <View style={styles.statPill}>
          <Icon source="star" size={18} color="#EAB308" />
          <View>
            <Text style={styles.statPillNum}>{averageRating.toFixed(1)}</Text>
            <Text style={styles.statPillLabel}>Avg Rating</Text>
          </View>
        </View>
        <View style={styles.statPill}>
          <Icon source="star-check-outline" size={18} color={colors.success} />
          <View>
            <Text style={styles.statPillNum}>{ratings.length}</Text>
            <Text style={styles.statPillLabel}>Ratings</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.tabActive]}
          onPress={() => setActiveTab('users')}
          activeOpacity={0.8}
        >
          <Icon
            source="account-multiple-outline"
            size={16}
            color={activeTab === 'users' ? colors.textPrimary : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
            Users
          </Text>
          {users.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{users.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'ratings' && styles.tabActive]}
          onPress={() => setActiveTab('ratings')}
          activeOpacity={0.8}
        >
          <Icon
            source="star-outline"
            size={16}
            color={activeTab === 'ratings' ? colors.textPrimary : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'ratings' && styles.tabTextActive]}>
            Ratings
          </Text>
          {ratings.length > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: colors.success }]}> 
              <Text style={styles.tabBadgeText}>{ratings.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Users Tab ──────────────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <>
          <View style={styles.searchWrap}>
            <Icon source="magnify" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email…"
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
                <Icon source="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            style={styles.safe}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {loadingUsers ? (
              <View style={styles.centeredMsg}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.centeredMsgText}>Loading users…</Text>
              </View>
            ) : errorUsers ? (
              <View style={styles.centeredMsg}>
                <Icon source="alert-circle-outline" size={36} color={colors.error} />
                <Text style={[styles.centeredMsgText, { color: colors.error }]}>{errorUsers}</Text>
                <TouchableOpacity
                  onPress={() => { void fetchUsers(); }}
                  style={{ marginTop: Spacing.md, padding: Spacing.sm }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : filteredUsers.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Icon source="account-off-outline" size={40} color={colors.textMuted} />
                <Text style={styles.emptyText}>
                  {search ? 'No users match your search.' : 'No users registered yet.'}
                </Text>
              </View>
            ) : (
              filteredUsers.map((user) => (
                <View key={user.uid} style={styles.userCard}>
                  {/* Avatar */}
                  <View style={styles.userInitialCircle}>
                    {user.avatarUri ? (
                      <Image
                        source={{ uri: user.avatarUri }}
                        style={{ width: 44, height: 44, borderRadius: 22 }}
                      />
                    ) : (
                      <Text style={styles.userInitialText}>
                        {(user.name[0] ?? '?').toUpperCase()}
                      </Text>
                    )}
                  </View>

                  {/* Info */}
                  <View style={styles.userCardBody}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.userCardName} numberOfLines={1}>
                        {user.name}
                      </Text>
                      {user.disabled && (
                        <View style={styles.disabledBadge}>
                          <Text style={styles.disabledBadgeText}>DISABLED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.userCardEmail} numberOfLines={1}>{user.email}</Text>
                    <View style={styles.userCardMeta}>
                      <View style={styles.userMetaTag}>
                        <Icon source="calendar-outline" size={11} color={colors.textMuted} />
                        <Text style={styles.userMetaText}>{formatDate(user.registeredAt)}</Text>
                      </View>
                      <View style={styles.userMetaTag}>
                        <Icon source="book-open-outline" size={11} color={colors.textMuted} />
                        <Text style={styles.userMetaText}>{user.entryCount} entries</Text>
                      </View>
                    </View>
                  </View>

                  {/* Disable toggle */}
                  <View style={styles.toggleWrap}>
                    <Switch
                      value={!user.disabled}
                      onValueChange={() => handleToggleDisabled(user)}
                      trackColor={{ false: '#B85A5A55', true: `${colors.primary}55` }}
                      thumbColor={user.disabled ? '#B85A5A' : colors.primary}
                    />
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}

      {/* ── Ratings Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'ratings' && (
        <ScrollView
          style={styles.safe}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.ratingsSummaryCard}>
            <Text style={styles.ratingsSummaryTitle}>App Rating Summary</Text>
            <View style={styles.ratingsSummaryRow}>
              <Text style={styles.ratingsSummaryScore}>{averageRating.toFixed(1)}</Text>
              <Icon source="star" size={18} color="#EAB308" />
              <Text style={styles.ratingsSummaryMeta}>from {ratings.length} ratings</Text>
            </View>
          </View>

          {loadingRatings ? (
            <View style={styles.centeredMsg}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.centeredMsgText}>Loading ratings…</Text>
            </View>
          ) : errorRatings ? (
            <View style={styles.centeredMsg}>
              <Icon source="alert-circle-outline" size={36} color={colors.error} />
              <Text style={[styles.centeredMsgText, { color: colors.error }]}>{errorRatings}</Text>
              <TouchableOpacity
                onPress={() => { void fetchRatings(); }}
                style={{ marginTop: Spacing.md, padding: Spacing.sm }}
              >
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : ratings.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Icon source="star-off-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyText}>No ratings submitted yet.</Text>
            </View>
          ) : (
            ratings.map((r) => (
              <View key={r.id} style={styles.ratingCard}>
                <View style={styles.ratingHead}>
                  <Text style={styles.ratingName}>{r.userName || 'User'}</Text>
                  <Text style={styles.ratingDate}>{formatDate(r.updatedAt || r.createdAt)}</Text>
                </View>
                <Text style={styles.ratingEmail}>{r.userEmail}</Text>
                <View style={styles.ratingStarsRow}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Icon
                      key={n}
                      source={n <= r.stars ? 'star' : 'star-outline'}
                      size={16}
                      color={n <= r.stars ? '#EAB308' : colors.textMuted}
                    />
                  ))}
                  <Text style={styles.ratingStarsText}>{r.stars}/5</Text>
                </View>
                {r.review ? <Text style={styles.ratingReview}>{r.review}</Text> : null}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
