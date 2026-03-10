import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing, Radius } from '../../theme';

export const makeStyles = (c: ColorScheme) =>
  StyleSheet.create({
    safe:      { flex: 1, backgroundColor: c.background },
    container: { padding: Spacing.md, paddingBottom: Spacing.xxl },

    emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: c.textSecondary, fontSize: Typography.size.md },

    summary: {
      backgroundColor: c.surface,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      borderWidth: 1,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.07,
      shadowRadius: 4,
    },
    summaryTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Spacing.xs,
    },
    summaryTitle: {
      flex: 1,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      color: c.textPrimary,
      marginRight: Spacing.sm,
    },
    summaryPct: {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
    },
    summaryDesc: {
      fontSize: Typography.size.sm,
      color: c.textSecondary,
      lineHeight: 20,
      marginBottom: Spacing.md,
    },
    progressBarTrack: {
      height: 8,
      backgroundColor: c.border,
      borderRadius: Radius.full,
      overflow: 'hidden',
      marginBottom: Spacing.xs,
    },
    progressBarFill: {
      height: 8,
      borderRadius: Radius.full,
    },
    summarySub: {
      fontSize: Typography.size.xs,
      color: c.textMuted,
      marginTop: 2,
    },

    sectionLabel: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      color: c.textMuted,
      letterSpacing: 1.5,
      marginBottom: Spacing.sm,
      marginTop: Spacing.sm,
    },

    // Day rows
    dayRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: c.surface,
      borderRadius: Radius.md,
      padding: Spacing.md,
      marginBottom: Spacing.xs,
      gap: Spacing.md,
      borderWidth: 1,
      borderColor: c.border,
    },
    dayRowDone: {
      opacity: 0.6,
    },
    checkCircle: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    dayBody: { flex: 1 },
    dayTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginBottom: 1,
    },
    dayNumber: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      color: c.textMuted,
      letterSpacing: 0.5,
    },
    dayNumberDone: { textDecorationLine: 'line-through' },
    dayTitle: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semiBold,
      color: c.textPrimary,
      marginBottom: Spacing.xs,
    },
    dayTitleDone: { textDecorationLine: 'line-through', color: c.textMuted },
    refsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    refChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: c.surfaceAlt,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: Radius.sm,
    },
    refText: {
      fontSize: 10,
      color: c.textMuted,
      fontWeight: Typography.weight.medium,
    },
    todayBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: Radius.full,
    },
    todayBadgeText: { fontSize: 9, fontWeight: Typography.weight.bold, letterSpacing: 1 },
  });
