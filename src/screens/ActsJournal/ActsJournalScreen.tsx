import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Snackbar } from 'react-native-paper';
import AppToast from '../../components/AppToast/AppToast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { JournalStackParamList } from '../../navigation/types';
import { ActsEntry } from '../../types';
import { useColors, Spacing } from '../../theme';
import { saveActsEntry, refreshProfileProgress } from '../../services/storageService';
import { clearDraft, loadDraft, saveDraft } from '../../services/draftService';
import { useAppStore } from '../../store/useAppStore';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import JournalSection from '../../components/JournalSection/JournalSection';
import FormInput from '../../components/FormInput/FormInput';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { makeStyles } from './ActsJournal.styles';

type Props = NativeStackScreenProps<JournalStackParamList, 'ActsJournal'>;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

type ActsDraft = {
  scripture: string;
  fullVerse: string;
  adoration: string;
  confession: string;
  thanksgiving: string;
  supplication: string;
};

export default function ActsJournalScreen({ navigation, route }: Props) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const setActsEntries = useAppStore((s) => s.setActsEntries);
  const setProfile = useAppStore((s) => s.setProfile);
  const existingEntries = useAppStore((s) => s.actsEntries);
  const prefill = route.params?.prefill;
  const entryId = route.params?.entryId;
  const editingEntry = useMemo(
    () => (entryId ? existingEntries.find((e) => e.id === entryId) : undefined),
    [entryId, existingEntries]
  );

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const [scripture, setScripture] = useState(prefill?.reference ?? '');
  const [fullVerse, setFullVerse] = useState(prefill?.text ?? '');
  const [adoration, setAdoration] = useState('');
  const [confession, setConfession] = useState('');
  const [thanksgiving, setThanksgiving] = useState('');
  const [supplication, setSupplication] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!editingEntry) return;
    setScripture(editingEntry.scripture ?? '');
    setFullVerse(editingEntry.fullVerse ?? '');
    setAdoration(editingEntry.adoration ?? '');
    setConfession(editingEntry.confession ?? '');
    setThanksgiving(editingEntry.thanksgiving ?? '');
    setSupplication(editingEntry.supplication ?? '');
  }, [editingEntry]);

  useEffect(() => {
    if (editingEntry) {
      hydratedRef.current = true;
      return;
    }
    void (async () => {
      const draft = await loadDraft<ActsDraft>('acts-journal');
      if (!draft) {
        hydratedRef.current = true;
        return;
      }
      setScripture(draft.scripture ?? '');
      setFullVerse(draft.fullVerse ?? '');
      setAdoration(draft.adoration ?? '');
      setConfession(draft.confession ?? '');
      setThanksgiving(draft.thanksgiving ?? '');
      setSupplication(draft.supplication ?? '');
      hydratedRef.current = true;
    })();
  }, [editingEntry]);

  useEffect(() => {
    if (editingEntry || !hydratedRef.current) return;
    const timer = setTimeout(() => {
      void saveDraft<ActsDraft>('acts-journal', {
        scripture,
        fullVerse,
        adoration,
        confession,
        thanksgiving,
        supplication,
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [editingEntry, scripture, fullVerse, adoration, confession, thanksgiving, supplication]);

  async function handleSave() {
    setSaving(true);
    const entry: ActsEntry = {
      id: editingEntry?.id ?? generateId(),
      date: editingEntry?.date ?? today,
      scripture,
      fullVerse,
      adoration,
      confession,
      thanksgiving,
      supplication,
      createdAt: editingEntry?.createdAt ?? Date.now(),
    };
    await saveActsEntry(entry);
    if (editingEntry) {
      setActsEntries(existingEntries.map((e) => (e.id === entry.id ? entry : e)));
    } else {
      setActsEntries([entry, ...existingEntries]);
    }
    const profile = await refreshProfileProgress();
    setProfile(profile);
    if (!editingEntry) {
      void clearDraft('acts-journal');
    }
    setSaving(false);
    setSnackVisible(true);
    setTimeout(() => navigation.goBack(), 1500);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="ACTS Journal"
        onBack={() => navigation.goBack()}
        rightIcon="heart-outline"
        onRightPress={() => {}}
      />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Meta */}
        <View style={styles.metaBadge}>
          <Text style={styles.metaBadgeText}>Prayer Method</Text>
        </View>
        <Text style={styles.pageTitle}>A · C · T · S</Text>
        <Text style={styles.pageDate}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>

        {/* Scripture */}
        <View style={[styles.sectionCard, styles.sectionActive]}>
          <View style={styles.sectionCardHeader}>
            <View style={styles.letterBox}>
              <Text style={styles.letter}>S</Text>
            </View>
            <View style={styles.sectionInfo}>
              <Text style={styles.sectionTitle}>Scripture (Optional)</Text>
              <Text style={styles.sectionHint}>A verse to anchor your prayer.</Text>
            </View>
          </View>
          <FormInput
            label="Reference"
            value={scripture}
            onChangeText={setScripture}
            placeholder="e.g. 1 Thessalonians 5:16-18"
          />
          <Text style={styles.subLabel}>FULL VERSE</Text>
          <FormInput
            label=""
            value={fullVerse}
            onChangeText={setFullVerse}
            placeholder="Type the verse here..."
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <Text style={styles.charCount}>{fullVerse.length} characters</Text>
        </View>

        {/* A — Adoration */}
        <JournalSection
          letter="A"
          title="Adoration"
          subtitle="Worship God for who He is, not just what He does."
        >
          <Text style={styles.subLabel}>WORSHIP</Text>
          <FormInput
            label=""
            value={adoration}
            onChangeText={setAdoration}
            placeholder="God, I adore You because You are..."
            multiline
            numberOfLines={4}
          />
          <Text style={styles.charCount}>{adoration.length} characters</Text>
        </JournalSection>

        {/* C — Confession */}
        <JournalSection
          letter="C"
          title="Confession"
          subtitle="Honestly acknowledge your sins before God."
        >
          <Text style={styles.subLabel}>HONESTY</Text>
          <FormInput
            label=""
            value={confession}
            onChangeText={setConfession}
            placeholder="Lord, I confess that I have... Forgive me for..."
            multiline
            numberOfLines={4}
          />
          <Text style={styles.charCount}>{confession.length} characters</Text>
        </JournalSection>

        {/* T — Thanksgiving */}
        <JournalSection
          letter="T"
          title="Thanksgiving"
          subtitle="Thank God for His blessings and faithfulness."
        >
          <Text style={styles.subLabel}>GRATITUDE</Text>
          <FormInput
            label=""
            value={thanksgiving}
            onChangeText={setThanksgiving}
            placeholder="Thank You, Lord, for... I'm grateful for..."
            multiline
            numberOfLines={4}
          />
          <Text style={styles.charCount}>{thanksgiving.length} characters</Text>
        </JournalSection>

        {/* S — Supplication */}
        <JournalSection
          letter="S"
          title="Supplication"
          subtitle="Bring your needs and the needs of others to God."
        >
          <Text style={styles.subLabel}>INTERCESSION</Text>
          <FormInput
            label=""
            value={supplication}
            onChangeText={setSupplication}
            placeholder="Lord, I ask You for... I lift up in prayer..."
            multiline
            numberOfLines={4}
          />
          <Text style={styles.charCount}>{supplication.length} characters</Text>
        </JournalSection>

        {/* Pro tip */}
        <View style={styles.proTip}>
          <Text style={styles.proTipLabel}>PRO TIP</Text>
          <Text style={styles.proTipText}>
            Start with Adoration before making requests. Beginning with worship shifts your
            perspective and aligns your heart to God's will before you ask.
          </Text>
        </View>

        <PrimaryButton
          label={editingEntry ? 'Update Prayer' : 'Save Prayer'}
          onPress={handleSave}
          loading={saving}
          style={styles.saveBtn}
        />
        <Text style={styles.savedHint}>Saved entries will appear in your Journal History.</Text>
      </ScrollView>
      <AppToast
        visible={snackVisible}
        emoji="🙌"
        title="Prayer saved!"
        message="Your prayer has been added to Journal History."
        onDismiss={() => setSnackVisible(false)}
      />
    </SafeAreaView>
  );
}
