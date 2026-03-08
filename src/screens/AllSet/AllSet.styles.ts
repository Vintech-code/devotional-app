import { Dimensions, StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing, Radius } from '../../theme';

const { width: W } = Dimensions.get('window');

// Number of slides — keep in sync with SLIDES array in AllSetScreen.tsx
export const SLIDE_COUNT = 3;

export const makeStyles = (c: ColorScheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },

    // ── Top bar ─────────────────────────────────────────────────────────────
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      height: 52,
    },
    nameTag: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semiBold,
      color: c.primary,
    },
    skipLabel: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semiBold,
      color: c.textSecondary,
    },

    // ── Horizontal slide rail ────────────────────────────────────────────────
    railClip: {
      flex: 1,
      overflow: 'hidden',
    },
    rail: {
      flexDirection: 'row',
      width: W * SLIDE_COUNT,
    },
    slide: {
      width: W,
      alignItems: 'center',
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.sm,
    },

    // ── Lottie container ─────────────────────────────────────────────────────
    lottie: {
      width: W * 0.70,
      height: W * 0.70,
    },

    // ── Slide text ───────────────────────────────────────────────────────────
    slideTitle: {
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.bold,
      color: c.textPrimary,
      textAlign: 'center',
      marginTop: Spacing.sm,
      marginBottom: 6,
    },
    greetingText: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semiBold,
      color: c.primary,
      textAlign: 'center',
      marginBottom: Spacing.xs,
    },
    slideSub: {
      fontSize: Typography.size.md,
      color: c.textSecondary,
      textAlign: 'center',
      lineHeight: Typography.size.md * 1.65,
      paddingHorizontal: Spacing.xs,
    },

    // ── Verse card (last slide only) ──────────────────────────────────────────
    verseCard: {
      marginTop: Spacing.lg,
      backgroundColor: c.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      width: '100%',
      borderWidth: 1,
      borderColor: c.border,
    },
    verseText: {
      fontSize: Typography.size.sm,
      fontStyle: 'italic',
      color: c.textSecondary,
      textAlign: 'center',
      lineHeight: Typography.size.sm * 1.7,
      marginBottom: Spacing.xs,
    },
    verseRef: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.semiBold,
      color: c.primary,
      textAlign: 'right',
    },

    // ── Page dot indicator ───────────────────────────────────────────────────
    dotsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: Spacing.md,
    },
    dot: {
      height: 8,
      borderRadius: 4,
    },
    dotActive:   { backgroundColor: c.primary },
    dotInactive: { backgroundColor: c.border },

    // ── CTA ──────────────────────────────────────────────────────────────────
    ctaWrap: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
    },
    // ── Celebration notification card ─────────────────────────────────
    celebNotif: {
      position: 'absolute',
      top: Spacing.md,
      left: Spacing.lg,
      right: Spacing.lg,
      backgroundColor: c.surface,
      borderRadius: Radius.xl,
      padding: Spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.28,
      shadowRadius: 18,
      elevation: 14,
      borderWidth: 1,
      borderColor: c.border,
    },
    celebGlow: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: 'rgba(66,138,155,0.14)',
      borderWidth: 1,
      borderColor: 'rgba(66,138,155,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    celebEmoji: {
      fontSize: 26,
    },
    celebBody: { flex: 1 },
    celebTitle: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.bold,
      color: c.textPrimary,
      letterSpacing: 0.2,
    },
    celebSub: {
      fontSize: Typography.size.xs,
      color: c.textSecondary,
      marginTop: 3,
      lineHeight: Typography.size.xs * 1.5,
    },
    celebDismiss: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },  });
