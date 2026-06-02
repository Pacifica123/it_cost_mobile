import type { AppSettings, AppUiDensity } from '../../store/data/types';

let activeSettings: Partial<AppSettings> = {
  uiDensity: 'comfortable',
};

export const configureAppPreferences = (settings?: Partial<AppSettings> | null) => {
  activeSettings = {
    ...activeSettings,
    ...(settings ?? {}),
  };
};

export const getUiDensity = (): AppUiDensity => {
  const value = activeSettings.uiDensity;
  return value === 'compact' || value === 'large' || value === 'comfortable' ? value : 'comfortable';
};

export const getUiDensityPadding = (base: number) => {
  const density = getUiDensity();
  if (density === 'compact') return Math.max(8, Math.round(base * 0.78));
  if (density === 'large') return Math.round(base * 1.18);
  return base;
};
