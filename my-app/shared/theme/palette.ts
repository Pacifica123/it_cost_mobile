import { useColorScheme } from 'react-native';

import { useData } from '../../store/data/DataContext';

export type ThemePalette = {
  isDark: boolean;
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
};

const light: ThemePalette = {
  isDark: false,
  bg: '#F6F7FB',
  surface: '#FFFFFF',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  primary: '#3B82F6',
};

const dark: ThemePalette = {
  isDark: true,
  bg: '#0F172A',
  surface: '#111827',
  text: '#F9FAFB',
  textMuted: '#9CA3AF',
  border: '#273449',
  primary: '#60A5FA',
};

export const getThemePalette = (isDark: boolean) => (isDark ? dark : light);

export function useThemePalette(): ThemePalette {
  const systemScheme = useColorScheme();
  const { appSettings } = useData();
  const isDark = appSettings.themeMode === 'dark' || (appSettings.themeMode === 'system' && systemScheme === 'dark');
  return getThemePalette(isDark);
}
