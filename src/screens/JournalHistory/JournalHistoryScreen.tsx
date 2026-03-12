import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useColors, Typography, Spacing, Radius } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import {
  deleteSoapEntry,
  deleteMcpwaEntry,
  deleteSwordEntry,
  deleteSermonNote,
  deletePrayEntry,
  deleteActsEntry,
  refreshProfileProgress,
} from '../../services/storageService';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import { HistoryStackParamList } from '../../navigation/types';
import { makeStyles } from './JournalHistory.styles';

type Nav = NativeStackNavigationProp<HistoryStackParamList>;

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function JournalHistoryScreen() {
  const colors = useColors();
  const styles = makeStyles(colors);
  const TYPE_COLORS: Record<string, string> = {
    SOAP:   colors.primary,
    MCPWA:  '#7C3AED',
    SWORD:  '#0891B2',
    Sermon: colors.accent,
    PRAY:   '#A855F7',
    ACTS:   '#10B981',
  };
  const navigation = useNavigation<Nav>();
  const soapEntries   = useAppStore((s) => s.soapEntries);
  const mcpwaEntries  = useAppStore((s) => s.mcpwaEntries);
  const swordEntries  = useAppStore((s) => s.swordEntries);
  const sermonNotes   = useAppStore((s) => s.sermonNotes);
  const prayEntries   = useAppStore((s) => s.prayEntries);
  const actsEntries   = useAppStore((s) => s.actsEntries);
  const profile       = useAppStore((s) => s.profile);
  const setSoapEntries = useAppStore((s) => s.setSoapEntries);
  const setMcpwaEntries = useAppStore((s) => s.setMcpwaEntries);
  const setSwordEntries = useAppStore((s) => s.setSwordEntries);
  const setSermonNotes = useAppStore((s) => s.setSermonNotes);
  const setPrayEntries = useAppStore((s) => s.setPrayEntries);
  const setActsEntries = useAppStore((s) => s.setActsEntries);
  const setProfile = useAppStore((s) => s.setProfile);

  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  type HistoryEntry = {
    id: string; type: string; date: string; createdAt: number;
    entryTitle: string; excerpt: string; tags: string[]; searchText: string;
  };

  const allEntries = useMemo((): HistoryEntry[] => [
    ...soapEntries.map((e) => ({
      id: e.id, type: 'SOAP', date: e.date, createdAt: e.createdAt,
      entryTitle: e.scripture || 'Scripture Study',
      excerpt: e.observation || e.application || '',
      tags: ['Scripture', 'Observation', 'Application', 'Prayer'],
      searchText: [e.scripture, e.fullVerse, e.observation, e.application, e.prayer]
        .filter(Boolean).join(' ').toLowerCase(),
    })),
    ...mcpwaEntries.map((e) => ({
      id: e.id, type: 'MCPWA', date: e.date, createdAt: e.createdAt,
      entryTitle: e.scripture || 'Daily Listening',
      excerpt: e.message || '',
      tags: ['Message', 'Command', 'Promise', 'Warning'],
      searchText: [e.scripture, e.message, e.command, e.promise, e.warning, e.application]
        .filter(Boolean).join(' ').toLowerCase(),
    })),
    ...swordEntries.map((e) => ({
      id: e.id, type: 'SWORD', date: e.date, createdAt: e.createdAt,
      entryTitle: e.scripture || 'Scripture Study',
      excerpt: e.observation || e.response || '',
      tags: ['Scripture', 'Word', 'Observation', 'Response'],
      searchText: [e.scripture, e.word, e.observation, e.response, e.dailyLiving]
        .filter(Boolean).join(' ').toLowerCase(),
    })),
    ...sermonNotes.map((e) => ({
      id: e.id, type: 'Sermon', date: e.serviceDate, createdAt: e.createdAt,
      entryTitle: e.title || 'Sermon Notes',
      excerpt: e.notes || '',
      tags: e.tags?.length ? e.tags : ['Sermon'],
      searchText: [e.title, e.preacher, e.church, e.mainScripture, e.notes, ...(e.tags ?? [])]
        .filter(Boolean).join(' ').toLowerCase(),
    })),
    ...prayEntries.map((e) => ({
      id: e.id, type: 'PRAY', date: e.date, createdAt: e.createdAt,
      entryTitle: e.scripture || 'Prayer',
      excerpt: e.praise || e.ask || '',
      tags: ['Praise', 'Repent', 'Ask', 'Yield'],
      searchText: [e.scripture, e.praise, e.repent, e.ask, e.yield_]
        .filter(Boolean).join(' ').toLowerCase(),
    })),
    ...actsEntries.map((e) => ({
      id: e.id, type: 'ACTS', date: e.date, createdAt: e.createdAt,
      entryTitle: e.scripture || 'Prayer',
      excerpt: e.adoration || e.thanksgiving || '',
      tags: ['Adoration', 'Confession', 'Thanksgiving', 'Supplication'],
      searchText: [e.scripture, e.adoration, e.confession, e.thanksgiving, e.supplication]
        .filter(Boolean).join(' ').toLowerCase(),
    })),
  ].sort((a, b) => b.createdAt - a.createdAt), [soapEntries, mcpwaEntries, swordEntries, sermonNotes, prayEntries, actsEntries]);

  const filtered = useMemo(() => {
    let result = allEntries;
    if (activeType) result = result.filter((e) => e.type === activeType);
    if (!search.trim()) return result;
    const q = search.toLowerCase();
    return result.filter((e) => e.searchText.includes(q));
  }, [allEntries, search, activeType]);

  // Determine which days this week had entries
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const completedDays = useMemo(() => {
    const set = new Set<number>();
    allEntries.forEach((e) => {
      const d = new Date(e.createdAt);
      if (d >= weekStart) set.add(d.getDay());
    });
    return set;
  }, [allEntries]);

  function handleDeleteEntry(item: HistoryEntry) {
    Alert.alert(
      'Delete entry?',
      `This will permanently remove this ${item.type} entry.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (item.type === 'SOAP') {
              await deleteSoapEntry(item.id);
              setSoapEntries(soapEntries.filter((e) => e.id !== item.id));
            } else if (item.type === 'MCPWA') {
              await deleteMcpwaEntry(item.id);
              setMcpwaEntries(mcpwaEntries.filter((e) => e.id !== item.id));
            } else if (item.type === 'SWORD') {
              await deleteSwordEntry(item.id);
              setSwordEntries(swordEntries.filter((e) => e.id !== item.id));
            } else if (item.type === 'PRAY') {
              await deletePrayEntry(item.id);
              setPrayEntries(prayEntries.filter((e) => e.id !== item.id));
            } else if (item.type === 'ACTS') {
              await deleteActsEntry(item.id);
              setActsEntries(actsEntries.filter((e) => e.id !== item.id));
            } else {
              await deleteSermonNote(item.id);
              setSermonNotes(sermonNotes.filter((e) => e.id !== item.id));
            }

            const profile = await refreshProfileProgress();
            setProfile(profile);
          },
        },
      ]
    );
  }

  function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    Alert.alert(
      `Delete ${selectedIds.size} ${selectedIds.size === 1 ? 'entry' : 'entries'}?`,
      'This will permanently remove the selected entries.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const ids = Array.from(selectedIds);
            const entries = filtered.filter((e) => ids.includes(e.id));
            await Promise.all(entries.map((item) => {
              if (item.type === 'SOAP')   return deleteSoapEntry(item.id);
              if (item.type === 'MCPWA') return deleteMcpwaEntry(item.id);
              if (item.type === 'SWORD') return deleteSwordEntry(item.id);
              if (item.type === 'PRAY')  return deletePrayEntry(item.id);
              if (item.type === 'ACTS')  return deleteActsEntry(item.id);
              return deleteSermonNote(item.id);
            }));
            setSoapEntries(soapEntries.filter((e) => !selectedIds.has(e.id)));
            setMcpwaEntries(mcpwaEntries.filter((e) => !selectedIds.has(e.id)));
            setSwordEntries(swordEntries.filter((e) => !selectedIds.has(e.id)));
            setPrayEntries(prayEntries.filter((e) => !selectedIds.has(e.id)));
            setActsEntries(actsEntries.filter((e) => !selectedIds.has(e.id)));
            setSermonNotes(sermonNotes.filter((e) => !selectedIds.has(e.id)));
            setSelectedIds(new Set());
            setSelectMode(false);
            const profile = await refreshProfileProgress();
            setProfile(profile);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <ScreenHeader title="Journal History" onBack={() => navigation.goBack()} />

      {/* ─── Consistency panel ─── */}
      <View style={styles.consistencyPanel}>
        <Text style={styles.consistencyTitle}>CONSISTENCY</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Icon source="fire" size={24} color={colors.textPrimary} />
            <View>
              <Text style={styles.statBadgeValue}>{profile?.dayStreak ?? 0} Days</Text>
              <Text style={styles.statBadgeLabel}>CURRENT STREAK</Text>
            </View>
          </View>
          <View style={styles.statBadge}>
            <Icon source="book-multiple" size={24} color={colors.textPrimary} />
            <View>
              <Text style={styles.statBadgeValue}>{allEntries.length}</Text>
              <Text style={styles.statBadgeLabel}>TOTAL COMPLETED</Text>
            </View>
          </View>
        </View>

        {/* Day grid */}
        <View style={styles.dayGrid}>
          {DAY_LETTERS.map((d, i) => (
            <View key={i} style={styles.dayItem}>
              <Text style={styles.dayChar}>{d}</Text>
              <View style={[
                styles.dayDot,
                completedDays.has(i) && styles.dayDotDone,
                i === today.getDay() && styles.dayDotToday,
              ]}>
                {completedDays.has(i) && <Icon source="check" size={10} color="#fff" />}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ─── Type filters ─── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeFilterScroll}
        contentContainerStyle={styles.typeFilterRow}
      >
        {(['', 'SOAP', 'MCPWA', 'SWORD', 'PRAY', 'ACTS', 'Sermon'] as const).map((type) => (
          <TouchableOpacity
            key={type || 'all'}
            style={[styles.typeChip, activeType === type && styles.typeChipActive]}
            onPress={() => setActiveType(type)}
          >
            <Text style={[styles.typeChipText, activeType === type && styles.typeChipTextActive]}>
              {type === '' ? 'ALL' : type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ─── Entries header + search ─── */}
      <View style={styles.entriesHeader}>
        <Text style={styles.sectionLabel}>ENTRIES</Text>
        <View style={styles.entriesHeaderRight}>
          <Text style={styles.entryCount}>{filtered.length}</Text>
          {filtered.length > 0 && (
            <TouchableOpacity
              style={[styles.selectBtn, selectMode && styles.selectBtnCancel]}
              onPress={() => { setSelectMode((v) => !v); setSelectedIds(new Set()); }}
            >
              <Text style={[styles.selectBtnText, selectMode && styles.selectBtnCancelText]}>
                {selectMode ? 'CANCEL' : 'SELECT'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Icon source="magnify" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search scripture or notes..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon source="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Icon source="book-open-variant" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>{search ? 'No results found' : 'No entries yet'}</Text>
          <Text style={styles.emptySubtitle}>
            {search ? 'Try a different search term.' : 'Start journaling to see your history here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, selectMode && { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <TouchableOpacity
                style={[styles.entryCard, isSelected && styles.entryCardSelected]}
                activeOpacity={0.85}
                onPress={() => {
                  if (selectMode) {
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(item.id)) next.delete(item.id);
                      else next.add(item.id);
                      return next;
                    });
                  } else {
                    navigation.navigate('DevotionalDetail', { entryId: item.id, entryType: item.type });
                  }
                }}
              >
                <View style={styles.entryMeta}>
                  {selectMode && (
                    <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                      {isSelected && <Icon source="check" size={13} color="#fff" />}
                    </View>
                  )}
                  <Text style={styles.entryDate}>{item.date}</Text>
                  <View style={styles.entryMetaRight}>
                    <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[item.type] ?? colors.primary }]}>
                      <Text style={styles.typeText}>{item.type}</Text>
                    </View>
                    {!selectMode && (
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteEntry(item)}
                      >
                        <Icon source="trash-can-outline" size={14} color={colors.textSecondary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <Text style={styles.entryTitle}>{item.entryTitle}</Text>
                {item.excerpt ? (
                  <Text style={styles.entryExcerpt} numberOfLines={2}>{item.excerpt}</Text>
                ) : null}
                <View style={styles.tagRow}>
                  {item.tags.slice(0, 4).map((tag, ti) => (
                    <View key={ti} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
      {/* ─── Bulk-select action bar ─── */}
      {selectMode && (
        <View style={styles.bottomSelectBar}>
          <Text style={styles.selectCount}>
            {selectedIds.size} selected
          </Text>
          <TouchableOpacity
            style={[styles.bulkDeleteBtn, selectedIds.size === 0 && { opacity: 0.4 }]}
            disabled={selectedIds.size === 0}
            onPress={handleBulkDelete}
          >
            <Icon source="trash-can-outline" size={16} color="#fff" />
            <Text style={styles.bulkDeleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
