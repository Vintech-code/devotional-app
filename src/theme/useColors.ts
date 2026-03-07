import { useAppStore } from '../store/useAppStore';
import { DarkColors, LightColors, type ColorScheme } from './colors';

export function useColors(): ColorScheme {
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  return isDarkMode ? DarkColors : LightColors;
}
