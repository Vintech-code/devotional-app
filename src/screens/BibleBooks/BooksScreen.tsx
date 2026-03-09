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
  TextInput, ActivityIndicator, SectionList,
  Modal, FlatList, Pressable,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useColors } from '../../theme';
import {
  getBooks,
  downloadTranslation,
  getTranslationDownloadInfo,
  type DownloadProgress,
} from '../../services/bibleService';
import { BIBLE_TRANSLATIONS, getTranslationById } from '../../data/bibleTranslations';
import { useAppStore } from '../../store/useAppStore';
import type { BibleBook } from '../../types/bible';
import type { BibleStackParamList } from '../../navigation/types';
import { makeStyles } from './Books.styles';

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

  // ── Offline download state ────────────────────────────────────────────────
  const [isComplete,    setIsComplete]    = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [dlProgress,    setDlProgress]    = useState<DownloadProgress | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  // Check download status whenever the active translation changes
  useEffect(() => {
    setIsComplete(false);
    setDlProgress(null);
    getTranslationDownloadInfo(bibleTranslation)
      .then((info) => setIsComplete(info.isComplete))
      .catch(() => { /* non-fatal */ });
  }, [bibleTranslation]);

  const handleDownload = useCallback(() => {
    if (isDownloading) return;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsDownloading(true);
    setDlProgress({ done: 0, total: 1189, percent: 0, currentBook: '' });
    downloadTranslation(
      bibleTranslation,
      (p) => setDlProgress(p),
      ctrl.signal,
    )
      .then(() => {
        if (!ctrl.signal.aborted) setIsComplete(true);
      })
      .catch(() => { /* handled inside service */ })
      .finally(() => { setIsDownloading(false); abortRef.current = null; });
  }, [bibleTranslation, isDownloading]);

  const handleCancelDownload = useCallback(() => {
    abortRef.current?.abort();
  }, []);

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

      {/* Offline download banner */}
      {!isComplete && !isDownloading && (
        <View style={styles.offlineBanner}>
          <Icon source="cloud-download-outline" size={18} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.offlineBannerTitle}>Download for Offline</Text>
            <Text style={styles.offlineBannerSub}>
              Save the entire {activeTrans?.shortName ?? bibleTranslation.toUpperCase()} Bible to your device.
            </Text>
          </View>
          <TouchableOpacity style={styles.offlineBtn} onPress={handleDownload} activeOpacity={0.8}>
            <Text style={styles.offlineBtnText}>Download</Text>
          </TouchableOpacity>
        </View>
      )}
      {isDownloading && dlProgress && (
        <View style={styles.offlineBanner}>
          <Icon source="cloud-sync-outline" size={18} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.offlineBannerTitle}>
              Downloading… {dlProgress.percent}%
            </Text>
            <View style={styles.offlineBar}>
              <View style={[styles.offlineBarFill, { width: `${dlProgress.percent}%` as `${number}%` }]} />
            </View>
            <Text style={styles.offlineBannerSub} numberOfLines={1}>
              {dlProgress.currentBook}
            </Text>
          </View>
          <TouchableOpacity style={styles.offlineCancelBtn} onPress={handleCancelDownload} activeOpacity={0.8}>
            <Icon source="close" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}
      {isComplete && (
        <View style={[styles.offlineBanner, styles.offlineBannerDone]}>
          <Icon source="check-circle-outline" size={18} color={colors.success} />
          <Text style={[styles.offlineBannerTitle, { color: colors.success }]}>
            Available offline · {activeTrans?.shortName ?? bibleTranslation.toUpperCase()}
          </Text>
        </View>
      )}

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

