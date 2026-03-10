import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing, Radius } from '../../theme';

export const makeStyles = (c: ColorScheme) =>
  StyleSheet.create({
    safe:      { flex: 1, backgroundColor: c.background },
    container: { padding: Spacing.md, paddingBottom: 100 },

    // Stats
    statsRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    statCard: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: Radius.md,
      paddingVertical: Spacing.md,
      borderWidth: 1,
      gap: 4,
    },
    statNum:   { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: c.textPrimary },
    statLabel: { fontSize: 9, fontWeight: Typography.weight.bold, color: c.textMuted, letterSpacing: 0.8, textAlign: 'center' },

    // Section
    sectionLabel: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      color: c.textMuted,
      letterSpacing: 1.5,
      marginBottom: Spacing.sm,
      marginTop: Spacing.md,
    },

    // Empty
    emptyWrap:  { alignItems: 'center', paddingTop: 64, paddingHorizontal: 32, gap: 12 },
    emptyTitle: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: c.textSecondary },
    emptySub:   { fontSize: Typography.size.sm, color: c.textMuted, textAlign: 'center', lineHeight: 20 },

    // Card
    card: {
      flexDirection: 'row',
      backgroundColor: c.surface,
      borderRadius: Radius.lg,
      marginBottom: Spacing.sm,
      overflow: 'hidden',
    },
    cardAnswered: { opacity: 0.9 },
    statusBar:    { width: 4 },
    cardBody:     { flex: 1, padding: Spacing.md },
    cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    cardTitle:    { flex: 1, fontSize: Typography.size.md, fontWeight: Typography.weight.semiBold, color: c.textPrimary, marginRight: Spacing.sm },
    cardDesc:     { fontSize: Typography.size.sm, color: c.textSecondary, marginBottom: 6, lineHeight: 18 },
    cardFooter:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
    cardDate:     { fontSize: Typography.size.xs, color: c.textMuted },
    answeredDate: { fontSize: Typography.size.xs, color: '#10B981', fontWeight: Typography.weight.medium },
    refRow:       { flexDirection: 'row', alignItems: 'center', gap: 4 },
    refText:      { fontSize: Typography.size.xs, color: c.primary },
    badge: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
    },
    badgeText:  { fontSize: 10, fontWeight: Typography.weight.bold },
    deleteBtn:  { padding: Spacing.md, justifyContent: 'center' },

    // FAB
    fab: {
      position: 'absolute', bottom: 28, right: 24,
      width: 56, height: 56, borderRadius: 28,
      alignItems: 'center', justifyContent: 'center',
      elevation: 6,
      shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3, shadowRadius: 4,
    },

    // Modal
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    sheet: {
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      padding: Spacing.lg, paddingBottom: 40, maxHeight: '90%',
    },
    handle:     { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
    sheetTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: c.textPrimary, marginBottom: Spacing.md },

    fieldLabel: {
      fontSize: Typography.size.xs, fontWeight: Typography.weight.bold,
      color: c.textMuted, letterSpacing: 1.5,
      marginBottom: 6, marginTop: Spacing.sm,
    },
    input: {
      borderWidth: 1, borderRadius: Radius.md,
      paddingHorizontal: Spacing.md, paddingVertical: 10,
      fontSize: Typography.size.md,
    },
    inputMulti: { minHeight: 90 },

    statusRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md, flexWrap: 'wrap' },
    statusPill: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 14, paddingVertical: 8,
      borderRadius: 20, borderWidth: 1.5,
    },
    pillText: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold },

    sheetBtns: { flexDirection: 'row', gap: 10, marginTop: Spacing.md },
    cancelBtn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    cancelTxt: { fontSize: Typography.size.md, fontWeight: Typography.weight.medium },
    saveBtn:   { flex: 2, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    saveTxt:   { fontSize: Typography.size.md, fontWeight: Typography.weight.bold },
  });
