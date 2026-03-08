import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
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
  getAllFeedbacks,
  toggleUserDisabled,
  replyToFeedback,
  AdminUserRecord,
  FeedbackItem,
  FeedbackCategory,
} from '../../services/feedbackService';
import { makeStyles } from './Admin.styles';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

// ─── Category meta ─────────────────────────────────────────────────────────────

const CAT_META: Record<FeedbackCategory, { label: string; color: string; bg: string }> = {
  bug:        { label: 'BUG',        color: '#B85A5A', bg: 'rgba(184,90,90,0.15)'  },
  suggestion: { label: 'SUGGESTION', color: '#C89A3A', bg: 'rgba(200,154,58,0.15)' },
  question:   { label: 'QUESTION',   color: '#428a9b', bg: 'rgba(66,138,155,0.15)' },
  other:      { label: 'OTHER',      color: '#888',    bg: 'rgba(136,136,136,0.15)'},
};

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

  const [activeTab,    setActiveTab]    = useState<'users' | 'feedbacks'>('users');
  const [users,        setUsers]        = useState<AdminUserRecord[]>([]);
  const [feedbacks,    setFeedbacks]    = useState<FeedbackItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingFb,    setLoadingFb]    = useState(true);
  const [errorUsers,   setErrorUsers]   = useState('');
  const [errorFb,      setErrorFb]      = useState('');

  const [search,       setSearch]       = useState('');
  const [fbFilter,     setFbFilter]     = useState<'all' | 'pending' | 'replied'>('all');
  const [expandedFbId, setExpandedFbId] = useState<string | null>(null);

  // reply state
  const [replyDraft,   setReplyDraft]   = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);

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

  const fetchFeedbacks = useCallback(async () => {
    setLoadingFb(true);
    setErrorFb('');
    try {
      const data = await getAllFeedbacks();
      setFeedbacks(data);
    } catch {
      setErrorFb('Could not load feedbacks. Check Firestore rules and your connection.');
    } finally {
      setLoadingFb(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
    void fetchFeedbacks();
  }, [fetchUsers, fetchFeedbacks]);

  // ── Actions ──────────────────────────────────────────────────────────────

  function handleToggleDisabled(user: AdminUserRecord) {
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
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const pendingCount = feedbacks.filter((f) => f.status === 'pending').length;

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (fbFilter === 'pending') return f.status === 'pending';
    if (fbFilter === 'replied') return f.status === 'replied';
    return true;
  });

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
          <Text style={styles.greetingTitle}>Welcome, Clark</Text>
          <Text style={styles.greetingSubtitle}>
            Monitor users · Manage accounts · Reply to feedback
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
          <Icon source="message-check-outline" size={18} color={colors.success} />
          <View>
            <Text style={styles.statPillNum}>{feedbacks.length - pendingCount}</Text>
            <Text style={styles.statPillLabel}>Replied</Text>
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
                  {/* Initials circle */}
                  <View style={styles.userInitialCircle}>
                    <Text style={styles.userInitialText}>
                      {(user.name[0] ?? '?').toUpperCase()}
                    </Text>
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

      {/* ── Feedbacks Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'feedbacks' && (
        <>
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
            style={styles.safe}
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
              filteredFeedbacks.map((fb) => {
                const cat    = CAT_META[fb.category] ?? CAT_META.other;
                const isOpen = expandedFbId === fb.id;
                return (
                  <View key={fb.id} style={styles.fbCard}>
                    {/* Card header — tap to expand */}
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
                            backgroundColor:
                              fb.status === 'replied' ? colors.success : colors.warning,
                          },
                        ]}
                      />
                      <Icon
                        source={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>

                    {/* Expanded body */}
                    {isOpen && (
                      <View style={styles.fbCardBody}>
                        <Text style={styles.fbFrom}>
                          From: <Text style={{ color: colors.textPrimary }}>{fb.userName}</Text>
                          {'  '}
                          <Text style={{ color: colors.primary }}>{fb.userEmail}</Text>
                        </Text>
                        <Text style={styles.fbMessage}>{fb.message}</Text>
                        <Text style={styles.fbDate}>{formatDate(fb.createdAt)}</Text>

                        {/* Reply zone */}
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
                                onChangeText={(t) =>
                                  setReplyDraft((prev) => ({ ...prev, [fb.id]: t }))
                                }
                                multiline
                                numberOfLines={3}
                              />
                              <TouchableOpacity
                                style={[
                                  styles.replyBtn,
                                  { backgroundColor: colors.primary },
                                ]}
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
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}
