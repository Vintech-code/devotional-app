import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing, Radius } from '../../theme';

export const makeStyles = (c: ColorScheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  container: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  sermonTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sermonNew: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: c.textPrimary,
  },
  clearBtn: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  clearText: { fontSize: Typography.size.sm, color: c.textSecondary },
  fieldLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: c.textMuted,
    letterSpacing: 1.2,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  metaCard: {
    backgroundColor: c.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  metaLabel: {
    fontSize: Typography.size.xs,
    color: c.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  metaInput: { marginBottom: 0 },
  metaValue: { fontSize: Typography.size.md, color: c.textPrimary },
  dividerLine: { height: 1, backgroundColor: c.border },
  charCount: {
    fontSize: Typography.size.xs,
    color: c.textMuted,
    textAlign: 'right',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    letterSpacing: 1,
  },
  customTagBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: c.border,
    borderRadius: Radius.full,
    borderStyle: 'dashed',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  customTagText: { fontSize: Typography.size.sm, color: c.textSecondary },
  saveBtn: { width: '100%' },
}
);