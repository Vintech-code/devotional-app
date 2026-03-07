import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing, Radius } from '../../theme';

export const makeStyles = (c: ColorScheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: c.surface,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  greetingLabel: {
    fontSize: Typography.size.md,
    color: c.textSecondary,
  },
  greetingName: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: c.textPrimary,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  sectionLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: c.textMuted,
    letterSpacing: 1.5,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },

  // Mission card
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.primary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: c.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  missionLeft: { flex: 1 },
  missionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: c.textOnPrimary,
    marginBottom: 2,
  },
  missionSub: {
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.75)',
  },
  missionArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Guided methods
  methodsRow: {
    paddingRight: Spacing.md,
    gap: Spacing.md,
  },
  methodItem: {
    alignItems: 'center',
    width: 60,
  },
  methodCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    borderWidth: 2,
    borderColor: c.border,
  },
  methodCircleActive: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  methodLabel: {
    fontSize: 10,
    fontWeight: Typography.weight.bold,
    color: c.textMuted,
    letterSpacing: 0.5,
  },
  methodLabelActive: { color: c.primary },

  // Verse card
  verseCard: {
    backgroundColor: c.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: c.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  verseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  breadTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: c.accent,
    letterSpacing: 0.5,
  },
  breadDate: { fontSize: Typography.size.xs, color: c.textMuted },
  verseText: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamilySerif,
    color: c.textPrimary,
    lineHeight: 28,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  verseRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verseRef: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semiBold,
    color: c.primary,
  },

  // Progress
  progressCard: {
    flexDirection: 'row',
    backgroundColor: c.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  progressItem: { flex: 1, alignItems: 'center' },
  progressNum: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: c.textPrimary,
  },
  progressLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: c.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
  progressDivider: {
    width: 1,
    backgroundColor: c.border,
    marginVertical: Spacing.xs,
  },

  // Next session
  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  nextIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  nextBody: { flex: 1 },
  nextTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semiBold,
    color: c.textPrimary,
  },
  nextSub: {
    fontSize: Typography.size.sm,
    color: c.textSecondary,
    marginTop: 2,
  },
}
);