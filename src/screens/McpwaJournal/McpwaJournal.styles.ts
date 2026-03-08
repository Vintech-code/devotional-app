import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing, Radius } from '../../theme';

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
  // ── Per-section scripture reference badge (M, C, P, W auto-filled from main scripture) ─
  sectionScripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: c.surfaceAlt,
    borderRadius: Radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: Spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: c.primary,
  },
  sectionScripText: {
    flex: 1,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semiBold,
    color: c.primary,
    fontStyle: 'italic',
  },
}
);