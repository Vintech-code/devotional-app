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

    // ── Admin badge ──────────────────────────────────────────────────────────
    adminBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 4,
      borderRadius: Radius.full ?? 999,
      backgroundColor: 'rgba(66,138,155,0.15)',
      borderWidth: 1,
      borderColor: c.primary,
    },
    adminBadgeText: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      color: c.primary,
      letterSpacing: 0.8,
    },

    // ── Greeting banner ────────────────────────────────────────────────────
    greetingBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      margin: Spacing.lg,
      padding: Spacing.lg,
      borderRadius: Radius.xl,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    greetingIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(66,138,155,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    greetingTitle: {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      color: c.textPrimary,
    },
    greetingSubtitle: {
      fontSize: Typography.size.sm,
      color: c.textSecondary,
      marginTop: 2,
    },

    // ── Tabs ──────────────────────────────────────────────────────────────
    tabsWrap: {
      flexDirection: 'row',
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
      backgroundColor: c.surfaceAlt,
      borderRadius: Radius.lg,
      padding: 4,
      borderWidth: 1,
      borderColor: c.border,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.md,
    },
    tabActive: { backgroundColor: c.surface },
    tabText: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.medium,
      color: c.textMuted,
    },
    tabTextActive: {
      color: c.textPrimary,
      fontWeight: Typography.weight.semiBold,
    },
    tabBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
    },
    tabBadgeText: {
      fontSize: 11,
      fontWeight: Typography.weight.bold,
      color: '#fff',
    },

    // ── Search ────────────────────────────────────────────────────────────
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.lg,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    searchInput: {
      flex: 1,
      fontSize: Typography.size.sm,
      color: c.textPrimary,
      paddingVertical: 0,
    },

    // ── Filter chips ──────────────────────────────────────────────────────
    filterRow: {
      flexDirection: 'row',
      gap: Spacing.xs,
      paddingHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
    },
    filterChip: {
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderRadius: Radius.full ?? 999,
      borderWidth: 1,
    },
    filterChipText: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.semiBold,
    },

    // ── Scroll content ────────────────────────────────────────────────────
    scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },

    // ── User card ────────────────────────────────────────────────────────
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      backgroundColor: c.surface,
      borderRadius: Radius.xl,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: c.border,
    },
    userInitialCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(66,138,155,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.primary,
    },
    userInitialText: {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      color: c.primary,
    },
    userCardBody: { flex: 1 },
    userCardName: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semiBold,
      color: c.textPrimary,
    },
    userCardEmail: {
      fontSize: Typography.size.xs,
      color: c.textSecondary,
      marginTop: 2,
    },
    userCardMeta: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginTop: 4,
    },
    userMetaTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    userMetaText: {
      fontSize: Typography.size.xs,
      color: c.textMuted,
    },
    disabledBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: Radius.sm,
      backgroundColor: 'rgba(184,90,90,0.15)',
      borderWidth: 1,
      borderColor: '#B85A5A',
    },
    disabledBadgeText: {
      fontSize: 10,
      fontWeight: Typography.weight.bold,
      color: '#B85A5A',
      letterSpacing: 0.6,
    },
    toggleWrap: { alignSelf: 'center' },

    // ── Feedback card ─────────────────────────────────────────────────────
    fbCard: {
      backgroundColor: c.surface,
      borderRadius: Radius.xl,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: c.border,
      overflow: 'hidden',
    },
    fbCardHead: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
      gap: Spacing.sm,
    },
    fbCategoryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: Radius.sm,
    },
    fbCategoryText: {
      fontSize: 10,
      fontWeight: Typography.weight.bold,
      letterSpacing: 0.8,
    },
    fbSubject: {
      flex: 1,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semiBold,
      color: c.textPrimary,
    },
    fbStatusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    fbCardBody: {
      paddingHorizontal: Spacing.md,
      paddingBottom: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    fbFrom: {
      fontSize: Typography.size.xs,
      color: c.textMuted,
      marginTop: Spacing.sm,
      marginBottom: Spacing.xs,
    },
    fbMessage: {
      fontSize: Typography.size.sm,
      color: c.textSecondary,
      lineHeight: Typography.size.sm * 1.6,
      marginBottom: Spacing.sm,
    },
    fbDate: {
      fontSize: Typography.size.xs,
      color: c.textMuted,
    },

    // ── Reply section ─────────────────────────────────────────────────────
    replySection: {
      backgroundColor: c.surfaceAlt,
      padding: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    replyExistingLabel: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      color: c.primary,
      letterSpacing: 0.8,
      marginBottom: Spacing.xs,
    },
    replyExistingText: {
      fontSize: Typography.size.sm,
      color: c.textPrimary,
      fontStyle: 'italic',
      lineHeight: Typography.size.sm * 1.6,
    },
    replyInputLabel: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      color: c.textSecondary,
      letterSpacing: 0.8,
      marginBottom: Spacing.xs,
    },
    replyInput: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: Radius.lg,
      padding: Spacing.sm,
      fontSize: Typography.size.sm,
      color: c.textPrimary,
      backgroundColor: c.surface,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    replyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: Spacing.sm,
      paddingVertical: 10,
      borderRadius: Radius.lg,
    },
    replyBtnText: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.bold,
      color: '#fff',
    },

    // ── Empty state ───────────────────────────────────────────────────────
    emptyWrap: { alignItems: 'center', paddingVertical: Spacing.xxl },
    emptyText: {
      fontSize: Typography.size.sm,
      color: c.textMuted,
      marginTop: Spacing.sm,
      textAlign: 'center',
    },

    // ── Loading / error ───────────────────────────────────────────────────
    centeredMsg: { alignItems: 'center', paddingVertical: Spacing.xl },
    centeredMsgText: {
      fontSize: Typography.size.sm,
      color: c.textMuted,
      textAlign: 'center',
      marginTop: Spacing.sm,
    },

    // ── Stats row (greeting) ──────────────────────────────────────────────
    statsRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
    },
    statPill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      backgroundColor: c.surface,
      borderRadius: Radius.lg,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderWidth: 1,
      borderColor: c.border,
    },
    statPillNum: {
      fontSize: Typography.size.xl,
      fontWeight: Typography.weight.bold,
      color: c.textPrimary,
    },
    statPillLabel: {
      fontSize: Typography.size.xs,
      color: c.textMuted,
    },
  });
