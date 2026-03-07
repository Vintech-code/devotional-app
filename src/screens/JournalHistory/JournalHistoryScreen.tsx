import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { Colors, Typography, Spacing, Radius } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import {
  deleteSoapEntry,
  deleteMcpwaEntry,
  deleteSwordEntry,
  deleteSermonNote,
  refreshProfileProgress,
} from '../../services/storageService';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import { styles } from './JournalHistory.styles';

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const TYPE_COLORS: Record<string, string> = {
  SOAP:   Colors.primary,
  MCPWA:  '#7C3AED',
  SWORD:  '#0891B2',
  Sermon: Colors.accent,
};

export default function JournalHistoryScreen() {
  const navigation = useNavigation();
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

  type HistoryEntry = {
    id: string; type: string; date: string; createdAt: number;
    entryTitle: string; excerpt: string; tags: string[];
  };

  const allEntries = useMemo((): HistoryEntry[] => [
    ...soapEntries.map((e) => ({
      id: e.id, type: 'SOAP', date: e.date, createdAt: e.createdAt,
      entryTitle: e.scripture || 'Scripture Study',
      excerpt: e.observation || e.application || '',
      tags: ['Scripture', 'Observation', 'Application', 'Prayer'],
    })),
    ...mcpwaEntries.map((e) => ({
      id: e.id, type: 'MCPWA', date: e.date, createdAt: e.createdAt,
      entryTitle: e.scripture || 'Daily Listening',
      excerpt: e.message || '',
      tags: ['Message', 'Command', 'Promise', 'Warning'],
    })),
    ...swordEntries.map((e) => ({
      id: e.id, type: 'SWORD', date: e.date, createdAt: e.createdAt,
      entryTitle: e.scripture || 'Scripture Study',
      excerpt: e.observation || e.response || '',
      tags: ['Scripture', 'Word', 'Observation', 'Response'],
    })),
    ...sermonNotes.map((e) => ({
      id: e.id, type: 'Sermon', date: e.serviceDate, createdAt: e.createdAt,
      entryTitle: e.title || 'Sermon Notes',
      excerpt: e.notes || '',
      tags: e.tags?.length ? e.tags : ['Sermon'],
    })),
  ].sort((a, b) => b.createdAt - a.createdAt), [soapEntries, mcpwaEntries, swordEntries, sermonNotes]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allEntries;
    const q = search.toLowerCase();
    return allEntries.filter(
      (e) => e.entryTitle.toLowerCase().includes(q) || e.excerpt.toLowerCase().includes(q),
    );
  }, [allEntries, search]);

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
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Journal History" onBack={() => navigation.goBack()} />

      {/* â”€â”€â”€ Consistency panel â”€â”€â”€ */}
      <View style={styles.consistencyPanel}>
        <Text style={styles.consistencyTitle}>CONSISTENCY</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Icon source="fire" size={24} color={Colors.primary} />
            <View>
              <Text style={styles.statBadgeValue}>{profile?.dayStreak ?? 0} Days</Text>
              <Text style={styles.statBadgeLabel}>CURRENT STREAK</Text>
            </View>
          </View>
          <View style={styles.statBadge}>
            <Icon source="book-multiple" size={24} color={Colors.primary} />
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

      {/* â”€â”€â”€ Entries header + search â”€â”€â”€ */}
      <View style={styles.entriesHeader}>
        <Text style={styles.sectionLabel}>ENTRIES</Text>
        <Text style={styles.entryCount}>{filtered.length}</Text>
      </View>

      <View style={styles.searchWrap}>
        <Icon source="magnify" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search scripture or notes..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon source="close" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Icon source="book-open-variant" size={48} color={Colors.textMuted} />
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
            <TouchableOpacity style={styles.entryCard} activeOpacity={0.85}>
              <View style={styles.entryMeta}>
                <Text style={styles.entryDate}>{item.date}</Text>
                <View style={styles.entryMetaRight}>
                  <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[item.type] ?? Colors.primary }]}>
                    <Text style={styles.typeText}>{item.type}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => {
                      handleDeleteEntry(item);
                    }}
                  >
                    <Icon source="trash-can-outline" size={14} color={Colors.textMuted} />
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
