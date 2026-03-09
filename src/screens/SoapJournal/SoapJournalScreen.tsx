import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { JournalStackParamList } from '../../navigation/types';
import { SoapEntry } from '../../types';
import { useColors, Typography, Spacing, Radius } from '../../theme';
import { saveSoapEntry, refreshProfileProgress } from '../../services/storageService';
import { useAppStore } from '../../store/useAppStore';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import JournalSection from '../../components/JournalSection/JournalSection';
import FormInput from '../../components/FormInput/FormInput';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { makeStyles } from './SoapJournal.styles';

type Props = NativeStackScreenProps<JournalStackParamList, 'SoapJournal'>;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function SoapJournalScreen({ navigation, route }: Props) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const setSoapEntries = useAppStore((s) => s.setSoapEntries);
  const setProfile = useAppStore((s) => s.setProfile);
  const existingEntries = useAppStore((s) => s.soapEntries);
  const prefill = route.params?.prefill;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const [scripture, setScripture] = useState(prefill?.reference ?? 'Philippians 4:6-7');
  const [fullVerse, setFullVerse] = useState(
    prefill?.text ??
    'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.'
  );
  const [observation, setObservation] = useState('');
  const [application, setApplication] = useState('');
  const [prayer, setPrayer] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);

  async function handleSave() {
    setSaving(true);
    const entry: SoapEntry = {
      id: generateId(),
      date: today,
      scripture,
      fullVerse,
      observation,
      application,
      prayer,
      createdAt: Date.now(),
    };
    await saveSoapEntry(entry);
    setSoapEntries([entry, ...existingEntries]);
    const profile = await refreshProfileProgress();
    setProfile(profile);
    setSaving(false);
    setSnackVisible(true);
    setTimeout(() => navigation.goBack(), 1500);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="SOAP Journal"
        onBack={() => navigation.goBack()}
        rightIcon="heart-outline"
        onRightPress={() => {}}
      />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Meta */}
        <View style={styles.metaBadge}>
          <Text style={styles.metaBadgeText}>Daily Devotional</Text>
        </View>
        <Text style={styles.pageTitle}>Today's Reflection</Text>
        <Text style={styles.pageDate}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} �{' '}
          Morning Session
        </Text>

        {/* S � Scripture */}
        <View style={[styles.sectionCard, styles.sectionActive]}>
          <View style={styles.sectionCardHeader}>
            <View style={styles.letterBox}>
              <Text style={styles.letter}>S</Text>
            </View>
            <View style={styles.sectionInfo}>
              <Text style={styles.sectionTitle}>Scripture</Text>
              <Text style={styles.sectionHint}>Write down the verse that spoke to you.</Text>
            </View>
          </View>
          <FormInput
            label="Reference"
            value={scripture}
            onChangeText={setScripture}
            placeholder="e.g. John 3:16"
          />
          <Text style={styles.subLabel}>FULL VERSE</Text>
          <FormInput
            label=""
            value={fullVerse}
            onChangeText={setFullVerse}
            placeholder="Type the full verse here..."
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.charCount}>{fullVerse.length} characters</Text>
        </View>

        {/* O � Observation */}
        <JournalSection
          letter="O"
          title="Observation"
          subtitle="What did you notice about this passage?"
        >
          <Text style={styles.subLabel}>REFLECTIONS</Text>
          <FormInput
            label=""
            value={observation}
            onChangeText={setObservation}
            placeholder="What is God saying in these verses? Who is speaking? What is the context?"
            multiline
            numberOfLines={4}
          />
          <Text style={styles.charCount}>{observation.length} characters</Text>
        </JournalSection>

        {/* A � Application */}
        <JournalSection
          letter="A"
          title="Application"
          subtitle="How can you live this out today?"
        >
          <Text style={styles.subLabel}>LIFE STEPS</Text>
          <FormInput
            label=""
            value={application}
            onChangeText={setApplication}
            placeholder="How does this apply to your life right now? What changes will you make?"
            multiline
            numberOfLines={4}
          />
          <Text style={styles.charCount}>{application.length} characters</Text>
        </JournalSection>

        {/* P � Prayer */}
        <JournalSection
          letter="P"
          title="Prayer"
          subtitle="Write out your conversation with God."
        >
          <Text style={styles.subLabel}>CONVERSATION</Text>
          <FormInput
            label=""
            value={prayer}
            onChangeText={setPrayer}
            placeholder="Ask God to help you apply what you've learned. Thank Him for His Word..."
            multiline
            numberOfLines={4}
          />
          <Text style={styles.charCount}>{prayer.length} characters</Text>
        </JournalSection>

        {/* Pro tip */}
        <View style={styles.proTip}>
          <Text style={styles.proTipLabel}>PRO TIP</Text>
          <Text style={styles.proTipText}>
            Try to focus on one specific command or promise from the scripture that you can act on
            within the next 24 hours.
          </Text>
        </View>

        <PrimaryButton label="Save Devotional" onPress={handleSave} loading={saving} style={styles.saveBtn} />
        <Text style={styles.savedHint}>Saved entries will appear in your Journal History.</Text>
      </ScrollView>
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={1400}
      >
        Devotional saved!
      </Snackbar>
    </SafeAreaView>
  );
}
