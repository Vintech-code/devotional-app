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
    marginBottom: Spacing.xs,
  },
  logo: {
    width: 180,
    height: 72,
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
  cta: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  signInText: {
  fontSize: Typography.size.sm,
  color: c.textSecondary,
  lineHeight: Typography.size.sm * 1.6,
  letterSpacing: 0.2,
  textAlign: 'center',
},

signInLink: {
  fontSize: Typography.size.sm,
  color: c.primary,
  fontWeight: Typography.weight.semiBold,
  letterSpacing: 0.2,
},

credits: {
  fontSize: Typography.size.xs,
  textAlign: 'center',
  lineHeight: Typography.size.xs * 1.8,
  letterSpacing: 0.2,
  maxWidth: 340,
  marginTop: Spacing.md, 
},

creditsName: {
  color: c.textSecondary,                   
  fontWeight: Typography.weight.regular, 
},  
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    justifyContent: 'center',
  },
  socialBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: 320,
    height: 320,
    backgroundColor: 'transparent',
  },
}
);