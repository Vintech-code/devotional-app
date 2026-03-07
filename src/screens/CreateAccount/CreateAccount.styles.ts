import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  backBtn: { marginBottom: Spacing.lg },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.extraBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    lineHeight: Typography.size.md * 1.5,
    marginBottom: Spacing.lg,
  },
  strengthWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  strengthLabel: { fontSize: Typography.size.sm, color: Colors.textMuted },
  strengthValue: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semiBold,
    color: Colors.success,
  },
  rulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  ruleItem: { flexDirection: 'row', alignItems: 'center', width: '46%' },
  ruleText: { fontSize: Typography.size.sm, color: Colors.textMuted },
  ruleTextPassed: { color: Colors.textPrimary },
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
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  termsText: { flex: 1, fontSize: Typography.size.sm, color: Colors.textPrimary },
  termsLink: { color: Colors.primary, fontWeight: Typography.weight.semiBold },
  termsNote: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.lg,
  },
  cta: { width: '100%', marginBottom: Spacing.lg },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.sm,
    letterSpacing: 1,
  },
  signInBtn: { width: '100%', marginBottom: Spacing.lg },
  secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  secureText: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
}
);