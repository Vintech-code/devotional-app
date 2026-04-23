import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, FlatList, ScrollView, TouchableOpacity, TextInput, Alert, Modal,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColors, Typography, Spacing, Radius } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import {
  deleteSoapEntry,
  deleteMcpwaEntry,
  deleteSwordEntry,
  deleteSermonNote,
  deletePrayEntry,
  deleteActsEntry,
  getSoapEntries,
  getMcpwaEntries,
  getSwordEntries,
  getSermonNotes,
  getPrayEntries,
  getActsEntries,
  refreshProfileProgress,
} from '../../services/storageService';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import { HistoryStackParamList } from '../../navigation/types';
import { makeStyles } from './JournalHistory.styles';

type Nav = NativeStackNavigationProp<HistoryStackParamList>;

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CAL_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const RECENT_SEARCHES_KEY = '@devotional/history_recent_searches';

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function fmtDate(ts: number | null): string {
  if (!ts) return 'Select';
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

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
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
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

  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const hasData = (
      soapEntries.length
      + mcpwaEntries.length
      + swordEntries.length
      + sermonNotes.length
      + prayEntries.length
      + actsEntries.length
    ) > 0;
    if (hasData) return;

    void (async () => {
      try {
        const [soap, mcpwa, sword, sermon, pray, acts] = await Promise.all([
          getSoapEntries(),
          getMcpwaEntries(),
          getSwordEntries(),
          getSermonNotes(),
          getPrayEntries(),
          getActsEntries(),
        ]);
        setSoapEntries(soap);
        setMcpwaEntries(mcpwa);
        setSwordEntries(sword);
        setSermonNotes(sermon);
        setPrayEntries(pray);
        setActsEntries(acts);
      } catch {
        // Ignore recovery refresh failures; user can continue with current state.
      }
    })();
  }, [soapEntries.length, mcpwaEntries.length, swordEntries.length, sermonNotes.length, prayEntries.length, actsEntries.length, setSoapEntries, setMcpwaEntries, setSwordEntries, setSermonNotes, setPrayEntries, setActsEntries]);

  useEffect(() => {
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as string[];
        setRecentSearches(parsed.slice(0, 6));
      } catch {
        // Ignore recent search read failures.
      }
    })();
  }, []);

  async function persistRecentSearch(query: string) {
    const q = query.trim();
    if (q.length < 2) return;
    const next = [q, ...recentSearches.filter((s) => s.toLowerCase() !== q.toLowerCase())].slice(0, 6);
    setRecentSearches(next);
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    } catch {
      // Ignore recent search write failures.
    }
  }

  const filtered = useMemo(() => {
    let result = allEntries;

    if (selectedDate) {
      const selectedDay = startOfDay(selectedDate);
      result = result.filter((e) => startOfDay(e.createdAt) === selectedDay);
    }

    if (activeType) result = result.filter((e) => e.type === activeType);
    if (!search.trim()) return result;
    const q = search.toLowerCase();
    return result.filter((e) => e.searchText.includes(q));
  }, [allEntries, search, activeType, selectedDate]);

  const daysWithEntries = useMemo(() => {
    const set = new Set<number>();
    allEntries.forEach((e) => set.add(startOfDay(e.createdAt)));
    return set;
  }, [allEntries]);

  const selectedDateHasEntries = selectedDate ? daysWithEntries.has(startOfDay(selectedDate)) : false;

  const calendarCells = useMemo(() => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    const first = new Date(y, m, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const total = Math.ceil((startDay + daysInMonth) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const dayNum = i - startDay + 1;
      if (dayNum < 1 || dayNum > daysInMonth) return null;
      const d = new Date(y, m, dayNum);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });
  }, [calendarMonth]);

  function openCalendar() {
    const base = selectedDate;
    if (base) {
      const d = new Date(base);
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      setCalendarMonth(d);
    }
    setCalendarVisible(true);
  }

  function selectCalendarDate(ts: number) {
    const next = startOfDay(ts);
    setSelectedDate(next);
    setCalendarVisible(false);
  }

  function monthTitle() {
    return calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

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
            <Text style={styles.streakEmoji}>🔥</Text>
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

      {/* ─── Calendar day-check filter ─── */}
      <View style={styles.dateRangeWrap}>
        <TouchableOpacity style={styles.datePickerBtn} onPress={openCalendar}>
          <Icon source="calendar" size={16} color={colors.textSecondary} />
          <Text style={styles.datePickerLabel}>Jump to Date: {fmtDate(selectedDate)}</Text>
        </TouchableOpacity>
        {selectedDate ? (
          <TouchableOpacity
            style={[styles.clearDateBtn, styles.clearDateBtnActive]}
            onPress={() => {
              setSelectedDate(null);
            }}
          >
            <Icon source="close-circle" size={14} color={colors.error} />
            <Text style={[styles.clearDateText, styles.clearDateTextActive]}>Clear Date</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.dateFilterOffBadge}>
            <Icon source="filter-variant-remove" size={14} color={colors.textMuted} />
            <Text style={styles.dateFilterOffText}>No Date Filter</Text>
          </View>
        )}
      </View>

      {selectedDate && (
        <Text style={styles.dateStatusText}>
          {selectedDateHasEntries
            ? `You have notes on ${fmtDate(selectedDate)}.`
            : `No notes found on ${fmtDate(selectedDate)}.`}
        </Text>
      )}

      {/* ─── Entries header + search ─── */}
      <View style={styles.entriesHeader}>
        <Text style={styles.sectionLabel}>ENTRIES</Text>
        <View style={styles.entriesHeaderRight}>
          <Text style={styles.entryCount}>{filtered.length}</Text>
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
          onEndEditing={() => { void persistRecentSearch(search); }}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon source="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {recentSearches.length > 0 && !search.trim() && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentSearchScroll} contentContainerStyle={styles.recentSearchRow}>
          {recentSearches.map((q) => (
            <TouchableOpacity
              key={q}
              style={styles.recentSearchChip}
              onPress={() => setSearch(q)}
            >
              <Icon source="history" size={12} color={colors.textMuted} />
              <Text style={styles.recentSearchText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Icon source="book-open-variant" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>{search || selectedDate || activeType ? 'No results found' : 'No entries yet'}</Text>
          <Text style={styles.emptySubtitle}>
            {search || selectedDate || activeType
              ? 'Try a different date, filter, or search.'
              : 'Start journaling to see your history here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, selectMode && { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={9}
          removeClippedSubviews
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
                onLongPress={() => {
                  if (!selectMode) {
                    setSelectMode(true);
                    setSelectedIds(new Set([item.id]));
                    return;
                  }
                  setSelectedIds((prev) => {
                    const next = new Set(prev);
                    if (next.has(item.id)) next.delete(item.id);
                    else next.add(item.id);
                    return next;
                  });
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
          <View style={styles.bottomSelectActions}>
            <TouchableOpacity
              style={styles.bulkCancelBtn}
              onPress={() => {
                setSelectMode(false);
                setSelectedIds(new Set());
              }}
            >
              <Icon source="close" size={16} color={colors.textSecondary} />
              <Text style={styles.bulkCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bulkDeleteBtn, selectedIds.size === 0 && { opacity: 0.4 }]}
              disabled={selectedIds.size === 0}
              onPress={handleBulkDelete}
            >
              <Icon source="trash-can-outline" size={16} color="#fff" />
              <Text style={styles.bulkDeleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal visible={calendarVisible} transparent animationType="fade" onRequestClose={() => setCalendarVisible(false)}>
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeaderRow}>
              <TouchableOpacity
                onPress={() => {
                  const prev = new Date(calendarMonth);
                  prev.setMonth(prev.getMonth() - 1);
                  setCalendarMonth(prev);
                }}
                style={styles.calendarNavBtn}
              >
                <Icon source="chevron-left" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>{monthTitle()}</Text>
              <TouchableOpacity
                onPress={() => {
                  const next = new Date(calendarMonth);
                  next.setMonth(next.getMonth() + 1);
                  setCalendarMonth(next);
                }}
                style={styles.calendarNavBtn}
              >
                <Icon source="chevron-right" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.calendarHint}>Tap any date to check if notes were written.</Text>

            <View style={styles.calendarWeekHeader}>
              {CAL_DAYS.map((d, idx) => (
                <Text key={`${d}-${idx}`} style={styles.calendarWeekDay}>{d}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarCells.map((cellTs, idx) => {
                if (!cellTs) return <View key={`empty-${idx}`} style={styles.calendarCell} />;
                const hasEntry = daysWithEntries.has(cellTs);
                const selected = selectedDate ? cellTs === startOfDay(selectedDate) : false;
                return (
                  <TouchableOpacity
                    key={String(cellTs)}
                    style={[
                      styles.calendarCell,
                      hasEntry && styles.calendarCellHasEntry,
                      selected && styles.calendarCellSelected,
                    ]}
                    onPress={() => selectCalendarDate(cellTs)}
                  >
                    <Text style={[styles.calendarCellText, selected && styles.calendarCellTextSelected]}>
                      {new Date(cellTs).getDate()}
                    </Text>
                    {hasEntry && <View style={styles.calendarEntryDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.calendarActions}>
              <TouchableOpacity style={styles.calendarActionBtn} onPress={() => setCalendarVisible(false)}>
                <Text style={styles.calendarActionText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
