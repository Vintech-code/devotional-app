import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing, Radius } from '../../theme';

export const makeStyles = (c: ColorScheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },

    // ── Header ──────────────────────────────────────────────────────────────
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      backgroundColor: c.surface,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surfaceAlt,
      marginRight: Spacing.sm,
    },
    headerTitle: {
      flex: 1,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.semiBold,
      color: c.textPrimary,
    },

    // ── Scroll content ─────────────────────────────────────────────────────
    scroll: { padding: Spacing.lg },

    // ── Hero section ────────────────────────────────────────────────────────
    heroWrap: { alignItems: 'center', marginBottom: Spacing.xl },
    heroIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: c.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: c.border,
    },
    heroTitle: {
      fontSize: Typography.size.xl,
      fontWeight: Typography.weight.bold,
      color: c.textPrimary,
      marginBottom: Spacing.xs,
    },
    heroSubtitle: {
      fontSize: Typography.size.sm,
      color: c.textSecondary,
      textAlign: 'center',
      lineHeight: Typography.size.sm * 1.6,
    },

    // ── Form card ──────────────────────────────────────────────────────────
    card: {
      backgroundColor: c.surface,
      borderRadius: Radius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    sectionLabel: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      color: c.textMuted,
      letterSpacing: 1.4,
      marginBottom: Spacing.sm,
    },

    // ── Category chips ─────────────────────────────────────────────────────
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.xs,
      marginBottom: Spacing.md,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs + 2,
      borderRadius: Radius.full ?? 999,
      borderWidth: 1,
    },
    chipText: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.medium,
    },

    // ── Inputs ────────────────────────────────────────────────────────────
    inputLabel: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.semiBold,
      color: c.textMuted,
      letterSpacing: 1,
      marginBottom: Spacing.xs,
      marginTop: Spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: Radius.lg,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm + 2,
      fontSize: Typography.size.md,
      color: c.textPrimary,
      backgroundColor: c.surfaceAlt,
    },
    inputFocused: {
      borderColor: c.borderFocus,
    },
    textarea: {
      minHeight: 120,
      textAlignVertical: 'top',
      paddingTop: Spacing.sm + 2,
    },
    charCount: {
      alignSelf: 'flex-end',
      fontSize: Typography.size.xs,
      color: c.textMuted,
      marginTop: 4,
    },

    // ── Submit button ─────────────────────────────────────────────────────
    submitBtn: {
      height: 52,
      borderRadius: Radius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: Spacing.md,
    },
    submitBtnText: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.bold,
      color: '#fff',
    },

    // ── Success banner ────────────────────────────────────────────────────
    successBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      backgroundColor: c.successSurface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: c.success,
    },
    successText: {
      flex: 1,
      fontSize: Typography.size.sm,
      color: c.success,
      fontWeight: Typography.weight.medium,
    },

    // ── Divider ───────────────────────────────────────────────────────────
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: Spacing.lg,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: c.border },
    dividerLabel: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      color: c.textMuted,
      letterSpacing: 1.2,
      marginHorizontal: Spacing.sm,
    },

    // ── Feedback history cards ─────────────────────────────────────────────
    fbCard: {
      backgroundColor: c.surface,
      borderRadius: Radius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: c.border,
    },
    fbCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
      gap: Spacing.sm,
    },
    fbCategoryBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: Radius.sm,
    },
    fbCategoryText: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      letterSpacing: 0.8,
    },
    fbStatusBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 3,
      borderRadius: Radius.sm,
      marginLeft: 'auto',
    },
    fbStatusText: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      letterSpacing: 0.8,
    },
    fbSubject: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semiBold,
      color: c.textPrimary,
      marginBottom: 4,
    },
    fbMessage: {
      fontSize: Typography.size.sm,
      color: c.textSecondary,
      lineHeight: Typography.size.sm * 1.6,
    },
    fbDate: {
      fontSize: Typography.size.xs,
      color: c.textMuted,
      marginTop: Spacing.sm,
    },
    fbReplyWrap: {
      marginTop: Spacing.md,
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    fbReplyLabel: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      color: c.primary,
      letterSpacing: 0.8,
      marginBottom: Spacing.xs,
    },
    fbReplyText: {
      fontSize: Typography.size.sm,
      color: c.textPrimary,
      lineHeight: Typography.size.sm * 1.6,
      fontStyle: 'italic',
    },

    // ── Empty state ────────────────────────────────────────────────────────
    emptyWrap: { alignItems: 'center', paddingVertical: Spacing.xl },
    emptyText: {
      fontSize: Typography.size.sm,
      color: c.textMuted,
      marginTop: Spacing.sm,
      textAlign: 'center',
    },

    // ── Offline note ──────────────────────────────────────────────────────
    offlineNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      padding: Spacing.md,
      borderRadius: Radius.lg,
      backgroundColor: c.surfaceAlt,
      marginBottom: Spacing.md,
   },
   offlineNoteText: {
     flex: 1,
     fontSize: Typography.size.xs,
     color: c.textSecondary,
   },
  });
