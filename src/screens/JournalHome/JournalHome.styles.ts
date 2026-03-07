import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing, Radius } from '../../theme';

export const makeStyles = (c: ColorScheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: c.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.size.md,
    color: c.textSecondary,
    marginBottom: Spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardBody: { flex: 1 },
  cardTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: c.textPrimary,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: Typography.size.sm,
    color: c.textSecondary,
  },
  statsCard: {
    backgroundColor: c.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  statsTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semiBold,
    color: c.textMuted,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  statsRow: { flexDirection: 'row', gap: Spacing.xl },
  statItem: {},
  statNum: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: c.primary,
  },
  statLabel: {
    fontSize: Typography.size.xs,
    color: c.textMuted,
    marginTop: 2,
  },
}
);