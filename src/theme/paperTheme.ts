import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { createTheme } from '@rneui/themed';
import type { ColorScheme } from './colors';
import { DarkColors } from './colors';

// ─── Factory: React Native Paper (MD3) Theme ─────────────────────────────────
export function makePaperTheme(c: ColorScheme, isDark: boolean) {
  const base = isDark ? MD3DarkTheme : MD3LightTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary:          c.primary,
      onPrimary:        c.textOnPrimary,
      primaryContainer: c.surfaceAlt,
      secondary:        c.accent,
      onSecondary:      c.textOnPrimary,
      secondaryContainer: isDark ? '#28230F' : '#FDF3DC',
      background:       c.background,
      surface:          c.surface,
      onSurface:        c.textPrimary,
      onSurfaceVariant: c.textSecondary,
      outline:          c.border,
      outlineVariant:   c.border,
      error:            c.error,
      onError:          '#FFFFFF',
      surfaceVariant:   c.surfaceAlt,
      scrim:            c.overlay,
    },
    roundness: 3,
  };
}

// ─── Factory: React Native Elements (RNEUI) Theme ────────────────────────────
export function makeRneuiTheme(c: ColorScheme) {
  return createTheme({
    lightColors: {
      primary:    c.primary,
      secondary:  c.accent,
      background: c.background,
      white:      c.surface,
      black:      c.textPrimary,
      grey0:      c.textPrimary,
      grey1:      c.textSecondary,
      grey2:      c.textMuted,
      grey3:      c.border,
      grey4:      c.surfaceAlt,
      grey5:      c.background,
      error:      c.error,
      success:    c.success,
      warning:    c.warning,
      divider:    c.border,
    },
    components: {
      Button: {
        buttonStyle:    { borderRadius: 12, paddingVertical: 14 },
        titleStyle:     { fontWeight: '600', fontSize: 15 },
        containerStyle: { width: '100%' },
      },
      Input: {
        inputContainerStyle: { borderBottomWidth: 1, borderColor: c.border },
        labelStyle: { color: c.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
      },
      CheckBox: {
        containerStyle: { backgroundColor: 'transparent', borderWidth: 0, padding: 0 },
      },
      Header: {
        containerStyle: {
          backgroundColor: c.surface,
          borderBottomWidth: 1,
          borderBottomColor: c.border,
          paddingTop: 0,
          height: 56,
        },
        centerContainerStyle: { flex: 3 },
      },
    },
  });
}

// ─── Default (dark) instances for backward-compat ────────────────────────────
export const paperTheme  = makePaperTheme(DarkColors, true);
export const rneuiTheme  = makeRneuiTheme(DarkColors);

