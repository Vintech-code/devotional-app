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
  };
  const navigation = useNavigation<Nav>();
  const soapEntries   = useAppStore((s) => s.soapEntries);
  const mcpwaEntries  = useAppStore((s) => s.mcpwaEntries);
  const swordEntries  = useAppStore((s) => s.swordEntries);
  const sermonNotes   = useAppStore((s) => s.sermonNotes);
  const profile       = useAppStore((s) => s.profile);
  const setSoapEntries = useAppStore((s) => s.setSoapEntries);
  const setMcpwaEntries = useAppStore((s) => s.setMcpwaEntries);
  const setSwordEntries = useAppStore((s) => s.setSwordEntries);
  const setSermonNotes = useAppStore((s) => s.setSermonNotes);
  const setProfile = useAppStore((s) => s.setProfile);

  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('');

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
  ].sort((a, b) => b.createdAt - a.createdAt), [soapEntries, mcpwaEntries, swordEntries, sermonNotes]);

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
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.typeFilterRow}
      >
        {(['', 'SOAP', 'MCPWA', 'SWORD', 'Sermon'] as const).map((type) => (
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
        <Text style={styles.entryCount}>{filtered.length}</Text>
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
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.entryCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('DevotionalDetail', { entryId: item.id, entryType: item.type })}
            >
              <View style={styles.entryMeta}>
                <Text style={styles.entryDate}>{item.date}</Text>
                <View style={styles.entryMetaRight}>
                  <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[item.type] ?? colors.primary }]}>
                    <Text style={styles.typeText}>{item.type}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => {
                      handleDeleteEntry(item);
                    }}
                  >
                    <Icon source="trash-can-outline" size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
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
          )}
        />
      )}
    </SafeAreaView>
  );
}
