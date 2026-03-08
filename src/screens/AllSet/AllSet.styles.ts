import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing, Radius } from '../../theme';

export const makeStyles = (c: ColorScheme) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.background,
    },
    container: {
      flexGrow: 1,
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.xl,
    },

    // ── Top icon ────────────────────────────────────────────────────────────
    iconRing: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: c.surface,
      borderWidth: 3,
      borderColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.lg,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },

    // ── Headline ────────────────────────────────────────────────────────────
    headline: {
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.bold as '700',
      color: c.textPrimary,
      textAlign: 'center',
      marginBottom: Spacing.xs,
    },
    nameText: {
      fontSize: Typography.size.xl,
      fontWeight: Typography.weight.semiBold as '600',
      color: c.primary,
      textAlign: 'center',
      marginBottom: Spacing.md,
    },
    subtitle: {
      fontSize: Typography.size.md,
      color: c.textSecondary,
      textAlign: 'center',
      lineHeight: Typography.size.md * 1.65,
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.md,
    },

    // ── Feature list ────────────────────────────────────────────────────────
    featureList: {
      width: '100%',
      gap: Spacing.sm,
      marginBottom: Spacing.xl,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: Radius.md,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      gap: Spacing.sm,
      borderWidth: 1,
      borderColor: c.border,
    },
    featureText: {
      flex: 1,
      fontSize: Typography.size.sm,
      color: c.textPrimary,
      lineHeight: Typography.size.sm * 1.5,
    },

    // ── Verse callout ───────────────────────────────────────────────────────
    verseCard: {
      width: '100%',
      backgroundColor: c.surface,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: c.primary,
      marginBottom: Spacing.xl,
    },
    verseText: {
      fontSize: Typography.size.md,
      fontStyle: 'italic',
      color: c.textSecondary,
      lineHeight: Typography.size.md * 1.6,
      marginBottom: Spacing.xs,
    },
    verseRef: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semiBold as '600',
      color: c.primary,
    },

    // ── CTA ─────────────────────────────────────────────────────────────────
    spacer: { flex: 1 },
    cta: {
      width: '100%',
      marginTop: Spacing.md,
    },
  });
