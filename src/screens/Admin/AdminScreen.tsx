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
import { FirebaseError } from 'firebase/app';
import { onAuthStateChanged, User } from 'firebase/auth';

import { ProfileStackParamList } from '../../navigation/types';
import { useColors, Spacing } from '../../theme';
import {
  getAllUsers,
  getAllFeedbacks,
  getAllAppRatingsForAdmin,
  toggleUserDisabled,
  replyToFeedback,
  APP_ADMIN_EMAIL,
  AdminUserRecord,
  FeedbackItem,
  FeedbackCategory,
  AppRating,
} from '../../services/feedbackService';
import { makeStyles } from './Admin.styles';
import { auth } from '../../services/firebase';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const CAT_META: Record<FeedbackCategory, { label: string; color: string; bg: string }> = {
  bug:        { label: 'BUG',        color: '#B85A5A', bg: 'rgba(184,90,90,0.15)'  },
  suggestion: { label: 'SUGGESTION', color: '#C89A3A', bg: 'rgba(200,154,58,0.15)' },
  question:   { label: 'QUESTION',   color: '#428a9b', bg: 'rgba(66,138,155,0.15)' },
  other:      { label: 'OTHER',      color: '#888',    bg: 'rgba(136,136,136,0.15)'},
};

const PAGE_SIZE = 8;

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

  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const adminUid = currentUser?.uid ?? '';

  const [activeTab,    setActiveTab]    = useState<'users' | 'feedbacks' | 'ratings'>('users');
  const [users,        setUsers]        = useState<AdminUserRecord[]>([]);
  const [feedbacks,    setFeedbacks]    = useState<FeedbackItem[]>([]);
  const [ratings,      setRatings]      = useState<AppRating[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingFb,    setLoadingFb]    = useState(true);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [errorUsers,   setErrorUsers]   = useState('');
  const [errorFb,      setErrorFb]      = useState('');
  const [errorRatings, setErrorRatings] = useState('');

  const [search,       setSearch]       = useState('');
  const [fbFilter,     setFbFilter]     = useState<'all' | 'pending' | 'replied'>('all');
  const [expandedFbId, setExpandedFbId] = useState<string | null>(null);
  const [replyDraft,   setReplyDraft]   = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);
  const [usersVisible, setUsersVisible] = useState(PAGE_SIZE);
  const [feedbacksVisible, setFeedbacksVisible] = useState(PAGE_SIZE);
  const [ratingsVisible, setRatingsVisible] = useState(PAGE_SIZE);

  const mapAdminLoadError = useCallback(
    (error: unknown, resource: 'users' | 'feedbacks' | 'ratings'): string => {
      if (!currentUser) {
        return 'Admin session is not ready yet. Please wait a moment and retry.';
      }

      const signedInEmail = currentUser.email ?? 'no-email-account';
      if (error instanceof FirebaseError) {
        if (error.code === 'permission-denied') {
          if (signedInEmail.toLowerCase() === APP_ADMIN_EMAIL.toLowerCase()) {
            return `Access denied loading ${resource}. Your email matches admin (${signedInEmail}), so live Firestore rules are likely not updated in project devotional-app-dcdaf, or this account still lacks project IAM permissions.`;
          }
          return `Access denied loading ${resource}. Signed in as ${signedInEmail}. Admin must be ${APP_ADMIN_EMAIL} in Firestore rules.`;
        }
        if (error.code === 'unavailable') {
          return `Could not load ${resource}. Firestore is currently unavailable; check your connection and retry.`;
        }
        return `Could not load ${resource} (${error.code}).`;
      }

      return `Could not load ${resource}. Please retry.`;
    },
    [currentUser],
  );

  // ── Loaders ─────────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    if (!currentUser) {
      setLoadingUsers(false);
      setErrorUsers('Please sign in as admin to view users.');
      return;
    }

    setLoadingUsers(true);
    setErrorUsers('');
    try {
      await currentUser.getIdToken();
      const data = await getAllUsers();
      setUsers(data.sort((a, b) => b.registeredAt - a.registeredAt));
    } catch (error) {
      setErrorUsers(mapAdminLoadError(error, 'users'));
    } finally {
      setLoadingUsers(false);
    }
  }, [currentUser, mapAdminLoadError]);

  const fetchFeedbacks = useCallback(async () => {
    if (!currentUser) {
      setLoadingFb(false);
      setErrorFb('Please sign in as admin to view feedbacks.');
      return;
    }

    setLoadingFb(true);
    setErrorFb('');
    try {
      await currentUser.getIdToken();
      const data = await getAllFeedbacks();
      setFeedbacks(data);
    } catch (error) {
      setErrorFb(mapAdminLoadError(error, 'feedbacks'));
    } finally {
      setLoadingFb(false);
    }
  }, [currentUser, mapAdminLoadError]);

  const fetchRatings = useCallback(async () => {
    if (!currentUser) {
      setLoadingRatings(false);
      setErrorRatings('Please sign in as admin to view ratings.');
      return;
    }

    setLoadingRatings(true);
    setErrorRatings('');
    try {
      await currentUser.getIdToken();
      const adminEmail = currentUser.email ?? '';
      if (!adminEmail) {
        setRatings([]);
        setErrorRatings('This account has no email. Admin access requires an email-based account.');
        return;
      }
      const data = await getAllAppRatingsForAdmin(adminEmail);
      setRatings(data);
    } catch (error) {
      setErrorRatings(mapAdminLoadError(error, 'ratings'));
    } finally {
      setLoadingRatings(false);
    }
  }, [currentUser, mapAdminLoadError]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setCurrentUser(nextUser);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!authReady) return;
    void fetchUsers();
    void fetchFeedbacks();
    void fetchRatings();
  }, [authReady, fetchUsers, fetchFeedbacks, fetchRatings]);

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

  async function handleSendReply(fb: FeedbackItem) {
    const draft = (replyDraft[fb.id] ?? '').trim();
    if (draft.length < 2) {
      Alert.alert('Reply empty', 'Write a reply before sending.');
      return;
    }

    setSendingReply(fb.id);
    try {
      await replyToFeedback(fb.id, draft);
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === fb.id
            ? { ...f, adminReply: draft, repliedAt: Date.now(), status: 'replied' }
            : f,
        ),
      );
      setReplyDraft((prev) => ({ ...prev, [fb.id]: '' }));
      setExpandedFbId(null);
    } catch {
      Alert.alert('Error', 'Could not send reply. Please try again.');
    } finally {
      setSendingReply(null);
    }
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

  const pendingCount = feedbacks.filter((f) => f.status === 'pending').length;

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (fbFilter === 'pending') return f.status === 'pending';
    if (fbFilter === 'replied') return f.status === 'replied';
    return true;
  });

  const visibleUsers = filteredUsers.slice(0, usersVisible);
  const visibleFeedbacks = filteredFeedbacks.slice(0, feedbacksVisible);
  const visibleRatings = ratings.slice(0, ratingsVisible);

  useEffect(() => {
    setUsersVisible(PAGE_SIZE);
  }, [search, users.length]);

  useEffect(() => {
    setFeedbacksVisible(PAGE_SIZE);
  }, [fbFilter, feedbacks.length]);

  useEffect(() => {
    setRatingsVisible(PAGE_SIZE);
  }, [ratings.length]);

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
          <Text style={styles.greetingTitle}>Welcome, {currentUser?.displayName ?? 'Admin'}</Text>
          <Text style={styles.greetingSubtitle}>
            Monitor users · Check feedback · Review ratings
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
          <Icon source="message-alert-outline" size={18} color={colors.warning} />
          <View>
            <Text style={styles.statPillNum}>{pendingCount}</Text>
            <Text style={styles.statPillLabel}>Pending</Text>
          </View>
        </View>
        <View style={styles.statPill}>
          <Icon source="star" size={18} color="#EAB308" />
          <View>
            <Text style={styles.statPillNum}>{averageRating.toFixed(1)}</Text>
            <Text style={styles.statPillLabel}>Avg Rating</Text>
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
          style={[styles.tab, activeTab === 'feedbacks' && styles.tabActive]}
          onPress={() => setActiveTab('feedbacks')}
          activeOpacity={0.8}
        >
          <Icon
            source="message-text-outline"
            size={16}
            color={activeTab === 'feedbacks' ? colors.textPrimary : colors.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'feedbacks' && styles.tabTextActive]}>
            Feedbacks
          </Text>
          {pendingCount > 0 && (
            <View style={[styles.tabBadge, { backgroundColor: colors.warning }]}>
              <Text style={styles.tabBadgeText}>{pendingCount}</Text>
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
        <View style={styles.tabPane}>
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
            style={styles.listScroll}
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
              visibleUsers.map((user) => (
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

            {!loadingUsers && !errorUsers && filteredUsers.length > visibleUsers.length && (
              <TouchableOpacity
                onPress={() => setUsersVisible((prev) => prev + PAGE_SIZE)}
                style={{ alignSelf: 'center', marginTop: Spacing.sm, padding: Spacing.sm }}
              >
                <Text style={{ color: colors.primary, fontWeight: '600' }}>
                  Load more users ({filteredUsers.length - visibleUsers.length} remaining)
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      {/* ── Feedbacks Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'feedbacks' && (
        <View style={styles.tabPane}>
          <View style={styles.filterRow}>
            {(['all', 'pending', 'replied'] as const).map((f) => {
              const active = fbFilter === f;
              return (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceAlt,
                      borderColor:     active ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setFbFilter(f)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: active ? '#fff' : colors.textSecondary },
                    ]}
                  >
                    {f === 'all' ? 'All' : f === 'pending' ? '⏳ Pending' : '✓ Replied'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {loadingFb ? (
              <View style={styles.centeredMsg}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.centeredMsgText}>Loading feedbacks…</Text>
              </View>
            ) : errorFb ? (
              <View style={styles.centeredMsg}>
                <Icon source="alert-circle-outline" size={36} color={colors.error} />
                <Text style={[styles.centeredMsgText, { color: colors.error }]}>{errorFb}</Text>
                <TouchableOpacity
                  onPress={() => { void fetchFeedbacks(); }}
                  style={{ marginTop: Spacing.md, padding: Spacing.sm }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : filteredFeedbacks.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Icon source="inbox-outline" size={40} color={colors.textMuted} />
                <Text style={styles.emptyText}>
                  {fbFilter !== 'all' ? 'No feedbacks with this filter.' : 'No feedbacks yet.'}
                </Text>
              </View>
            ) : (
              visibleFeedbacks.map((fb) => {
                const cat = CAT_META[fb.category] ?? CAT_META.other;
                const isOpen = expandedFbId === fb.id;
                return (
                  <View key={fb.id} style={styles.fbCard}>
                    <TouchableOpacity
                      style={styles.fbCardHead}
                      onPress={() => setExpandedFbId(isOpen ? null : fb.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.fbCategoryBadge, { backgroundColor: cat.bg }]}>
                        <Text style={[styles.fbCategoryText, { color: cat.color }]}>
                          {cat.label}
                        </Text>
                      </View>
                      <Text style={styles.fbSubject} numberOfLines={isOpen ? undefined : 1}>
                        {fb.subject}
                      </Text>
                      <View
                        style={[
                          styles.fbStatusDot,
                          {
                            backgroundColor: fb.status === 'replied' ? colors.success : colors.warning,
                          },
                        ]}
                      />
                      <Icon
                        source={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>

                    {isOpen && (
                      <View style={styles.fbCardBody}>
                        <Text style={styles.fbFrom}>
                          From: <Text style={{ color: colors.textPrimary }}>{fb.userName}</Text>
                          {'  '}
                          <Text style={{ color: colors.primary }}>{fb.userEmail}</Text>
                        </Text>
                        <Text style={styles.fbMessage}>{fb.message}</Text>
                        <Text style={styles.fbDate}>{formatDate(fb.createdAt)}</Text>

                        <View style={styles.replySection}>
                          {fb.status === 'replied' && fb.adminReply ? (
                            <>
                              <Text style={styles.replyExistingLabel}>YOUR REPLY</Text>
                              <Text style={styles.replyExistingText}>"{fb.adminReply}"</Text>
                            </>
                          ) : (
                            <>
                              <Text style={styles.replyInputLabel}>REPLY TO USER</Text>
                              <TextInput
                                style={styles.replyInput}
                                placeholder="Write your reply…"
                                placeholderTextColor={colors.textMuted}
                                value={replyDraft[fb.id] ?? ''}
                                onChangeText={(t) => setReplyDraft((prev) => ({ ...prev, [fb.id]: t }))}
                                multiline
                                numberOfLines={3}
                              />
                              <TouchableOpacity
                                style={[styles.replyBtn, { backgroundColor: colors.primary }]}
                                onPress={() => { void handleSendReply(fb); }}
                                disabled={sendingReply === fb.id}
                                activeOpacity={0.85}
                              >
                                {sendingReply === fb.id ? (
                                  <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                  <>
                                    <Icon source="send" size={15} color="#fff" />
                                    <Text style={styles.replyBtnText}>Send Reply</Text>
                                  </>
                                )}
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            )}

            {!loadingFb && !errorFb && filteredFeedbacks.length > visibleFeedbacks.length && (
              <TouchableOpacity
                onPress={() => setFeedbacksVisible((prev) => prev + PAGE_SIZE)}
                style={{ alignSelf: 'center', marginTop: Spacing.sm, padding: Spacing.sm }}
              >
                <Text style={{ color: colors.primary, fontWeight: '600' }}>
                  Load more feedbacks ({filteredFeedbacks.length - visibleFeedbacks.length} remaining)
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      {/* ── Ratings Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'ratings' && (
        <View style={styles.tabPane}>
          <ScrollView
            style={styles.listScroll}
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
              visibleRatings.map((r) => (
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

            {!loadingRatings && !errorRatings && ratings.length > visibleRatings.length && (
              <TouchableOpacity
                onPress={() => setRatingsVisible((prev) => prev + PAGE_SIZE)}
                style={{ alignSelf: 'center', marginTop: Spacing.sm, padding: Spacing.sm }}
              >
                <Text style={{ color: colors.primary, fontWeight: '600' }}>
                  Load more ratings ({ratings.length - visibleRatings.length} remaining)
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}
