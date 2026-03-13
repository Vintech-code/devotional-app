import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ProfileStackParamList } from '../../navigation/types';
import { useColors, Spacing } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { auth } from '../../services/firebase';
import {
  submitFeedback,
  getUserFeedbacks,
  submitAppRating,
  getUserAppRating,
  AppRating,
  FeedbackItem,
  FeedbackCategory,
} from '../../services/feedbackService';
import { cancelRateAppReminder, cancelFeedbackReminder } from '../../services/notificationService';
import { makeStyles } from './Feedback.styles';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_MESSAGE = 1000;

const CATEGORIES: {
  key: FeedbackCategory;
  label: string;
  icon: string;
  color: string;
  bg: string;
}[] = [
  { key: 'bug',        label: 'Bug Report',  icon: 'bug-outline',           color: '#B85A5A', bg: '#2A1515' },
  { key: 'suggestion', label: 'Suggestion',  icon: 'lightbulb-outline',     color: '#C89A3A', bg: '#2A2010' },
  { key: 'question',   label: 'Question',    icon: 'help-circle-outline',   color: '#428a9b', bg: '#0D1E22' },
  { key: 'other',      label: 'Other',       icon: 'dots-horizontal-circle-outline', color: '#888', bg: '#222' },
];

const CATEGORY_META: Record<FeedbackCategory, { label: string; color: string; bg: string }> = {
  bug:        { label: 'BUG',         color: '#B85A5A', bg: 'rgba(184,90,90,0.15)'  },
  suggestion: { label: 'SUGGESTION',  color: '#C89A3A', bg: 'rgba(200,154,58,0.15)' },
  question:   { label: 'QUESTION',    color: '#428a9b', bg: 'rgba(66,138,155,0.15)' },
  other:      { label: 'OTHER',       color: '#888',    bg: 'rgba(136,136,136,0.15)'},
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FeedbackScreen() {
  const colors     = useColors();
  const styles     = makeStyles(colors);
  const navigation = useNavigation<Nav>();
  const profile    = useAppStore((s) => s.profile);
  const firebaseUid = useAppStore((s) => s.firebaseUid);

  const [category,    setCategory]    = useState<FeedbackCategory>('suggestion');
  const [subject,     setSubject]     = useState('');
  const [message,     setMessage]     = useState('');
  const [subjectFocused, setSubjectFocused] = useState(false);
  const [msgFocused,     setMsgFocused]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedbacks,   setFeedbacks]   = useState<FeedbackItem[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [selectedStars, setSelectedStars] = useState(0);
  const [ratingReview, setRatingReview] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState<AppRating | null>(null);

  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadFeedbacks = useCallback(async () => {
    if (!firebaseUid) { setLoading(false); return; }
    try {
      const [items, rating] = await Promise.all([
        getUserFeedbacks(firebaseUid),
        getUserAppRating(firebaseUid),
      ]);
      setFeedbacks(items);
      setExistingRating(rating);
      setSelectedStars(rating?.stars ?? 0);
      setRatingReview(rating?.review ?? '');
    } catch {
      // Offline — show empty list silently
    } finally {
      setLoading(false);
    }
  }, [firebaseUid]);

  useEffect(() => {
    void loadFeedbacks();
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    };
  }, [loadFeedbacks]);

  async function handleSubmit() {
    if (!firebaseUid) return;
    if (subject.trim().length < 3) {
      Alert.alert('Subject required', 'Please enter a subject with at least 3 characters.');
      return;
    }
    if (message.trim().length < 10) {
      Alert.alert('Message too short', 'Please write at least 10 characters so we can understand your feedback.');
      return;
    }

    const userEmail = auth.currentUser?.email ?? '';
    const userName  = profile?.name ?? auth.currentUser?.displayName ?? 'User';

    setSubmitting(true);
    try {
      await submitFeedback(firebaseUid, userName, userEmail, category, subject, message);
      setSubject('');
      setMessage('');
      setShowSuccess(true);
      void cancelFeedbackReminder();
      successTimer.current = setTimeout(() => setShowSuccess(false), 5000);
      void loadFeedbacks();
    } catch {
      Alert.alert(
        'Sending failed',
        'Your feedback could not be sent. Please check your internet connection and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = subject.trim().length >= 3 && message.trim().length >= 10 && !submitting;

  async function handleSubmitRating() {
    if (!firebaseUid || selectedStars < 1) {
      Alert.alert('Rating required', 'Please select a star rating first.');
      return;
    }

    const userEmail = auth.currentUser?.email ?? '';
    const userName = profile?.name ?? auth.currentUser?.displayName ?? 'User';

    setRatingSubmitting(true);
    try {
      await submitAppRating(firebaseUid, userName, userEmail, selectedStars, ratingReview);
      void cancelRateAppReminder();
      Alert.alert('Thank you!', 'Your rating has been saved.');
      void loadFeedbacks();
    } catch {
      Alert.alert('Rating failed', 'Could not save your rating right now. Please try again.');
    } finally {
      setRatingSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon source="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support & Feedback</Text>
      </View>

      <ScrollView
        style={styles.safe}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroWrap}>
          <View style={styles.heroIconWrap}>
            <Icon source="message-text-outline" size={30} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Share Your Thoughts</Text>
          <Text style={styles.heroSubtitle}>
            Every message is read personally.{'\n'}Your feedback shapes every future update.
          </Text>
        </View>

        {/* Rating card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>RATE DEVOVERSE</Text>
          <Text style={styles.ratingSubtitle}>
            Your rating helps us improve the app for your daily walk.
          </Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= selectedStars;
              return (
                <TouchableOpacity
                  key={star}
                  onPress={() => setSelectedStars(star)}
                  activeOpacity={0.8}
                  style={styles.starBtn}
                >
                  <Icon
                    source={active ? 'star' : 'star-outline'}
                    size={28}
                    color={active ? '#EAB308' : colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <TextInput
            style={[styles.input, styles.textarea, { minHeight: 90 }]}
            placeholder="Optional: tell us what you like or what to improve..."
            placeholderTextColor={colors.textMuted}
            value={ratingReview}
            onChangeText={(t) => setRatingReview(t.slice(0, 500))}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: selectedStars > 0 ? colors.primary : colors.border },
            ]}
            onPress={() => { void handleSubmitRating(); }}
            disabled={selectedStars === 0 || ratingSubmitting}
            activeOpacity={0.85}
          >
            {ratingSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon source="star-circle" size={18} color="#fff" />
                <Text style={styles.submitBtnText}>{existingRating ? 'Update Rating' : 'Submit Rating'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Success banner */}
        {showSuccess && (
          <View style={styles.successBanner}>
            <Icon source="check-circle-outline" size={22} color={colors.success} />
            <Text style={styles.successText}>
              Message sent! We'll get back to you as soon as possible.
            </Text>
          </View>
        )}

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>CATEGORY</Text>
          <View style={styles.chipsRow}>
            {CATEGORIES.map((cat) => {
              const active = category === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? cat.bg : colors.surfaceAlt,
                      borderColor:     active ? cat.color : colors.border,
                    },
                  ]}
                  onPress={() => setCategory(cat.key)}
                  activeOpacity={0.8}
                >
                  <Icon source={cat.icon} size={15} color={active ? cat.color : colors.textMuted} />
                  <Text style={[styles.chipText, { color: active ? cat.color : colors.textSecondary }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>SUBJECT</Text>
          <TextInput
            style={[styles.input, subjectFocused && styles.inputFocused]}
            placeholder="Brief topic of your message…"
            placeholderTextColor={colors.textMuted}
            value={subject}
            onChangeText={setSubject}
            onFocus={() => setSubjectFocused(true)}
            onBlur={() => setSubjectFocused(false)}
            returnKeyType="next"
            maxLength={120}
          />

          <Text style={styles.inputLabel}>MESSAGE</Text>
          <TextInput
            style={[styles.input, styles.textarea, msgFocused && styles.inputFocused]}
            placeholder="Describe your feedback in detail…"
            placeholderTextColor={colors.textMuted}
            value={message}
            onChangeText={(t) => setMessage(t.slice(0, MAX_MESSAGE))}
            onFocus={() => setMsgFocused(true)}
            onBlur={() => setMsgFocused(false)}
            multiline
            numberOfLines={6}
            returnKeyType="default"
          />
          <Text style={styles.charCount}>{message.length}/{MAX_MESSAGE}</Text>

          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: canSubmit ? colors.primary : colors.border },
            ]}
            onPress={() => { void handleSubmit(); }}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon source="send" size={18} color="#fff" />
                <Text style={styles.submitBtnText}>Send Feedback</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Previous messages divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>MY PREVIOUS MESSAGES</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Feedback history */}
        {loading ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : feedbacks.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Icon source="inbox-outline" size={36} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              No messages yet.{'\n'}Send your first feedback above!
            </Text>
          </View>
        ) : (
          feedbacks.map((fb) => {
            const meta = CATEGORY_META[fb.category] ?? CATEGORY_META.other;
            return (
              <View key={fb.id} style={styles.fbCard}>
                <View style={styles.fbCardHeader}>
                  <View style={[styles.fbCategoryBadge, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.fbCategoryText, { color: meta.color }]}>
                      {meta.label}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.fbStatusBadge,
                      {
                        backgroundColor:
                          fb.status === 'replied'
                            ? 'rgba(90,158,111,0.15)'
                            : 'rgba(200,154,58,0.12)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.fbStatusText,
                        { color: fb.status === 'replied' ? colors.success : colors.warning },
                      ]}
                    >
                      {fb.status === 'replied' ? '✓ REPLIED' : '⏳ PENDING'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.fbSubject}>{fb.subject}</Text>
                <Text style={styles.fbMessage}>{fb.message}</Text>
                <Text style={styles.fbDate}>{formatDate(fb.createdAt)}</Text>

                {fb.status === 'replied' && fb.adminReply && (
                  <View style={styles.fbReplyWrap}>
                    <Text style={styles.fbReplyLabel}>REPLY FROM DEVOVERSE TEAM</Text>
                    <Text style={styles.fbReplyText}>"{fb.adminReply}"</Text>
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}
