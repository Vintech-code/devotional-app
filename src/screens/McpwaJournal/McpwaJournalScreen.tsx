import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { JournalStackParamList } from '../../navigation/types';
import { McpwaEntry } from '../../types';
import { Colors, Typography, Spacing } from '../../theme';
import { saveMcpwaEntry, refreshProfileProgress } from '../../services/storageService';
import { useAppStore } from '../../store/useAppStore';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import JournalSection from '../../components/JournalSection/JournalSection';
import FormInput from '../../components/FormInput/FormInput';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { styles } from './McpwaJournal.styles';

type Props = NativeStackScreenProps<JournalStackParamList, 'McpwaJournal'>;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const SECTIONS = [
  { key: 'message',     letter: 'M', title: 'MESSAGE (RHEMA)',  subtitle: "What's the specific word for you today? Write the verse or thought that stood out..." },
  { key: 'command',     letter: 'C', title: 'COMMAND',          subtitle: "Is there an instruction to follow? Something God is asking you to do..." },
  { key: 'promise',     letter: 'P', title: 'PROMISE',          subtitle: 'What hope does God offer in this text? A truth you can hold onto...' },
  { key: 'warning',     letter: 'W', title: 'WARNING',          subtitle: 'Is there a pitfall to avoid? A caution for your heart or actions...' },
  { key: 'application', letter: 'A', title: 'APPLICATION',      subtitle: "How will you change your walk today? Steps for today's journey." },
] as const;

type FieldKey = 'message' | 'command' | 'promise' | 'warning' | 'application';

export default function McpwaJournalScreen({ navigation }: Props) {
  const setMcpwaEntries = useAppStore((s) => s.setMcpwaEntries);
  const setProfile = useAppStore((s) => s.setProfile);
  const existingEntries = useAppStore((s) => s.mcpwaEntries);

  const [scripture, setScripture] = useState('');
  const [fields, setFields] = useState<Record<FieldKey, string>>({
    message: '',
    command: '',
    promise: '',
    warning: '',
    application: '',
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
    const entry: McpwaEntry = {
      id: generateId(),
      date: today,
      scripture,
      ...fields,
      createdAt: Date.now(),
    };
    await saveMcpwaEntry(entry);
    setMcpwaEntries([entry, ...existingEntries]);
    const profile = await refreshProfileProgress();
    setProfile(profile);
    setSaving(false);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="MCPWA Journal"
        onBack={() => navigation.goBack()}
        rightIcon="bookmark"
        onRightPress={() => {}}
      />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>Daily Listening</Text>
        <Text style={styles.pageDate}>Record what the Spirit is prompting today.</Text>
        <Text style={styles.methodLabel}>METHODOLOGY: MCPWA</Text>

        <FormInput
          label="Scripture Reference"
          value={scripture}
          onChangeText={setScripture}
          placeholder="e.g. Psalm 23:1"
        />

        {SECTIONS.map((s) => (
          <JournalSection key={s.key} letter={s.letter} title={s.title} subtitle={s.subtitle}>
            <FormInput
              label=""
              value={fields[s.key]}
              onChangeText={updateField(s.key)}
              placeholder={`${s.title}...`}
              multiline
              numberOfLines={3}
            />
          </JournalSection>
        ))}

        <PrimaryButton label="Save Devotional" onPress={handleSave} loading={saving} style={styles.btn} />
        <Text style={styles.footer}>FAITHFUL IS HE WHO CALLED YOU</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
