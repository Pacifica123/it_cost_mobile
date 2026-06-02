import AsyncStorage from '@react-native-async-storage/async-storage';

import { hydrateDataState, serializeDataState } from './serialization';
import type { DataState } from './types';

export const DATA_STORAGE_KEY = 'itcost_store_v4';
const LEGACY_STORAGE_KEYS = ['itcost_store_v3', 'itcost_store_v2'];

export { hydrateDataState, serializeDataState };

export const persistDataState = async (state: DataState) => {
  await AsyncStorage.setItem(DATA_STORAGE_KEY, serializeDataState(state));
};

export const loadStoredDataState = async () => {
  const current = await AsyncStorage.getItem(DATA_STORAGE_KEY);
  if (current) return hydrateDataState(current);

  for (const key of LEGACY_STORAGE_KEYS) {
    const legacy = await AsyncStorage.getItem(key);
    if (legacy) return hydrateDataState(legacy);
  }

  return hydrateDataState(null);
};
