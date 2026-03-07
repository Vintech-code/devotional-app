import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing, Radius } from '../../theme';

export const makeStyles = (c: ColorScheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },

  // Consistency
  consistencyPanel: {
    backgroundColor: c.surface,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  consistencyTitle: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: c.textMuted,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  statBadgeValue: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: c.textPrimary,
  },
  statBadgeLabel: {
    fontSize: 9,
    fontWeight: Typography.weight.bold,
    color: c.textMuted,
    letterSpacing: 0.5,
  },

  // Day grid
  dayGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: { alignItems: 'center', flex: 1 },
  dayChar: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: c.textMuted,
    marginBottom: 4,
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: c.border,
  },
  dayDotDone: { backgroundColor: c.primary, borderColor: c.primary },
  dayDotToday: { borderColor: c.primary, borderWidth: 2 },
  // Entries
  entriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 4,
  },
  sectionLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: c.textMuted,
    letterSpacing: 1.5,
  },
  entryCount: { fontSize: Typography.size.sm, color: c.textMuted },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: Radius.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: c.border,
  },
  searchInput: { flex: 1, fontSize: Typography.size.md, color: c.textPrimary },

  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  entryCard: {
    backgroundColor: c.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  entryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  entryMetaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  deleteBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surfaceAlt,
  },
  entryDate: { fontSize: Typography.size.xs, color: c.textMuted },
  typeBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  typeText: {
    fontSize: 10,
    fontWeight: Typography.weight.bold,
    color: '#fff',
    letterSpacing: 0.5,
  },
  entryTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semiBold,
    color: c.textPrimary,
    marginBottom: 4,
  },
  entryExcerpt: {
    fontSize: Typography.size.sm,
    color: c.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag: {
    backgroundColor: c.surfaceAlt,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  tagText: { fontSize: 10, color: c.textMuted, fontWeight: Typography.weight.medium },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: c.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: { fontSize: Typography.size.md, color: c.textSecondary, textAlign: 'center' },
  typeFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  typeChip: {
    height: 32,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeChipActive: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  typeChipText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: c.textSecondary,
    letterSpacing: 0.5,
  },
  typeChipTextActive: {
    color: c.textOnPrimary,
  },
}
);