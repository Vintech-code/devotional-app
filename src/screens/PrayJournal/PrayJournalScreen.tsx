import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Snackbar } from 'react-native-paper';
import AppToast from '../../components/AppToast/AppToast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { JournalStackParamList } from '../../navigation/types';
import { PrayEntry } from '../../types';
import { useColors, Spacing } from '../../theme';
import { savePrayEntry, refreshProfileProgress } from '../../services/storageService';
import { clearDraft, loadDraft, saveDraft } from '../../services/draftService';
import { useAppStore } from '../../store/useAppStore';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import JournalSection from '../../components/JournalSection/JournalSection';
import FormInput from '../../components/FormInput/FormInput';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { makeStyles } from './PrayJournal.styles';

type Props = NativeStackScreenProps<JournalStackParamList, 'PrayJournal'>;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

type PrayDraft = {
  scripture: string;
  fullVerse: string;
  praise: string;
  repent: string;
  ask: string;
  yieldText: string;
};

export default function PrayJournalScreen({ navigation, route }: Props) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const setPrayEntries = useAppStore((s) => s.setPrayEntries);
  const setProfile = useAppStore((s) => s.setProfile);
  const existingEntries = useAppStore((s) => s.prayEntries);
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
  const [praise, setPraise] = useState('');
  const [repent, setRepent] = useState('');
  const [ask, setAsk] = useState('');
  const [yieldText, setYieldText] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!editingEntry) return;
    setScripture(editingEntry.scripture ?? '');
    setFullVerse(editingEntry.fullVerse ?? '');
    setPraise(editingEntry.praise ?? '');
    setRepent(editingEntry.repent ?? '');
    setAsk(editingEntry.ask ?? '');
    setYieldText(editingEntry.yield_ ?? '');
  }, [editingEntry]);

  useEffect(() => {
    if (editingEntry) {
      hydratedRef.current = true;
      return;
    }
    void (async () => {
      const draft = await loadDraft<PrayDraft>('pray-journal');
      if (!draft) {
        hydratedRef.current = true;
        return;
      }
      setScripture(draft.scripture ?? '');
      setFullVerse(draft.fullVerse ?? '');
      setPraise(draft.praise ?? '');
      setRepent(draft.repent ?? '');
      setAsk(draft.ask ?? '');
      setYieldText(draft.yieldText ?? '');
      hydratedRef.current = true;
    })();
  }, [editingEntry]);

  useEffect(() => {
    if (editingEntry || !hydratedRef.current) return;
    const timer = setTimeout(() => {
      void saveDraft<PrayDraft>('pray-journal', {
        scripture,
        fullVerse,
        praise,
        repent,
        ask,
        yieldText,
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [editingEntry, scripture, fullVerse, praise, repent, ask, yieldText]);

  async function handleSave() {
    setSaving(true);
    const entry: PrayEntry = {
      id: editingEntry?.id ?? generateId(),
      date: editingEntry?.date ?? today,
      scripture,
      fullVerse,
      praise,
      repent,
      ask,
      yield_: yieldText,
      createdAt: editingEntry?.createdAt ?? Date.now(),
    };
    await savePrayEntry(entry);
    if (editingEntry) {
      setPrayEntries(existingEntries.map((e) => (e.id === entry.id ? entry : e)));
    } else {
      setPrayEntries([entry, ...existingEntries]);
    }
    const profile = await refreshProfileProgress();
    setProfile(profile);
    if (!editingEntry) {
      void clearDraft('pray-journal');
    }
    setSaving(false);
    setSnackVisible(true);
    setTimeout(() => navigation.goBack(), 1500);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="PRAY Journal"
        onBack={() => navigation.goBack()}
        rightIcon="heart-outline"
        onRightPress={() => {}}
      />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Meta */}
        <View style={styles.metaBadge}>
          <Text style={styles.metaBadgeText}>Prayer Method</Text>
        </View>
        <Text style={styles.pageTitle}>P · R · A · Y</Text>
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
            placeholder="e.g. Psalm 100:4"
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

        {/* P — Praise */}
        <JournalSection
          letter="P"
          title="Praise"
          subtitle="Acknowledge who God is — His character and greatness."
        >
          <Text style={styles.subLabel}>ADORE HIM</Text>
          <FormInput
            label=""
            value={praise}
            onChangeText={setPraise}
            placeholder="Lord, I praise You because You are..."
            multiline
            numberOfLines={4}
          />
          <Text style={styles.charCount}>{praise.length} characters</Text>
        </JournalSection>

        {/* R — Repent */}
        <JournalSection
          letter="R"
          title="Repent"
          subtitle="Confess your sins and ask for forgiveness."
        >
          <Text style={styles.subLabel}>CONFESSION</Text>
          <FormInput
            label=""
            value={repent}
            onChangeText={setRepent}
            placeholder="Lord, I confess... Forgive me for..."
            multiline
            numberOfLines={4}
          />
          <Text style={styles.charCount}>{repent.length} characters</Text>
        </JournalSection>

        {/* A — Ask */}
        <JournalSection
          letter="A"
          title="Ask"
          subtitle="Bring your requests and needs before God."
        >
          <Text style={styles.subLabel}>REQUESTS</Text>
          <FormInput
            label=""
            value={ask}
            onChangeText={setAsk}
            placeholder="Lord, I ask You for... I lift up..."
            multiline
            numberOfLines={4}
          />
          <Text style={styles.charCount}>{ask.length} characters</Text>
        </JournalSection>

        {/* Y — Yield */}
        <JournalSection
          letter="Y"
          title="Yield"
          subtitle="Surrender your will and trust in God's plan."
        >
          <Text style={styles.subLabel}>SURRENDER</Text>
          <FormInput
            label=""
            value={yieldText}
            onChangeText={setYieldText}
            placeholder="Lord, I surrender... I trust You with..."
            multiline
            numberOfLines={4}
          />
          <Text style={styles.charCount}>{yieldText.length} characters</Text>
        </JournalSection>

        {/* Pro tip */}
        <View style={styles.proTip}>
          <Text style={styles.proTipLabel}>PRO TIP</Text>
          <Text style={styles.proTipText}>
            Be specific in your Praise and Ask sections. Specific prayers lead to specific
            answers — and specific gratitude when God responds.
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
        emoji="🙏"
        title="Prayer saved!"
        message="Your prayer has been added to Journal History."
        onDismiss={() => setSnackVisible(false)}
      />
    </SafeAreaView>
  );
}
