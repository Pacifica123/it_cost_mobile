import { useMemo, useState } from 'react';

import { onlyDecimal, onlyDigits, toNumberSafe } from '../../../shared/utils/number';
import { calculateElectricityTotals, calculateEquipmentSummary } from '../logic/calculateElectricityTotals';
import { mapCapitalToElectricityItems } from '../logic/mapCapitalToElectricityItems';
import { useElectricityStorage } from './useElectricityStorage';
import type { ElectricityBaseSource } from '../types';

export function useElectricityState(capitalData: ElectricityBaseSource[]) {
  const baseItems = useMemo(() => mapCapitalToElectricityItems(capitalData), [capitalData]);
  const { items, persist } = useElectricityStorage(baseItems);

  const [hoursPerDay, setHoursPerDayValue] = useState('');
  const [workDaysPerMonth, setWorkDaysPerMonthValue] = useState('');
  const [pricePerKwh, setPricePerKwhValue] = useState('');

  const [equipmentOpen, setEquipmentOpen] = useState(true);
  const [paramsOpen, setParamsOpen] = useState(true);
  const [resultsOpen, setResultsOpen] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPower, setEditPower] = useState('');

  const resetParams = () => {
    setHoursPerDayValue('');
    setWorkDaysPerMonthValue('');
    setPricePerKwhValue('');
  };

  const openEdit = (id: string) => {
    const found = items.find((item) => item.id === id);
    setEditId(id);
    setEditPower(found ? String(found.powerW ?? 0) : '0');
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditId(null);
    setEditPower('');
  };

  const saveEdit = async () => {
    if (!editId) return;
    const next = items.map((item) => (
      item.id === editId ? { ...item, powerW: Math.max(0, toNumberSafe(editPower)) } : item
    ));
    await persist(next);
    closeEdit();
  };

  const removeItem = async (id: string) => {
    await persist(items.map((item) => (item.id === id ? { ...item, isDeleted: true } : item)));
  };

  const restoreItem = async (id: string) => {
    await persist(items.map((item) => (item.id === id ? { ...item, isDeleted: false } : item)));
  };

  return {
    items,
    hoursPerDay,
    workDaysPerMonth,
    pricePerKwh,
    setHoursPerDay: (value: string) => setHoursPerDayValue(onlyDigits(value)),
    setWorkDaysPerMonth: (value: string) => setWorkDaysPerMonthValue(onlyDigits(value)),
    setPricePerKwh: (value: string) => setPricePerKwhValue(onlyDecimal(value)),
    equipmentOpen,
    setEquipmentOpen,
    paramsOpen,
    setParamsOpen,
    resultsOpen,
    setResultsOpen,
    editOpen,
    editPower,
    setEditPower: (value: string) => setEditPower(onlyDigits(value)),
    openEdit,
    closeEdit,
    saveEdit,
    removeItem,
    restoreItem,
    resetParams,
    equipmentSummary: calculateEquipmentSummary(items),
    result: calculateElectricityTotals(items, hoursPerDay, workDaysPerMonth, pricePerKwh),
  };
}
