import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, Modal } from 'react-native';
import { Icon } from 'react-native-paper';
import AppToast from '../../components/AppToast/AppToast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { JournalStackParamList } from '../../navigation/types';
import { SermonNote, SermonTag } from '../../types';
import { useColors } from '../../theme';
import { saveSermonNote, refreshProfileProgress } from '../../services/storageService';
import { clearDraft, loadDraft, saveDraft } from '../../services/draftService';
import { trackEvent } from '../../services/analyticsService';
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

type SermonDraft = {
  title: string;
  preacher: string;
  church: string;
  serviceDate: string;
  notes: string;
  selectedTags: string[];
  customTags: string[];
  noteFontSize: number;
  imageUris: string[];
};

export default function SermonNotesScreen({ navigation, route }: Props) {
  const colors = useColors();
  const styles = makeStyles(colors);
  const setSermonNotes = useAppStore((s) => s.setSermonNotes);
  const setProfile = useAppStore((s) => s.setProfile);
  const existingNotes = useAppStore((s) => s.sermonNotes);
  const noteId = route.params?.noteId;

  const editingNote = useMemo(() => (
    noteId ? existingNotes.find((n) => n.id === noteId) : undefined
  ), [existingNotes, noteId]);

  const [title, setTitle] = useState('');
  const [preacher, setPreacher] = useState('');
  const [church, setChurch] = useState('');
  const [serviceDate, setServiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [noteFontSize, setNoteFontSize] = useState(16);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [fullscreenImageUri, setFullscreenImageUri] = useState<string | null>(null);
  const hydratedRef = useRef(false);
  const exportCardRef = useRef<View>(null);

  useEffect(() => {
    if (!editingNote) return;
    setTitle(editingNote.title ?? '');
    setPreacher(editingNote.preacher ?? '');
    setChurch(editingNote.church ?? '');
    setServiceDate(editingNote.serviceDate ?? new Date().toISOString().split('T')[0]);
    setNotes(editingNote.notes ?? '');
    setSelectedTags(editingNote.tags ?? []);
    setCustomTags((editingNote.tags ?? []).filter((t) => !PRESET_TAGS.includes(t as SermonTag)));
    setCustomTagInput('');
    setNoteFontSize(editingNote.noteFontSize ?? 16);
    setImageUris(editingNote.imageUris ?? []);
    hydratedRef.current = true;
  }, [editingNote]);

  useEffect(() => {
    if (editingNote) return;
    void (async () => {
      const draft = await loadDraft<SermonDraft>('sermon-notes');
      if (!draft) {
        hydratedRef.current = true;
        return;
      }
      setTitle(draft.title ?? '');
      setPreacher(draft.preacher ?? '');
      setChurch(draft.church ?? '');
      setServiceDate(draft.serviceDate ?? new Date().toISOString().split('T')[0]);
      setNotes(draft.notes ?? '');
      setSelectedTags(draft.selectedTags ?? []);
      setCustomTags(draft.customTags ?? []);
      setNoteFontSize(draft.noteFontSize ?? 16);
      setImageUris(draft.imageUris ?? []);
      hydratedRef.current = true;
    })();
  }, [editingNote]);

  useEffect(() => {
    if (editingNote || !hydratedRef.current) return;
    const timer = setTimeout(() => {
      void saveDraft<SermonDraft>('sermon-notes', {
        title,
        preacher,
        church,
        serviceDate,
        notes,
        selectedTags,
        customTags,
        noteFontSize,
        imageUris,
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [editingNote, title, preacher, church, serviceDate, notes, selectedTags, customTags, noteFontSize, imageUris]);

  const allTags = [...PRESET_TAGS, ...customTags];
  const isTitleValid = title.trim().length > 0;
  const isNotesValid = notes.trim().length > 0;
  const canSave = isTitleValid && isNotesValid;

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function insertBullet() {
    setNotes((prev) => {
      if (!prev.trim()) return '• ';
      if (prev.endsWith('\n')) return prev + '• ';
      return `${prev}\n• `;
    });
  }

  function insertNumbered() {
    setNotes((prev) => {
      const lines = prev.split('\n');
      const last = lines[lines.length - 1] ?? '';
      const match = last.match(/^\s*(\d+)\.\s/);
      const next = match ? Number(match[1]) + 1 : 1;
      if (!prev.trim()) return `${next}. `;
      if (prev.endsWith('\n')) return `${prev}${next}. `;
      return `${prev}\n${next}. `;
    });
  }

  function insertChecklist() {
    setNotes((prev) => {
      if (!prev.trim()) return '[ ] ';
      if (prev.endsWith('\n')) return prev + '[ ] ';
      return `${prev}\n[ ] `;
    });
  }

  function insertQuoteBlock() {
    setNotes((prev) => {
      if (!prev.trim()) return '> ';
      if (prev.endsWith('\n')) return prev + '> ';
      return `${prev}\n> `;
    });
  }

  function addCustomTag() {
    const tag = customTagInput.trim().replace(/^#/, '');
    if (!tag) return;
    const exists = allTags.some((t) => t.toLowerCase() === tag.toLowerCase());
    if (exists) {
      setCustomTagInput('');
      return;
    }
    setCustomTags((prev) => [...prev, tag]);
    setSelectedTags((prev) => [...prev, tag]);
    setCustomTagInput('');
  }

  function removeCustomTag(tag: string) {
    setCustomTags((prev) => prev.filter((t) => t !== tag));
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to photos to attach images to your note.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: false,
    });
    if (result.canceled) return;
    const uri = result.assets[0]?.uri;
    if (!uri) return;
    setImageUris((prev) => [...prev, uri]);
  }

  function removeImage(uri: string) {
    setImageUris((prev) => prev.filter((u) => u !== uri));
  }

  function moveImageLeft(index: number) {
    if (index <= 0) return;
    setImageUris((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveImageRight(index: number) {
    setImageUris((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index + 1], next[index]] = [next[index], next[index + 1]];
      return next;
    });
  }

  async function exportAsImage() {
    if (!exportCardRef.current) return;
    try {
      const uri = await captureRef(exportCardRef, {
        format: 'png',
        quality: 1,
      });
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing unavailable', 'This device does not support sharing right now.');
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Export Sermon Note' });
    } catch {
      Alert.alert('Export failed', 'Could not export the sermon note as image.');
    }
  }

  function handleClear() {
    setTitle('');
    setPreacher('');
    setChurch('');
    setNotes('');
    setSelectedTags([]);
    setCustomTags([]);
    setCustomTagInput('');
    setImageUris([]);
    setNoteFontSize(16);
  }

  async function handleSave() {
    if (!canSave) {
      await trackEvent('save_fail', { method: 'SERMON', context: 'validation' });
      Alert.alert('Incomplete note', 'Please fill in Sermon Title and Sermon Notes before saving.');
      return;
    }
    try {
      setSaving(true);
      const note: SermonNote = {
        id: editingNote?.id ?? generateId(),
        title,
        preacher,
        church,
        serviceDate,
        notes,
        tags: selectedTags,
        noteFontSize,
        imageUris,
        createdAt: editingNote?.createdAt ?? Date.now(),
      };
      await saveSermonNote(note);
      if (editingNote) {
        setSermonNotes(existingNotes.map((n) => (n.id === note.id ? note : n)));
      } else {
        setSermonNotes([note, ...existingNotes]);
      }
      const profile = await refreshProfileProgress();
      setProfile(profile);
      if (!editingNote) {
        void clearDraft('sermon-notes');
      }
      setSaving(false);
      setSnackVisible(true);
      setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('JournalHome');
        }
      }, 900);
    } catch {
      setSaving(false);
      await trackEvent('save_fail', { method: 'SERMON', context: 'exception' });
      Alert.alert('Save failed', 'Could not save this sermon note. Please try again.');
    }
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
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Icon source="notebook-edit-outline" size={18} color={colors.primary} />
            <Text style={styles.heroTitle}>Sermon Notebook</Text>
          </View>
          <Text style={styles.heroSub}>Capture key points, action steps, and prayer reflections in one clean note.</Text>
        </View>

        {/* Title row */}
        <View style={styles.sermonTitleRow}>
          <Text style={styles.sermonNew}>{editingNote ? 'Edit Sermon' : 'New Sermon'}</Text>
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
            <View style={styles.metaTextWrap}>
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
            <View style={styles.metaTextWrap}>
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
            <View style={styles.metaTextWrap}>
              <Text style={styles.metaLabel}>SERVICE DATE</Text>
              <Text style={styles.metaValue}>{serviceDate}</Text>
            </View>
          </View>
        </View>

        <View ref={exportCardRef} collapsable={false} style={styles.exportWrap}>
        {/* Notes */}
        <Text style={styles.fieldLabel}>SERMON NOTES</Text>
        <View style={styles.notesToolsRow}>
          <TouchableOpacity style={styles.toolBtn} onPress={insertBullet}>
            <Icon source="format-list-bulleted" size={16} color={colors.textSecondary} />
            <Text style={styles.toolBtnText}>Bullet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={insertNumbered}>
            <Icon source="format-list-numbered" size={16} color={colors.textSecondary} />
            <Text style={styles.toolBtnText}>Number</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={insertChecklist}>
            <Icon source="checkbox-marked-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.toolBtnText}>Checklist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={insertQuoteBlock}>
            <Icon source="format-quote-close" size={16} color={colors.textSecondary} />
            <Text style={styles.toolBtnText}>Quote</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => setNoteFontSize((s) => Math.max(12, s - 1))}
          >
            <Text style={styles.toolBtnText}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => setNoteFontSize((s) => Math.min(28, s + 1))}
          >
            <Text style={styles.toolBtnText}>A+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolBtn} onPress={() => { void pickImage(); }}>
            <Icon source="image-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.toolBtnText}>Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notesBox}>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
            placeholder="Type sermon notes here. Use Bullet button for points."
            placeholderTextColor={colors.textMuted}
            style={[styles.notesInput, { fontSize: noteFontSize }]}
            maxLength={5000}
          />
        </View>
        <Text style={styles.charCount}>{notes.length} CHARACTERS</Text>

        {imageUris.length > 0 && (
          <>
            <Text style={styles.fieldLabel}>ATTACHED PHOTOS ({imageUris.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
              {imageUris.map((uri, idx) => (
                <View key={`${uri}-${idx}`} style={styles.photoItem}>
                  <TouchableOpacity activeOpacity={0.9} onPress={() => setFullscreenImageUri(uri)}>
                    <Image source={{ uri }} style={styles.photoThumb} />
                  </TouchableOpacity>
                  <View style={styles.photoReorderRow}>
                    <TouchableOpacity style={styles.photoControlBtn} onPress={() => moveImageLeft(idx)}>
                      <Icon source="arrow-left" size={12} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.photoControlBtn} onPress={() => moveImageRight(idx)}>
                      <Icon source="arrow-right" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.photoRemoveBtn} onPress={() => removeImage(uri)}>
                    <Icon source="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </>
        )}
        </View>

        {/* Tags */}
        <Text style={styles.fieldLabel}>THEMES & TAGS</Text>
        <TagSelector tags={allTags} activeTags={selectedTags} onToggle={toggleTag} />
        <View style={styles.customTagRow}>
          <TextInput
            value={customTagInput}
            onChangeText={setCustomTagInput}
            placeholder="Add custom tag"
            placeholderTextColor={colors.textMuted}
            style={styles.customTagInput}
            onSubmitEditing={addCustomTag}
          />
          <TouchableOpacity style={styles.customTagBtn} onPress={addCustomTag}>
            <Text style={styles.customTagText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {customTags.length > 0 && (
          <View style={styles.customTagsManageWrap}>
            <Text style={styles.customTagsManageTitle}>CUSTOM TAGS</Text>
            <View style={styles.customTagsManageRow}>
              {customTags.map((tag) => (
                <View key={tag} style={styles.customTagPill}>
                  <Text style={styles.customTagPillText}>#{tag}</Text>
                  <TouchableOpacity onPress={() => removeCustomTag(tag)} style={styles.customTagDeleteBtn}>
                    <Icon source="close-circle" size={14} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>REQUIRED TO SAVE</Text>
          <View style={styles.requirementRow}>
            <Icon source={isTitleValid ? 'check-circle' : 'alert-circle-outline'} size={16} color={isTitleValid ? '#16A34A' : colors.error} />
            <Text style={[styles.requirementText, !isTitleValid && styles.requirementTextError]}>Sermon Title</Text>
          </View>
          <View style={styles.requirementRow}>
            <Icon source={isNotesValid ? 'check-circle' : 'alert-circle-outline'} size={16} color={isNotesValid ? '#16A34A' : colors.error} />
            <Text style={[styles.requirementText, !isNotesValid && styles.requirementTextError]}>Sermon Notes</Text>
          </View>
        </View>

        <PrimaryButton
          label={editingNote ? 'Update Sermon Note' : 'Save Sermon Note'}
          onPress={handleSave}
          loading={saving}
          disabled={!canSave}
          style={styles.saveBtn}
        />

        <View style={styles.exportRow}>
          <TouchableOpacity style={styles.exportBtn} onPress={() => { void exportAsImage(); }}>
            <Icon source="image" size={16} color={colors.primary} />
            <Text style={styles.exportBtnText}>Export Image</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={!!fullscreenImageUri} transparent animationType="fade" onRequestClose={() => setFullscreenImageUri(null)}>
        <View style={styles.fullscreenOverlay}>
          <TouchableOpacity style={styles.fullscreenClose} onPress={() => setFullscreenImageUri(null)}>
            <Icon source="close" size={22} color="#fff" />
          </TouchableOpacity>
          {fullscreenImageUri && (
            <Image source={{ uri: fullscreenImageUri }} style={styles.fullscreenImage} resizeMode="contain" />
          )}
        </View>
      </Modal>

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
