import AsyncStorage from '@react-native-async-storage/async-storage';

import { hydrateDataState, serializeDataState } from './serialization';
import type { DataState } from './types';

export const DATA_STORAGE_KEY = 'itcost_store_v2';

export { hydrateDataState, serializeDataState };

export const persistDataState = async (state: DataState) => {
  await AsyncStorage.setItem(DATA_STORAGE_KEY, serializeDataState(state));
};

export const loadStoredDataState = async () => hydrateDataState(await AsyncStorage.getItem(DATA_STORAGE_KEY));
