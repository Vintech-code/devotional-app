import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Icon, Snackbar } from 'react-native-paper';
import AppToast from '../../components/AppToast/AppToast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { JournalStackParamList } from '../../navigation/types';
import { SermonNote, SermonTag } from '../../types';
import { useColors, Typography, Spacing, Radius } from '../../theme';
import { saveSermonNote, refreshProfileProgress } from '../../services/storageService';
import { useAppStore } from '../../store/useAppStore';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import FormInput from '../../components/FormInput/FormInput';
import TagSelector from '../../components/TagSelector/TagSelector';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { makeStyles } from './SermonNotes.styles';

type Props = NativeStackScreenProps<JournalStackParamList, 'SermonNotes'>;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

const PRESET_TAGS: SermonTag[] = [
  'Faith', 'Grace', 'Hope', 'Love', 'Wisdom', 'Healing', 'Prayer', 'Leadership', 'Gospel',
];

export default function SermonNotesScreen({ navigation }: Props) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const setSermonNotes = useAppStore((s) => s.setSermonNotes);
  const setProfile = useAppStore((s) => s.setProfile);
  const existingNotes = useAppStore((s) => s.sermonNotes);

  const [title, setTitle] = useState('');
  const [preacher, setPreacher] = useState('');
  const [church, setChurch] = useState('');
  const [serviceDate, setServiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [mainScripture, setMainScripture] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleClear() {
    setTitle('');
    setPreacher('');
    setChurch('');
    setMainScripture('');
    setNotes('');
    setSelectedTags([]);
  }

  async function handleSave() {
    if (!title) return;
    setSaving(true);
    const note: SermonNote = {
      id: generateId(),
      title,
      preacher,
      church,
      serviceDate,
      mainScripture,
      notes,
      tags: selectedTags,
      createdAt: Date.now(),
    };
    await saveSermonNote(note);
    setSermonNotes([note, ...existingNotes]);
    const profile = await refreshProfileProgress();
    setProfile(profile);
    setSaving(false);
    setSnackVisible(true);
    setTimeout(() => navigation.goBack(), 1500);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Sermon Notes"
        onBack={() => navigation.goBack()}
        rightIcon="check"
        onRightPress={handleSave}
      />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Title row */}
        <View style={styles.sermonTitleRow}>
          <Text style={styles.sermonNew}>New Sermon</Text>
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <Text style={styles.clearText}>+ Clear Form</Text>
          </TouchableOpacity>
        </View>

        {/* Sermon title field */}
        <Text style={styles.fieldLabel}>SERMON TITLE</Text>
        <FormInput
          label=""
          value={title}
          onChangeText={setTitle}
          placeholder="Enter sermon title..."
        />

        {/* Meta row */}
        <View style={styles.metaCard}>
          <View style={styles.metaItem}>
            <Icon source="account" size={20} color={colors.textPrimary} />
            <View>
              <Text style={styles.metaLabel}>PREACHER</Text>
              <FormInput
                label=""
                value={preacher}
                onChangeText={setPreacher}
                placeholder="Pastor's Name"
                style={styles.metaInput}
              />
            </View>
          </View>
          <View style={styles.dividerLine} />
          <View style={styles.metaItem}>
            <Icon source="bank" size={20} color={colors.textPrimary} />
            <View>
              <Text style={styles.metaLabel}>CHURCH</Text>
              <FormInput
                label=""
                value={church}
                onChangeText={setChurch}
                placeholder="Church Name"
                style={styles.metaInput}
              />
            </View>
          </View>
          <View style={styles.dividerLine} />
          <View style={styles.metaItem}>
            <Icon source="calendar" size={20} color={colors.textPrimary} />
            <View>
              <Text style={styles.metaLabel}>SERVICE DATE</Text>
              <Text style={styles.metaValue}>{serviceDate}</Text>
            </View>
          </View>
        </View>

        {/* Main scripture */}
        <Text style={styles.fieldLabel}>MAIN SCRIPTURE</Text>
        <FormInput
          label=""
          value={mainScripture}
          onChangeText={setMainScripture}
          placeholder="e.g. John 3:16-17"
        />

        {/* Notes */}
        <Text style={styles.fieldLabel}>SERMON NOTES</Text>
        <FormInput
          label=""
          value={notes}
          onChangeText={setNotes}
          placeholder="Start typing your reflections and sermon points here..."
          multiline
          numberOfLines={10}
          maxLength={5000}
        />
        <Text style={styles.charCount}>{notes.length} CHARACTERS</Text>

        {/* Tags */}
        <Text style={styles.fieldLabel}>THEMES & TAGS</Text>
        <TagSelector tags={PRESET_TAGS} activeTags={selectedTags} onToggle={toggleTag} />
        <TouchableOpacity style={styles.customTagBtn}>
          <Text style={styles.customTagText}>+ Custom</Text>
        </TouchableOpacity>

        <PrimaryButton
          label="Save Sermon Note"
          onPress={handleSave}
          loading={saving}
          disabled={!title}
          style={styles.saveBtn}
        />
      </ScrollView>
      <AppToast
        visible={snackVisible}
        emoji="✍️"
        title="Sermon note saved!"
        message="Your note has been added to Journal History."
        onDismiss={() => setSnackVisible(false)}
      />
    </SafeAreaView>
  );
}
