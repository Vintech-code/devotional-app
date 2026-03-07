import { StyleSheet } from 'react-native';
import { type ColorScheme, Typography, Spacing } from '../../theme';

export const makeStyles = (c: ColorScheme) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: c.background,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  logoWrap: {
    marginBottom: Spacing.md,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: c.textPrimary,
    textAlign: 'center',
  },
  headlineAccent: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    fontStyle: 'italic',
    color: c.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.size.md,
    color: c.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.size.md * 1.6,
    marginBottom: Spacing.sm,
  },

  pageIndicator: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: c.primary,
  },
  spacer: {
    flex: 1,
  },
  cta: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  signInText: {
    fontSize: Typography.size.sm,
    color: c.textSecondary,
  },
  signInLink: {
    color: c.primary,
    fontWeight: Typography.weight.semiBold,
  },
  lottie: {
    width: 320,
    height: 320,
    backgroundColor: 'transparent',
  },
}
);