import type { AppSettings, CapitalEquipment, ExpenseCategory } from '../../../store/data/types';

export type AmortizationRow = {
  id: string;
  name: string;
  kind: string;
  quantity: number;
  total: number;
  months: number;
  monthly: number;
};

function detectMonths(item: CapitalEquipment, categories: ExpenseCategory[], settings?: AppSettings) {
  const categoryName = categories.find((category) => category.id === item.categoryId)?.name.toLowerCase() ?? '';
  const text = `${item.name} ${categoryName}`.toLowerCase();

  if (item.kind === 'software' || text.includes('лиценз')) return settings?.softwareLifetimeMonths ?? 12;
  if (text.includes('сервер')) return settings?.serverLifetimeMonths ?? 48;
  if (text.includes('сеть') || text.includes('коммутатор') || text.includes('маршрутиз')) return settings?.serverLifetimeMonths ?? 48;
  if (text.includes('ибп')) return settings?.hardwareLifetimeMonths ?? 36;
  return settings?.hardwareLifetimeMonths ?? 36;
}

export function buildAmortizationRows(items: CapitalEquipment[], categories: ExpenseCategory[], settings?: AppSettings): AmortizationRow[] {
  return items.map((item) => {
    const months = detectMonths(item, categories, settings);
    const total = Math.max(0, Number(item.price) || 0) * Math.max(0, Number(item.quantity) || 0);
    return {
      id: item.id,
      name: item.name,
      kind: item.kind === 'software' ? 'ПО' : 'ТО',
      quantity: item.quantity,
      total,
      months,
      monthly: months > 0 ? Math.round(total / months) : total,
    };
  });
}

export function getAmortizationSummary(rows: AmortizationRow[]) {
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const monthly = rows.reduce((sum, row) => sum + row.monthly, 0);
  const hardwareMonthly = rows.filter((row) => row.kind === 'ТО').reduce((sum, row) => sum + row.monthly, 0);
  const softwareMonthly = rows.filter((row) => row.kind === 'ПО').reduce((sum, row) => sum + row.monthly, 0);
  return { total, monthly, hardwareMonthly, softwareMonthly };
}
