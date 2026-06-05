import { useSyncExternalStore } from 'react';

import type { AppSettings, AppUiDensity } from '../../store/data/types';

let activeSettings: Partial<AppSettings> = {
  uiDensity: 'comfortable',
};

const listeners = new Set<() => void>();

const isDensity = (value: unknown): value is AppUiDensity =>
  value === 'compact' || value === 'large' || value === 'comfortable';

const notifyPreferencesChanged = () => {
  listeners.forEach((listener) => listener());
};

export const configureAppPreferences = (settings?: Partial<AppSettings> | null) => {
  const previousDensity = getUiDensity();
  activeSettings = {
    ...activeSettings,
    ...(settings ?? {}),
  };
  if (previousDensity !== getUiDensity()) {
    notifyPreferencesChanged();
  }
};

export const subscribeAppPreferences = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getUiDensity = (): AppUiDensity => {
  const value = activeSettings.uiDensity;
  return isDensity(value) ? value : 'comfortable';
};

export const useUiDensity = () =>
  useSyncExternalStore(subscribeAppPreferences, getUiDensity, getUiDensity);

export const getUiDensityPaddingFor = (density: AppUiDensity, base: number) => {
  if (density === 'compact') return Math.max(8, Math.round(base * 0.78));
  if (density === 'large') return Math.round(base * 1.18);
  return base;
};

export const getUiDensityPadding = (base: number) => getUiDensityPaddingFor(getUiDensity(), base);

export const getUiDensityScaleFor = (density: AppUiDensity) => {
  if (density === 'compact') return 0.88;
  if (density === 'large') return 1.12;
  return 1;
};

export const getUiDensityScale = () => getUiDensityScaleFor(getUiDensity());

export const getUiDensityValueFor = (density: AppUiDensity, compact: number, comfortable: number, large: number) => {
  if (density === 'compact') return compact;
  if (density === 'large') return large;
  return comfortable;
};

export const getUiDensityValue = (compact: number, comfortable: number, large: number) =>
  getUiDensityValueFor(getUiDensity(), compact, comfortable, large);
