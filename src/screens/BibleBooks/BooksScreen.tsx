/**
 * src/screens/BibleBooks/BooksScreen.tsx
 *
 * Displays all 66 Bible books grouped by testament.
 * Tapping a book navigates to ChaptersScreen.
 * A translation picker button in the header lets the user switch between
 * all 16 bible-api.com translations.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity,
  TextInput, ActivityIndicator, StyleSheet, SectionList,
  Modal, FlatList, Pressable,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useColors, Typography, Spacing, Radius } from '../../theme';
import { getBooks } from '../../services/bibleService';
import { BIBLE_TRANSLATIONS, getTranslationById } from '../../data/bibleTranslations';
import { useAppStore } from '../../store/useAppStore';
import type { BibleBook } from '../../types/bible';
import type { BibleStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<BibleStackParamList, 'Books'>;

type Section = { title: string; data: BibleBook[] };

export default function BooksScreen() {
  const colors     = useColors();
  const navigation = useNavigation<Nav>();
  const styles     = makeStyles(colors);

  const bibleTranslation  = useAppStore((s) => s.bibleTranslation);
  const setBibleTranslation = useAppStore((s) => s.setBibleTranslation);

  const [books,         setBooks]         = useState<BibleBook[]>([]);
  const [search,        setSearch]        = useState('');
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    getBooks()
      .then(setBooks)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? books.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))
    : books;

  const sections: Section[] = [
    { title: 'Old Testament', data: filtered.filter((b) => b.testament === 'OT') },
    { title: 'New Testament', data: filtered.filter((b) => b.testament === 'NT') },
  ].filter((s) => s.data.length > 0);

  const handleSelect = useCallback((book: BibleBook) => {
    navigation.navigate('Chapters', { bookId: book.id, bookName: book.name, totalChapters: book.chapters });
  }, [navigation]);

  const activeTrans = getTranslationById(bibleTranslation);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Preparing Bible…</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]} edges={['top']}>
        <Icon source="alert-circle-outline" size={40} color={colors.error} />
        <Text style={styles.errorText}>Failed to load Bible</Text>
        <Text style={styles.errorSub}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Holy Bible</Text>
            <Text style={styles.headerSub}>{activeTrans?.name ?? bibleTranslation.toUpperCase()}</Text>
          </View>
          {/* Translation switcher button */}
          <TouchableOpacity style={styles.transBtn} onPress={() => setPickerVisible(true)}>
            <Text style={styles.transBtnLabel}>{activeTrans?.shortName ?? bibleTranslation.toUpperCase()}</Text>
            <Icon source="chevron-down" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Icon source="magnify" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search books…"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon source="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Book list grouped by testament */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
            <Text style={styles.sectionCount}>{section.data.length} books</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bookRow}
            onPress={() => handleSelect(item)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.bookBadge,
              { backgroundColor: item.testament === 'OT' ? colors.primary + '20' : colors.accent + '20' },
            ]}>
              <Text style={[
                styles.bookBadgeText,
                { color: item.testament === 'OT' ? colors.primary : colors.accent },
              ]}>
                {item.id}
              </Text>
            </View>
            <View style={styles.bookInfo}>
              <Text style={styles.bookName}>{item.name}</Text>
              <Text style={styles.bookMeta}>{item.chapters} chapters</Text>
            </View>
            <Icon source="chevron-right" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Translation Picker Modal */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPickerVisible(false)} />

        <View style={styles.sheet}>
          {/* Sheet header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Choose Translation</Text>
            <TouchableOpacity onPress={() => setPickerVisible(false)} hitSlop={12}>
              <Icon source="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sheetSub}>{BIBLE_TRANSLATIONS.length} translations available</Text>

          <FlatList
            data={BIBLE_TRANSLATIONS}
            keyExtractor={(t) => t.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.sheetSep} />}
            renderItem={({ item }) => {
              const isActive = item.id === bibleTranslation;
              return (
                <TouchableOpacity
                  style={[styles.transRow, isActive && styles.transRowActive]}
                  onPress={() => { setBibleTranslation(item.id); setPickerVisible(false); }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.transBadge, isActive && styles.transBadgeActive]}>
                    <Text style={[styles.transBadgeText, isActive && styles.transBadgeTextActive]}>
                      {item.shortName}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.transName, isActive && styles.transNameActive]}>
                      {item.name}
                    </Text>
                    <Text style={styles.transLang}>{item.language}</Text>
                  </View>
                  {isActive && <Icon source="check" size={18} color={colors.primary} />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (c: ReturnType<typeof useColors>) => StyleSheet.create({
  safe:         { flex: 1, backgroundColor: c.background },
  center:       { alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText:  { color: c.textSecondary, marginTop: 8 },
  errorText:    { color: c.error, fontSize: Typography.size.lg, fontWeight: Typography.weight.bold },
  errorSub:     { color: c.textMuted, textAlign: 'center', paddingHorizontal: Spacing.xl },

  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: c.surface,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: c.textPrimary },
  headerSub:   { fontSize: Typography.size.sm, color: c.textMuted, marginTop: 2 },

  transBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: c.primary,
    backgroundColor: c.primary + '15',
  },
  transBtnLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: c.primary,
    letterSpacing: 0.5,
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surfaceAlt,
    margin: Spacing.md,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: Typography.size.md, color: c.textPrimary },

  list: { paddingBottom: Spacing.xl },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: c.background,
  },
  sectionTitle: { fontSize: Typography.size.xs, fontWeight: Typography.weight.bold, color: c.textMuted, letterSpacing: 1 },
  sectionCount: { fontSize: Typography.size.xs, color: c.textMuted },

  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: c.surface,
    gap: 12,
  },
  bookBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBadgeText: { fontSize: Typography.size.xs, fontWeight: Typography.weight.bold },
  bookInfo:     { flex: 1 },
  bookName:     { fontSize: Typography.size.md, fontWeight: Typography.weight.semiBold, color: c.textPrimary },
  bookMeta:     { fontSize: Typography.size.sm, color: c.textMuted, marginTop: 1 },
  separator:    { height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginLeft: 60 },

  // ── Translation picker sheet ─────────────────────────────────────────────────
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.50)' },
  sheet: {
    backgroundColor: c.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: c.border,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  sheetTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: c.textPrimary },
  sheetSub:   { fontSize: Typography.size.sm, color: c.textMuted, paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  sheetSep:   { height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginLeft: 64 },

  transRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: 12,
  },
  transRowActive: { backgroundColor: c.primary + '10' },
  transBadge: {
    width: 44,
    height: 28,
    borderRadius: 6,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: c.border,
  },
  transBadgeActive: { backgroundColor: c.primary + '20', borderColor: c.primary },
  transBadgeText:       { fontSize: 10, fontWeight: Typography.weight.bold, color: c.textMuted, letterSpacing: 0.5 },
  transBadgeTextActive: { color: c.primary },
  transName:       { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold, color: c.textPrimary },
  transNameActive: { color: c.primary },
  transLang:       { fontSize: Typography.size.xs, color: c.textMuted, marginTop: 2 },
});

