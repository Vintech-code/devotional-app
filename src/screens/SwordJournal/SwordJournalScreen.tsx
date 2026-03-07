import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { JournalStackParamList } from '../../navigation/types';
import { SwordEntry } from '../../types';
import { Colors, Typography, Spacing, Radius } from '../../theme';
import { saveSwordEntry, refreshProfileProgress } from '../../services/storageService';
import { useAppStore } from '../../store/useAppStore';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import JournalSection from '../../components/JournalSection/JournalSection';
import FormInput from '../../components/FormInput/FormInput';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { styles } from './SwordJournal.styles';

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

const PLACEHOLDERS: Record<FieldKey, string> = {
  scripture: 'Philippians 4:13',
  word: 'Strengthens',
  observation: 'I observe that...',
  response: 'Lord, I thank you for...',
  dailyLiving: 'Today, I will practice...',
};

export default function SwordJournalScreen({ navigation }: Props) {
  const setSwordEntries = useAppStore((s) => s.setSwordEntries);
  const setProfile = useAppStore((s) => s.setProfile);
  const existingEntries = useAppStore((s) => s.swordEntries);

  const [fields, setFields] = useState<Record<FieldKey, string>>({
    scripture: '',
    word: '',
    observation: '',
    response: '',
    dailyLiving: '',
  });
  const [saving, setSaving] = useState(false);

  function updateField(key: FieldKey) {
    return (value: string) => setFields((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
    const entry: SwordEntry = {
      id: generateId(),
      date: today,
      ...fields,
      createdAt: Date.now(),
    };
    await saveSwordEntry(entry);
    setSwordEntries([entry, ...existingEntries]);
    const profile = await refreshProfileProgress();
    setProfile(profile);
    setSaving(false);
    navigation.goBack();
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

        <PrimaryButton label="Save Devotional" onPress={handleSave} loading={saving} style={styles.btn} />
        <Text style={styles.hint}>
          Saved entries will appear in your{' '}
          <Text style={styles.hintLink}>Journal History</Text>.
        </Text>

        {/* FAB placeholder */}
        <TouchableOpacity style={styles.fab} onPress={() => {}}>
          <Icon source="plus" size={22} color={Colors.textOnPrimary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
