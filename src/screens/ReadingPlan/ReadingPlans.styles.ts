import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing, Radius } from '../../theme';

export const makeStyles = (c: ColorScheme) =>
  StyleSheet.create({
    safe:      { flex: 1, backgroundColor: c.background },
    container: { padding: Spacing.md, paddingBottom: Spacing.xxl },

    sectionLabel: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      color: c.textMuted,
      letterSpacing: 1.5,
      marginBottom: Spacing.sm,
      marginTop: Spacing.md,
    },

    // Active plan banner
    activeBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      gap: Spacing.md,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.07,
      shadowRadius: 4,
    },
    activeIconWrap: {
      width: 52,
      height: 52,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeBody: { flex: 1 },
    activeTitle: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semiBold,
      color: c.textPrimary,
      marginBottom: 6,
    },
    activeSub: {
      fontSize: Typography.size.xs,
      color: c.textMuted,
      marginTop: 4,
    },
    progressBarTrack: {
      height: 6,
      backgroundColor: c.border,
      borderRadius: Radius.full,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: 6,
      borderRadius: Radius.full,
    },

    // Plan cards
    planCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      gap: Spacing.md,
      borderWidth: 1,
      borderColor: c.border,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    planIconWrap: {
      width: 48,
      height: 48,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    planBody:     { flex: 1 },
    planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 2 },
    planTitle: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semiBold,
      color: c.textPrimary,
      flexShrink: 1,
    },
    activeBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: Radius.full,
    },
    activeBadgeText: { fontSize: 9, fontWeight: Typography.weight.bold, letterSpacing: 1 },
    planDesc: {
      fontSize: Typography.size.sm,
      color: c.textSecondary,
      marginBottom: 2,
      lineHeight: 18,
    },
    planDays: {
      fontSize: Typography.size.xs,
      color: c.textMuted,
      fontWeight: Typography.weight.medium,
    },
  });
