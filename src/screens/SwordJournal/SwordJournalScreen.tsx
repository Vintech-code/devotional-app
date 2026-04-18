import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Icon, Snackbar } from 'react-native-paper';
import AppToast from '../../components/AppToast/AppToast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { JournalStackParamList } from '../../navigation/types';
import { SwordEntry } from '../../types';
import { useColors, Typography, Spacing, Radius } from '../../theme';
import { saveSwordEntry, refreshProfileProgress } from '../../services/storageService';
import { clearDraft, loadDraft, saveDraft } from '../../services/draftService';
import { useAppStore } from '../../store/useAppStore';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import JournalSection from '../../components/JournalSection/JournalSection';
import FormInput from '../../components/FormInput/FormInput';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { makeStyles } from './SwordJournal.styles';

type Props = NativeStackScreenProps<JournalStackParamList, 'SwordJournal'>;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const SECTIONS = [
  { key: 'scripture', letter: 'S', title: 'Scripture', subtitle: 'Write down the passage that spoke to you.' },
  { key: 'word', letter: 'W', title: 'Word', subtitle: 'What specific word or phrase stands out most?' },
  { key: 'observation', letter: 'O', title: 'Observation', subtitle: 'What do you see? What is the core message?' },
  { key: 'response', letter: 'R', title: 'Response', subtitle: "Talk to God about what you've learned." },
  { key: 'dailyLiving', letter: 'D', title: 'Daily Living', subtitle: 'How will this change your walk today?' },
] as const;

type FieldKey = 'scripture' | 'word' | 'observation' | 'response' | 'dailyLiving';
type SwordDraft = Record<FieldKey, string>;

const PLACEHOLDERS: Record<FieldKey, string> = {
  scripture: 'Philippians 4:13',
  word: 'Strengthens',
  observation: 'I observe that...',
  response: 'Lord, I thank you for...',
  dailyLiving: 'Today, I will practice...',
};

export default function SwordJournalScreen({ navigation, route }: Props) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const setSwordEntries = useAppStore((s) => s.setSwordEntries);
  const setProfile = useAppStore((s) => s.setProfile);
  const existingEntries = useAppStore((s) => s.swordEntries);
  const prefill = route.params?.prefill;
  const entryId = route.params?.entryId;
  const editingEntry = useMemo(
    () => (entryId ? existingEntries.find((e) => e.id === entryId) : undefined),
    [entryId, existingEntries]
  );

  const [fields, setFields] = useState<Record<FieldKey, string>>({
    scripture: prefill?.reference ?? '',
    word: '',
    observation: prefill?.text ? `Based on: "${prefill.text}"` : '',
    response: '',
    dailyLiving: '',
  });
  const [saving, setSaving] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!editingEntry) return;
    setFields({
      scripture: editingEntry.scripture ?? '',
      word: editingEntry.word ?? '',
      observation: editingEntry.observation ?? '',
      response: editingEntry.response ?? '',
      dailyLiving: editingEntry.dailyLiving ?? '',
    });
  }, [editingEntry]);

  useEffect(() => {
    if (editingEntry) {
      hydratedRef.current = true;
      return;
    }
    void (async () => {
      const draft = await loadDraft<SwordDraft>('sword-journal');
      if (!draft) {
        hydratedRef.current = true;
        return;
      }
      setFields({
        scripture: draft.scripture ?? '',
        word: draft.word ?? '',
        observation: draft.observation ?? '',
        response: draft.response ?? '',
        dailyLiving: draft.dailyLiving ?? '',
      });
      hydratedRef.current = true;
    })();
  }, [editingEntry]);

  useEffect(() => {
    if (editingEntry || !hydratedRef.current) return;
    const timer = setTimeout(() => {
      void saveDraft<SwordDraft>('sword-journal', fields);
    }, 600);
    return () => clearTimeout(timer);
  }, [editingEntry, fields]);

  function updateField(key: FieldKey) {
    return (value: string) => setFields((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
    const entry: SwordEntry = {
      id: editingEntry?.id ?? generateId(),
      date: editingEntry?.date ?? today,
      ...fields,
      createdAt: editingEntry?.createdAt ?? Date.now(),
    };
    await saveSwordEntry(entry);
    if (editingEntry) {
      setSwordEntries(existingEntries.map((e) => (e.id === entry.id ? entry : e)));
    } else {
      setSwordEntries([entry, ...existingEntries]);
    }
    const profile = await refreshProfileProgress();
    setProfile(profile);
    if (!editingEntry) {
      void clearDraft('sword-journal');
    }
    setSaving(false);
    setSnackVisible(true);
    setTimeout(() => navigation.goBack(), 1500);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="SWORD Journal"
        onBack={() => navigation.goBack()}
        rightIcon="bookmark"
        onRightPress={() => {}}
      />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.pageTitle}>Daily Encounter</Text>
            <Text style={styles.pageDate}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.pageIndicator}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        <Text style={styles.methodLabel}>METHODOLOGY: SWORD</Text>

        {SECTIONS.map((s) => (
          <JournalSection key={s.key} letter={s.letter} title={s.title} subtitle={s.subtitle}>
            <FormInput
              label=""
              value={fields[s.key]}
              onChangeText={updateField(s.key)}
              placeholder={PLACEHOLDERS[s.key]}
              multiline
              numberOfLines={3}
            />
          </JournalSection>
        ))}

        <PrimaryButton
          label={editingEntry ? 'Update Devotional' : 'Save Devotional'}
          onPress={handleSave}
          loading={saving}
          style={styles.btn}
        />
        <Text style={styles.hint}>
          Saved entries will appear in your{' '}
          <Text style={styles.hintLink}>Journal History</Text>.
        </Text>

      </ScrollView>
      <AppToast
        visible={snackVisible}
        emoji="⚔️"
        title="Devotional saved!"
        message="Your entry has been added to Journal History."
        onDismiss={() => setSnackVisible(false)}
      />
    </SafeAreaView>
  );
}
