import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useColors } from '../../theme';
import { makeStyles } from './PrayerJournal.styles';
import { useAppStore } from '../../store/useAppStore';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import { PrayerRequest, PrayerStatus } from '../../types';
import { savePrayerRequests } from '../../services/storageService';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<PrayerStatus, string> = {
  Pending:      '#F59E0B',
  'In Progress':'#3B82F6',
  Answered:     '#10B981',
};

const STATUS_ICONS: Record<PrayerStatus, string> = {
  Pending:      'clock-outline',
  'In Progress':'hands-pray',
  Answered:     'check-circle-outline',
};

const STATUSES: PrayerStatus[] = ['Pending', 'In Progress', 'Answered'];

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PrayerJournalScreen() {
  const colors  = useColors();
  const styles  = makeStyles(colors);
  const navigation = useNavigation();

  const prayerRequests    = useAppStore((s) => s.prayerRequests);
  const setPrayerRequests = useAppStore((s) => s.setPrayerRequests);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editing,      setEditing]      = useState<PrayerRequest | null>(null);

  // Form fields
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [scriptureRef,setScriptureRef]= useState('');
  const [status,      setStatus]      = useState<PrayerStatus>('Pending');

  function openAdd() {
    setEditing(null);
    setTitle('');
    setDescription('');
    setScriptureRef('');
    setStatus('Pending');
    setModalVisible(true);
  }

  function openEdit(req: PrayerRequest) {
    setEditing(req);
    setTitle(req.title);
    setDescription(req.description);
    setScriptureRef(req.scriptureRef ?? '');
    setStatus(req.status);
    setModalVisible(true);
  }

  async function handleSave() {
    if (!title.trim()) return;
    const now = Date.now();
    let updated: PrayerRequest[];
    if (editing) {
      updated = prayerRequests.map((r) =>
        r.id === editing.id
          ? {
              ...r,
              title:        title.trim(),
              description:  description.trim(),
              scriptureRef: scriptureRef.trim() || undefined,
              status,
              answeredDate: status === 'Answered' ? (r.answeredDate ?? now) : undefined,
            }
          : r,
      );
    } else {
      const req: PrayerRequest = {
        id:           makeId(),
        title:        title.trim(),
        description:  description.trim(),
        scriptureRef: scriptureRef.trim() || undefined,
        status,
        answeredDate: status === 'Answered' ? now : undefined,
        createdAt:    now,
      };
      updated = [req, ...prayerRequests];
    }
    setPrayerRequests(updated);
    await savePrayerRequests(updated);
    setModalVisible(false);
  }

  function handleDelete(id: string) {
    Alert.alert('Delete Prayer', 'Remove this prayer request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = prayerRequests.filter((r) => r.id !== id);
          setPrayerRequests(updated);
          await savePrayerRequests(updated);
        },
      },
    ]);
  }

  const active      = prayerRequests.filter((r) => r.status !== 'Answered');
  const testimonies = prayerRequests.filter((r) => r.status === 'Answered');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Prayer Journal" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ── Stats row ─────────────────────────────────────────────────── */}
        {prayerRequests.length > 0 && (
          <View style={styles.statsRow}>
            {STATUSES.map((s) => {
              const count = prayerRequests.filter((r) => r.status === s).length;
              return (
                <View key={s} style={[styles.statCard, { borderColor: STATUS_COLORS[s] + '44' }]}>
                  <Icon source={STATUS_ICONS[s]} size={20} color={STATUS_COLORS[s]} />
                  <Text style={[styles.statNum, { color: STATUS_COLORS[s] }]}>{count}</Text>
                  <Text style={styles.statLabel}>{s}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Empty state ───────────────────────────────────────────────── */}
        {prayerRequests.length === 0 && (
          <View style={styles.emptyWrap}>
            <Icon source="hands-pray" size={56} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Start Praying</Text>
            <Text style={styles.emptySub}>
              Log your prayer requests, track their status, and celebrate answered prayers as testimonies.
            </Text>
          </View>
        )}

        {/* ── Active prayer requests ────────────────────────────────────── */}
        {active.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>PRAYER REQUESTS</Text>
            {active.map((req) => (
              <TouchableOpacity
                key={req.id}
                style={styles.card}
                onPress={() => openEdit(req)}
                activeOpacity={0.8}
              >
                <View style={[styles.statusBar, { backgroundColor: STATUS_COLORS[req.status] }]} />
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{req.title}</Text>
                    <View style={[styles.badge, { backgroundColor: STATUS_COLORS[req.status] + '22' }]}>
                      <Icon source={STATUS_ICONS[req.status]} size={11} color={STATUS_COLORS[req.status]} />
                      <Text style={[styles.badgeText, { color: STATUS_COLORS[req.status] }]}>{req.status}</Text>
                    </View>
                  </View>
                  {!!req.description && (
                    <Text style={styles.cardDesc} numberOfLines={2}>{req.description}</Text>
                  )}
                  <View style={styles.cardFooter}>
                    {!!req.scriptureRef && (
                      <View style={styles.refRow}>
                        <Icon source="book-open-variant" size={11} color={colors.primary} />
                        <Text style={styles.refText}>{req.scriptureRef}</Text>
                      </View>
                    )}
                    <Text style={styles.cardDate}>{fmtDate(req.createdAt)}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(req.id)} hitSlop={8}>
                  <Icon source="trash-can-outline" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ── Testimonies (answered prayers) ───────────────────────────── */}
        {testimonies.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>TESTIMONIES ✦ ANSWERED PRAYERS</Text>
            {testimonies.map((req) => (
              <TouchableOpacity
                key={req.id}
                style={[styles.card, styles.cardAnswered]}
                onPress={() => openEdit(req)}
                activeOpacity={0.8}
              >
                <View style={[styles.statusBar, { backgroundColor: '#10B981' }]} />
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{req.title}</Text>
                    <View style={[styles.badge, { backgroundColor: '#10B98122' }]}>
                      <Icon source="check-circle-outline" size={11} color="#10B981" />
                      <Text style={[styles.badgeText, { color: '#10B981' }]}>Answered</Text>
                    </View>
                  </View>
                  {!!req.description && (
                    <Text style={styles.cardDesc} numberOfLines={2}>{req.description}</Text>
                  )}
                  <View style={styles.cardFooter}>
                    {!!req.answeredDate && (
                      <Text style={styles.answeredDate}>Answered {fmtDate(req.answeredDate)}</Text>
                    )}
                    <Text style={styles.cardDate}>Added {fmtDate(req.createdAt)}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(req.id)} hitSlop={8}>
                  <Icon source="trash-can-outline" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* ── FAB ─────────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={openAdd}
        activeOpacity={0.85}
      >
        <Icon source="plus" size={28} color={colors.textOnPrimary} />
      </TouchableOpacity>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
              {editing ? 'Edit Prayer' : 'New Prayer Request'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              <Text style={styles.fieldLabel}>TITLE *</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="e.g. Healing for my mother..."
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.fieldLabel}>DESCRIPTION</Text>
              <TextInput
                style={[styles.input, styles.inputMulti, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="Share your heart..."
                placeholderTextColor={colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.fieldLabel}>SCRIPTURE REFERENCE (optional)</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="e.g. Philippians 4:6-7"
                placeholderTextColor={colors.textMuted}
                value={scriptureRef}
                onChangeText={setScriptureRef}
              />

              <Text style={styles.fieldLabel}>STATUS</Text>
              <View style={styles.statusRow}>
                {STATUSES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusPill,
                      { borderColor: STATUS_COLORS[s] },
                      status === s && { backgroundColor: STATUS_COLORS[s] },
                    ]}
                    onPress={() => setStatus(s)}
                    activeOpacity={0.8}
                  >
                    <Icon source={STATUS_ICONS[s]} size={14} color={status === s ? '#fff' : STATUS_COLORS[s]} />
                    <Text style={[styles.pillText, { color: status === s ? '#fff' : STATUS_COLORS[s] }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

            </ScrollView>

            <View style={styles.sheetBtns}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelTxt, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: title.trim() ? colors.primary : colors.border }]}
                onPress={handleSave}
                disabled={!title.trim()}
              >
                <Text style={[styles.saveTxt, { color: title.trim() ? colors.textOnPrimary : colors.textMuted }]}>
                  {editing ? 'Update' : 'Save Prayer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


