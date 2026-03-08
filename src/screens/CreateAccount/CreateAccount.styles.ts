import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing, Radius } from '../../theme';

export const makeStyles = (c: ColorScheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  container: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.xxl },

  backBtn: { marginBottom: Spacing.xl },

  // ── Header ──────────────────────────────────────────────────────────────
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: c.surfaceAlt,
    borderRadius: Radius.full,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    gap: 5,
    marginBottom: Spacing.sm,
  },
  headerBadgeText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semiBold,
    color: c.primary,
    letterSpacing: 1,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extraBold,
    color: c.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.size.md,
    color: c.textSecondary,
    lineHeight: Typography.size.md * 1.55,
    marginBottom: Spacing.xl,
  },

  // ── Strength bar ─────────────────────────────────────────────────────────
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.md,
  },
  strengthTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: c.border,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semiBold,
    minWidth: 44,
    textAlign: 'right',
  },

  // ── Terms ────────────────────────────────────────────────────────────────
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: c.primary, borderColor: c.primary },
  termsText: { flex: 1, fontSize: Typography.size.sm, color: c.textSecondary, lineHeight: 20 },
  termsLink: { color: c.primary, fontWeight: Typography.weight.semiBold },

  // ── Error ────────────────────────────────────────────────────────────────
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: c.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: { flex: 1, fontSize: Typography.size.sm, color: c.error },

  // ── CTA ──────────────────────────────────────────────────────────────────
  cta: { width: '100%', marginBottom: Spacing.xl },

  // ── Divider ──────────────────────────────────────────────────────────────
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: c.border },
  dividerText: { fontSize: Typography.size.xs, color: c.textMuted },

  signInBtn: { width: '100%' },
});
