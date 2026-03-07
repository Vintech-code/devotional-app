import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing } from '../../theme';

export const makeStyles = (c: ColorScheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  container: { padding: Spacing.md, paddingBottom: 100 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  pageTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: c.textPrimary,
  },
  pageDate: { fontSize: Typography.size.sm, color: c.textMuted },
  pageIndicator: { flexDirection: 'row', gap: Spacing.xs, marginTop: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.border,
  },
  dotActive: { backgroundColor: c.primary },
  methodLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: c.textMuted,
    letterSpacing: 1.5,
    marginBottom: Spacing.lg,
  },
  btn: { width: '100%', marginBottom: Spacing.sm },
  hint: {
    fontSize: Typography.size.sm,
    color: c.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  hintLink: { color: c.primary, fontWeight: Typography.weight.semiBold },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 0,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: c.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
}
);