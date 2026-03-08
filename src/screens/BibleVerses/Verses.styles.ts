import { Platform, StyleSheet } from 'react-native';
import { Spacing } from '../../theme';
import type { ColorScheme } from '../../theme/colors';

const SERIF = Platform.OS === 'ios' ? 'Georgia' : 'serif';

export function buildStyles(c: ColorScheme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    // ── Header ─────────────────────────────────────────────────────────────
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.sm,
      paddingVertical: 10,
      backgroundColor: c.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    titleBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    headerTitle: { fontSize: 16, fontWeight: '600', color: c.textPrimary, fontFamily: SERIF },

    // ── Scroll content ─────────────────────────────────────────────────────
    content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 80 },
    bookLabel: {
      fontSize: 12,
      color: c.textSecondary,
      fontFamily: SERIF,
      textAlign: 'center',
      letterSpacing: 2,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    chapterNum: {
      fontSize: 88,
      fontWeight: '800',
      color: c.textPrimary,
      fontFamily: SERIF,
      textAlign: 'center',
      lineHeight: 96,
      marginBottom: 24,
    },

    // ── Verse text ─────────────────────────────────────────────────────────
    paragraph: { fontSize: 19, fontFamily: SERIF, color: c.textPrimary, lineHeight: 35, letterSpacing: 0.15 },
    verseNum: { fontSize: 11, fontWeight: '700', color: c.primary, fontFamily: SERIF, lineHeight: 35 },
    verseNumSelected: { color: c.primary, fontWeight: '800' },
    verseText: { fontSize: 19, fontFamily: SERIF, color: c.textPrimary, lineHeight: 35 },
    verseTextSelected: {
      textDecorationLine: 'underline',
      textDecorationStyle: 'dotted',
      textDecorationColor: c.primary,
    },

    // ── Empty / error state ────────────────────────────────────────────────
    emptyWrap: { alignItems: 'center', paddingTop: 52, gap: 14 },
    emptyText: { fontSize: 16, fontWeight: '600', color: c.textSecondary, textAlign: 'center' },
    emptySub: { fontSize: 13, color: c.textSecondary, textAlign: 'center', lineHeight: 20 },
    loadingHint: { fontSize: 13, color: c.textSecondary, marginTop: 10 },
    retryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: c.primary,
      marginTop: 4,
    },
    retryBtnLabel: { fontSize: 14, fontWeight: '600', color: c.primary },

    // ── Chapter pagination bar ─────────────────────────────────────────────
    bottomBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      paddingHorizontal: Spacing.sm,
      paddingTop: 10,
    },
    bottomBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomBtnDisabled: { opacity: 0.3 },
    bottomCenter: { flex: 1, alignItems: 'center' },
    bottomLabel: { fontSize: 15, fontWeight: '700', color: c.textPrimary },

    // ── Multi-select sticky toolbar ────────────────────────────────────────
    toolbar: {
      backgroundColor: c.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      paddingHorizontal: 16,
      paddingTop: 10,
      gap: 8,
    },
    toolbarCount: {
      fontSize: 12,
      fontWeight: '600',
      color: c.primary,
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    toolbarActions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    toolBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      minWidth: 52,
    },
    toolBtnLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textPrimary,
      letterSpacing: 0.2,
    },

    // ── Color picker bottom sheet ──────────────────────────────────────────
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
    panel: {
      backgroundColor: c.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      paddingHorizontal: 20,
      paddingTop: 18,
      gap: 14,
    },
    panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    panelRef: { fontSize: 14, fontWeight: '700', color: c.primary, letterSpacing: 0.3 },
    panelSectionLabel: { fontSize: 11, fontWeight: '700', color: c.textSecondary, letterSpacing: 1.5 },
    swatchRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingBottom: 4 },
    swatch: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.15)',
    },
  });
}
