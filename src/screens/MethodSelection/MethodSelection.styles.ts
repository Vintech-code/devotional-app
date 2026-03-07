import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing, Radius } from '../../theme';

export const makeStyles = (c: ColorScheme) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: c.background,
  },
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: c.surfaceAlt,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  badgeText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: c.primary,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.extraBold,
    color: c.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.size.md,
    color: c.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.size.md * 1.6,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: c.textSecondary,
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: c.primary,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: c.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  hintText: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: c.textSecondary,
    lineHeight: Typography.size.sm * 1.5,
  },
  cta: {
    width: '100%',
  },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  signInText: {
    fontSize: Typography.size.md,
    color: c.textSecondary,
  },
  signInLink: {
    fontSize: Typography.size.md,
    color: c.primary,
    fontWeight: Typography.weight.semiBold,
  },
}
);