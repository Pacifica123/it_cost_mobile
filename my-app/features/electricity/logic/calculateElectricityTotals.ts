import { toNumberSafe } from '../../../shared/utils/number';
import type { ElectricityItem } from '../types';

export function calculateElectricityTotals(items: ElectricityItem[], hoursPerDay: string, workDaysPerMonth: string, pricePerKwh: string) {
  const h = toNumberSafe(hoursPerDay);
  const d = toNumberSafe(workDaysPerMonth);
  const p = toNumberSafe(pricePerKwh);

  const activeItems = items.filter((item) => !item.isDeleted);
  const activeCount = activeItems.length;
  const totalUnits = activeItems.reduce((sum, item) => sum + item.quantity, 0);
  const installedPowerW = activeItems.reduce((sum, item) => sum + item.powerW * item.quantity, 0);

  const totalKwh = (installedPowerW * h * d) / 1000;
  const totalRub = totalKwh * p;
  const dayKwh = (installedPowerW * h) / 1000;
  const dayRub = dayKwh * p;

  return {
    activeCount,
    totalUnits,
    installedPowerW,
    totalKwh,
    totalRub,
    dayKwh,
    dayRub,
  };
}

export function calculateEquipmentSummary(items: ElectricityItem[]) {
  const activeItems = items.filter((item) => !item.isDeleted);
  const hiddenItems = items.filter((item) => item.isDeleted);
  const totalUnits = activeItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPowerW = activeItems.reduce((sum, item) => sum + item.powerW * item.quantity, 0);

  return {
    activeCount: activeItems.length,
    hiddenCount: hiddenItems.length,
    totalUnits,
    totalPowerW,
  };
}
