/**
 * src/screens/BibleChapters/ChaptersScreen.tsx
 *
 * Displays a grid of chapters for a given book.
 * Shows verse count per chapter. Tapping navigates to VersesScreen.
 */

import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useColors, Typography, Spacing, Radius } from '../../theme';
import { getChapters } from '../../services/bibleService';
import { useAppStore } from '../../store/useAppStore';
import type { ChapterSummary } from '../../types/bible';
import type { BibleStackParamList } from '../../navigation/types';

type Nav   = NativeStackNavigationProp<BibleStackParamList, 'Chapters'>;
type Route = RouteProp<BibleStackParamList, 'Chapters'>;

// Build an array [1…totalChapters] with placeholder verse counts while loading
function buildPlaceholders(total: number): ChapterSummary[] {
  return Array.from({ length: total }, (_, i) => ({ chapter: i + 1, verseCount: 0 }));
}

export default function ChaptersScreen() {
  const colors     = useColors();
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const styles     = makeStyles(colors);
  const { bookId, bookName, totalChapters } = route.params;

  const bibleTranslation = useAppStore((s) => s.bibleTranslation);

  const [chapters, setChapters] = useState<ChapterSummary[]>(buildPlaceholders(totalChapters));
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getChapters(bookId, bibleTranslation)
      .then((data) => {
        // Merge DB data with placeholder if some chapters have no seeded verses
        setChapters((prev) =>
          prev.map((p) => {
            const found = data.find((d) => d.chapter === p.chapter);
            return found ?? p;
          }),
        );
      })
      .finally(() => setLoading(false));
  }, [bookId, bibleTranslation]);

  function handleSelect(chapter: number) {
    navigation.navigate('Verses', { bookId, bookName, chapter });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      {/* Header with back */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon source="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{bookName}</Text>
          <Text style={styles.headerSub}>{totalChapters} chapters · {bibleTranslation.toUpperCase()}</Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      )}

      <FlatList
        data={chapters}
        keyExtractor={(item) => String(item.chapter)}
        numColumns={5}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const cached = item.verseCount > 0;
          return (
            <TouchableOpacity
              style={[styles.cell, cached && styles.cellCached]}
              onPress={() => handleSelect(item.chapter)}
              activeOpacity={0.7}
            >
              <Text style={styles.cellNum}>{item.chapter}</Text>
              {cached ? (
                <Text style={styles.cellVerse}>{item.verseCount}v</Text>
              ) : (
                <Icon source="cloud-download-outline" size={10} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const makeStyles = (c: ReturnType<typeof useColors>) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: c.surface,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    gap: 12,
  },
  backBtn:     { padding: 4 },
  headerText:  { flex: 1 },
  headerTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: c.textPrimary },
  headerSub:   { fontSize: Typography.size.sm, color: c.textMuted },

  loadingBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: c.surfaceAlt,
  },
  loadingText: { fontSize: Typography.size.sm, color: c.textMuted },

  grid: { padding: Spacing.md, gap: 10 },

  cell: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    backgroundColor: c.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellCached: {
    borderColor: c.primary,
    borderWidth: 1.5,
  },
  cellNum:   { fontSize: Typography.size.md, fontWeight: Typography.weight.semiBold, color: c.textPrimary },
  cellVerse: { fontSize: 9, color: c.primary, marginTop: 2 },
});
