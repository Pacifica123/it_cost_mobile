import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import type { ElectricityItem } from '../types';

const STORAGE_KEY = 'electricity_equipment_v1';

export function useElectricityStorage(baseItems: ElectricityItem[]) {
  const [items, setItems] = useState<ElectricityItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const saved: Record<string, { powerW?: number; isDeleted?: boolean }> = raw ? JSON.parse(raw) : {};

        const merged = baseItems.map((item) => ({
          ...item,
          powerW: Number(saved[item.id]?.powerW ?? item.powerW),
          isDeleted: Boolean(saved[item.id]?.isDeleted ?? false),
        }));

        setItems(merged);
      } catch {
        setItems(baseItems);
      }
    })();
  }, [baseItems]);

  const persist = async (next: ElectricityItem[]) => {
    const payload: Record<string, { powerW: number; isDeleted: boolean }> = {};
    next.forEach((item) => {
      payload[item.id] = { powerW: item.powerW, isDeleted: Boolean(item.isDeleted) };
    });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setItems(next);
  };

  return {
    items,
    setItems,
    persist,
  };
}
