export type ColorScheme = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentLight: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;
  border: string;
  borderFocus: string;
  success: string;
  successSurface: string;
  warning: string;
  error: string;
  info: string;
  tagActive: string;
  tagInactive: string;
  tagTextActive: string;
  tagTextInactive: string;
  overlay: string;
  transparent: string;
  dayCircleActive: string;
  dayCircleInactive: string;
};

export const DarkColors: ColorScheme = {
  // Primary – teal (user preference)
  primary: '#00ACAA',
  primaryDark: '#008A88',
  primaryLight: '#33BCBA',

  // Accent – warm bronze gold
  accent: '#C8A86A',
  accentLight: '#D9BF8A',

  // Backgrounds
  background: '#111111',
  surface: '#1A1A1A',
  surfaceAlt: '#222222',

  // Text
  textPrimary: '#F0F0F0',
  textSecondary: '#888888',
  textMuted: '#444444',
  textOnPrimary: '#111111',

  // Border
  border: '#2A2A2A',
  borderFocus: '#00ACAA',

  // Status
  success: '#5A9E6F',
  successSurface: '#0D1A12',
  warning: '#C89A3A',
  error: '#B85A5A',
  info: '#5A82B8',

  // Tags / Chips
  tagActive: '#1A3A3A',
  tagInactive: '#222222',
  tagTextActive: '#00ACAA',
  tagTextInactive: '#888888',

  // Misc
  overlay: 'rgba(0,0,0,0.75)',
  transparent: 'transparent',
  dayCircleActive: '#C8A86A',
  dayCircleInactive: '#222222',
};

export const LightColors: ColorScheme = {
  // Primary – darker teal for contrast on cream
  primary: '#007A78',
  primaryDark: '#005C5A',
  primaryLight: '#00A09E',

  // Accent – deep bronze gold
  accent: '#9A7A3A',
  accentLight: '#B89050',

  // Backgrounds – warm cream / parchment
  background: '#F5F3EE',
  surface: '#FFFFFF',
  surfaceAlt: '#EEECE8',

  // Text
  textPrimary: '#1C1C1A',
  textSecondary: '#5C5C58',
  textMuted: '#9A9A95',
  textOnPrimary: '#FFFFFF',

  // Border
  border: '#E4E2DC',
  borderFocus: '#007A78',

  // Status
  success: '#2E7D4F',
  successSurface: '#E8F5EE',
  warning: '#9A6E1A',
  error: '#9A3030',
  info: '#2E5A8A',

  // Tags / Chips
  tagActive: '#E0F2F1',
  tagInactive: '#EEECE8',
  tagTextActive: '#007A78',
  tagTextInactive: '#5C5C58',

  // Misc
  overlay: 'rgba(0,0,0,0.4)',
  transparent: 'transparent',
  dayCircleActive: '#9A7A3A',
  dayCircleInactive: '#EEECE8',
};

// Backward-compat alias used in static / non-hook contexts
export const Colors = DarkColors;

