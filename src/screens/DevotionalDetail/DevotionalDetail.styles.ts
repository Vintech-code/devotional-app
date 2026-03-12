import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing, Radius } from '../../theme';

export const makeStyles = (c: ColorScheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  typeBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  typeText: {
    fontSize: 10,
    fontWeight: Typography.weight.bold,
    color: '#fff',
    letterSpacing: 0.5,
  },
  entryDate: {
    fontSize: Typography.size.sm,
    color: c.textMuted,
    flex: 1,
  },

  titleText: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: c.textPrimary,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamilySerif,
    lineHeight: 30,
  },

  section: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: c.primary,
    letterSpacing: 1.5,
    marginBottom: Spacing.xs,
  },
  sectionContent: {
    fontSize: Typography.size.md,
    color: c.textPrimary,
    lineHeight: 24,
    backgroundColor: c.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  verseContent: {
    fontSize: Typography.size.md,
    color: c.textPrimary,
    lineHeight: 26,
    backgroundColor: c.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontFamily: Typography.fontFamilySerif,
    fontStyle: 'italic',
  },

  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  tag: {
    backgroundColor: c.surfaceAlt,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  tagText: { fontSize: 10, color: c.textMuted, fontWeight: Typography.weight.medium },

  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  shareBtnText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: c.textOnPrimary,
  },

  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  notFoundText: {
    fontSize: Typography.size.md,
    color: c.textSecondary,
    textAlign: 'center',
  },

  /* ─── inline edit ─── */
  editInput: {
    borderWidth: 1.5,
    borderColor: c.primary,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    textAlignVertical: 'top',
    color: c.textPrimary,
    fontSize: Typography.size.md,
    backgroundColor: c.surface,
    marginBottom: Spacing.xs,
  },
  editBtnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  cancelEditBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelEditText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semiBold,
    color: c.textSecondary,
  },
  saveEditBtn: {
    flex: 2,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveEditText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: c.textOnPrimary,
  },
});
