import { MD3DarkTheme } from 'react-native-paper';
import { createTheme } from '@rneui/themed';
import { Colors } from './colors';

// ─── React Native Paper (MD3) Theme ─────────────────────────────────────────
export const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary:          Colors.primary,
    onPrimary:        Colors.textOnPrimary,
    primaryContainer: Colors.surfaceAlt,
    secondary:        Colors.accent,
    onSecondary:      Colors.textOnPrimary,
    secondaryContainer: '#2A2210',
    background:       Colors.background,
    surface:          Colors.surface,
    onSurface:        Colors.textPrimary,
    onSurfaceVariant: Colors.textSecondary,
    outline:          Colors.border,
    outlineVariant:   Colors.border,
    error:            Colors.error,
    onError:          '#FFFFFF',
    surfaceVariant:   Colors.surfaceAlt,
    scrim:            Colors.overlay,
  },
  roundness: 3, // 1 unit ≈ 4px in MD3, so 3 → 12px border radius
};

// ─── React Native Elements (RNEUI) Theme ────────────────────────────────────
export const rneuiTheme = createTheme({
  lightColors: {
    primary:    Colors.primary,
    secondary:  Colors.accent,
    background: Colors.background,
    white:      Colors.surface,
    black:      Colors.textPrimary,
    grey0:      Colors.textPrimary,
    grey1:      Colors.textSecondary,
    grey2:      Colors.textMuted,
    grey3:      Colors.border,
    grey4:      Colors.surfaceAlt,
    grey5:      Colors.background,
    error:      Colors.error,
    success:    Colors.success,
    warning:    Colors.warning,
    divider:    Colors.border,
  },
  components: {
    Button: {
      buttonStyle:       { borderRadius: 12, paddingVertical: 14 },
      titleStyle:        { fontWeight: '600', fontSize: 15 },
      containerStyle:    { width: '100%' },
    },
    Input: {
      inputContainerStyle: {
        borderBottomWidth: 1,
        borderColor: Colors.border,
      },
      labelStyle: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    },
    CheckBox: {
      containerStyle: { backgroundColor: 'transparent', borderWidth: 0, padding: 0 },
    },
    Header: {
      containerStyle: {
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingTop: 0,
        height: 56,
      },
      centerContainerStyle: { flex: 3 },
    },
  },
});
