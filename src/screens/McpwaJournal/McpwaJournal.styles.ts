import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing } from '../../theme';

export const makeStyles = (c: ColorScheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  container: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  pageTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: c.textPrimary,
    marginBottom: 4,
  },
  pageDate: { fontSize: Typography.size.sm, color: c.textMuted, marginBottom: Spacing.xs },
  methodLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: c.textMuted,
    letterSpacing: 1.5,
    marginBottom: Spacing.lg,
  },
  btn: { width: '100%' },
  footer: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: c.textMuted,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
}
);