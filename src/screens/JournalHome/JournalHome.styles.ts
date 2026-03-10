import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing, Radius } from '../../theme';

export const makeStyles = (c: ColorScheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  container: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // ── Prefill Banner ───────────────────────────────────────────────────────────
  prefillBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: c.surface,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: c.borderFocus,
  },
  prefillRef: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: c.primary,
    flexShrink: 1,
  },
  prefillHint: {
    fontSize: Typography.size.xs,
    color: c.textMuted,
  },

  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  dateLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: c.textMuted,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heading: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extraBold,
    color: c.textPrimary,
    marginBottom: 2,
  },
  greeting: {
    fontSize: Typography.size.sm,
    color: c.textSecondary,
  },
  streakBox: {
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 70,
  },
  streakFire: { fontSize: 22 },
  streakNum: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: c.accent,
    lineHeight: 28,
  },
  streakCaption: {
    fontSize: Typography.size.xs,
    color: c.textMuted,
    marginTop: 1,
  },

  // ── Stats row ───────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: Radius.md,
    paddingVertical: 10,
  },
  statChipNum: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: c.textPrimary,
  },
  statChipLabel: {
    fontSize: Typography.size.xs,
    color: c.textMuted,
    marginTop: 2,
  },

  // ── Section label ─────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: c.textMuted,
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },

  // ── Image Method Cards ────────────────────────────────────────────────
  imageCardWrap: {
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  imageCard: {
    height: 160,
  },
  imageCardImg: {
    borderRadius: Radius.lg,
  },
  imageCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingBottom: 14,
    gap: 4,
  },
  imageCardTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.extraBold,
    color: '#FFFFFF',
  },
  imageCardSteps: {
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.70)',
    letterSpacing: 0.3,
  },
  imageCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  imageCardDurationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  imageCardDuration: {
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.70)',
    fontWeight: Typography.weight.medium,
  },
  imageCardBegin: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.5,
  },

  // ── Recent Entries ───────────────────────────────────────────────────────
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: c.surface,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  recentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  methodTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  methodTagText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 0.5,
  },
  recentLabel: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: c.textSecondary,
  },

  // ── Prayer Journal card ──────────────────────────────────────────────
  prayerCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  prayerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: '#A855F722',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  prayerTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semiBold,
    color: c.textPrimary,
    marginBottom: 2,
  },
  prayerSub: {
    fontSize: Typography.size.xs,
    color: c.textMuted,
  },
});
