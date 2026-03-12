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
    paddingVertical: Spacing.sm,
    backgroundColor: c.surface,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  headerLogo: {
    width: 44,
    height: 44,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellWrapper: {
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: c.surface,
  },
  bellBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800' as const,
    lineHeight: 13,
  },

  // Notification drawer (bottom sheet modal)
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    backgroundColor: c.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.sm,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: c.border,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  drawerTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: c.textPrimary,
    marginBottom: Spacing.md,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: c.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  notifIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: { flex: 1 },
  notifTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semiBold,
    color: c.textPrimary,
    marginBottom: 4,
  },
  notifDesc: {
    fontSize: Typography.size.sm,
    color: c.textSecondary,
    lineHeight: 20,
  },
  drawerActions: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  startBtn: {
    backgroundColor: c.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
  },
  startBtnText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: c.textOnPrimary,
    letterSpacing: 0.3,
  },
  remindBtn: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
    backgroundColor: c.surfaceAlt,
  },
  remindBtnText: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semiBold,
    color: c.textSecondary,
  },

  container: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  // Greeting
  greetingRow: {
    marginBottom: Spacing.sm,
  },
  greetingText: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semiBold,
    color: c.textSecondary,
  },
  greetingName: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: c.textPrimary,
  },

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

  // Guided methods — badge images
  methodsRow: {
    paddingRight: Spacing.md,
    gap: Spacing.sm,
  },
  methodItem: {
    alignItems: 'center',
    width: 60,
  },
  methodBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: Spacing.xs,
    opacity: 0.65,
  },
  methodBadgeActive: {
    opacity: 1,
    shadowColor: c.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  methodLabel: {
    fontSize: 10,
    fontWeight: Typography.weight.bold,
    color: c.textMuted,
    letterSpacing: 0.5,
  },
  methodLabelActive: { color: c.primary },

  // Verse card (image background)
  verseSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  customizeIconBtn: {
    marginLeft: Spacing.sm,
    padding: 2,
  },
  verseCard: {
    height: 220,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  verseCardImg: {
    borderRadius: Radius.lg,
  },
  verseCardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.60)',
    padding: Spacing.md,
    justifyContent: 'space-between',
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
    color: '#F0C060',   // warm gold — always visible on dark overlay
    letterSpacing: 0.5,
  },
  breadDate: { fontSize: Typography.size.xs, color: 'rgba(255,255,255,0.65)' },
  verseText: {
    fontSize: Typography.size.md,
    fontFamily: Typography.fontFamilySerif,
    color: '#F5F5F5',   // always white — overlay is always dark
    lineHeight: 28,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  verseRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verseRefRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  verseExplore: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semiBold,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
  },
  verseRef: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semiBold,
    color: '#5CD6D4',   // always light teal — visible on dark overlay in both themes
  },
  verseRefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verseBibleVersion: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.5,
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

  // Reading Plan card
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: c.border,
  },
  planBody: { flex: 1 },
  planTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semiBold,
    color: c.textPrimary,
    marginBottom: 4,
  },
  planSub: {
    fontSize: Typography.size.xs,
    color: c.textMuted,
  },
  planBarTrack: {
    height: 5,
    backgroundColor: c.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  planBarFill: {
    height: 5,
    borderRadius: Radius.full,
    backgroundColor: c.primary,
  },
}
);