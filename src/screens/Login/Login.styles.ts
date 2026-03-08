import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing, Radius } from '../../theme';

export const makeStyles = (c: ColorScheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  logoWrap: { alignItems: 'center', marginBottom: Spacing.lg, marginTop: Spacing.md },
  logo: {
    width: 180,
    height: 90,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.extraBold,
    color: c.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.size.md,
    color: c.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.md,
  },
  rememberLeft: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  checkboxActive: { backgroundColor: c.primary, borderColor: c.primary },
  rememberText: { fontSize: Typography.size.sm, color: c.textSecondary },
  forgotText: {
    fontSize: Typography.size.sm,
    color: c.primary,
    fontWeight: Typography.weight.semiBold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: c.border },
  dividerText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: c.textMuted,
    letterSpacing: 1.2,
    marginHorizontal: Spacing.sm,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.surface,
    marginBottom: Spacing.md,
  },
  googleText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semiBold,
    color: c.textPrimary,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  secureText: { fontSize: Typography.size.sm, color: c.textMuted },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerText: { fontSize: Typography.size.md, color: c.textSecondary },
  registerLink: {
    fontSize: Typography.size.md,
    color: c.primary,
    fontWeight: Typography.weight.semiBold,
  },
});