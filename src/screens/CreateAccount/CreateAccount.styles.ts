import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing } from '../../theme';

export const makeStyles = (c: ColorScheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  backBtn: { marginBottom: Spacing.lg },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.extraBold,
    color: c.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.size.md,
    color: c.textSecondary,
    lineHeight: Typography.size.md * 1.5,
    marginBottom: Spacing.lg,
  },
  strengthWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  strengthLabel: { fontSize: Typography.size.sm, color: c.textMuted },
  strengthValue: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semiBold,
    color: c.success,
  },
  rulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  ruleItem: { flexDirection: 'row', alignItems: 'center', width: '46%' },
  ruleText: { fontSize: Typography.size.sm, color: c.textMuted },
  ruleTextPassed: { color: c.textPrimary },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  checkboxActive: { backgroundColor: c.primary, borderColor: c.primary },
  termsText: { flex: 1, fontSize: Typography.size.sm, color: c.textPrimary },
  termsLink: { color: c.primary, fontWeight: Typography.weight.semiBold },
  termsNote: {
    fontSize: Typography.size.xs,
    color: c.textMuted,
    marginBottom: Spacing.lg,
  },
  cta: { width: '100%', marginBottom: Spacing.lg },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: c.border },
  dividerText: {
    fontSize: Typography.size.xs,
    color: c.textMuted,
    paddingHorizontal: Spacing.sm,
    letterSpacing: 1,
  },
  signInBtn: { width: '100%', marginBottom: Spacing.lg },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  secureText: {
    fontSize: Typography.size.xs,
    color: c.textMuted,
    letterSpacing: 1,
  },
}
);