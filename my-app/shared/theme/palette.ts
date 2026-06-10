import { useColorScheme } from 'react-native';

import { useData } from '../../store/data/DataContext';

export type ThemePalette = {
  isDark: boolean;
  bg: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textSoft: string;
  textMuted: string;
  textOnDark: string;
  textOnDarkSoft: string;
  border: string;
  borderSoft: string;
  primary: string;
  primarySoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  hero: string;
};

const light: ThemePalette = {
  isDark: false,
  bg: '#F6F7FB',
  surface: '#FFFFFF',
  surfaceMuted: '#F3F4F6',
  text: '#111827',
  textSoft: '#374151',
  textMuted: '#6B7280',
  textOnDark: '#FFFFFF',
  textOnDarkSoft: '#D1D5DB',
  border: '#E5E7EB',
  borderSoft: '#EEF1F5',
  primary: '#3B82F6',
  primarySoft: 'rgba(59,130,246,0.12)',
  success: '#16A34A',
  successSoft: 'rgba(34,197,94,0.16)',
  warning: '#D97706',
  warningSoft: 'rgba(245,158,11,0.16)',
  danger: '#DC2626',
  dangerSoft: 'rgba(239,68,68,0.12)',
  hero: '#111827',
};

const dark: ThemePalette = {
  isDark: true,
  bg: '#020617',
  surface: '#0F172A',
  surfaceMuted: '#1E293B',
  text: '#F9FAFB',
  textSoft: '#D8E0EE',
  textMuted: '#A7B3C8',
  textOnDark: '#FFFFFF',
  textOnDarkSoft: '#D1D5DB',
  border: '#334155',
  borderSoft: '#263449',
  primary: '#60A5FA',
  primarySoft: 'rgba(96,165,250,0.18)',
  success: '#22C55E',
  successSoft: 'rgba(34,197,94,0.16)',
  warning: '#F59E0B',
  warningSoft: 'rgba(245,158,11,0.18)',
  danger: '#F87171',
  dangerSoft: 'rgba(248,113,113,0.18)',
  hero: '#0B1120',
};

export const getThemePalette = (isDark: boolean) => (isDark ? dark : light);

export function useThemePalette(): ThemePalette {
  const systemScheme = useColorScheme();
  const { appSettings } = useData();
  const isDark = appSettings.themeMode === 'dark' || (appSettings.themeMode === 'system' && systemScheme === 'dark');
  return getThemePalette(isDark);
}
