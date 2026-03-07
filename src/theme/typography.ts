import { Platform } from 'react-native';

const base = Platform.OS === 'ios' ? 'San Francisco' : 'Roboto';
const serif = Platform.OS === 'ios' ? 'Georgia' : 'serif';

export const Typography = {
  fontFamily: base,
  fontFamilySerif: serif,

  // Sizes
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 22,
    xxl: 28,
    display: 34,
  },

  // Weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};
