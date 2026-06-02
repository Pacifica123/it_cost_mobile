import type { DataState } from '../../../store/data/types';
import { buildReport } from '../../report/logic/buildReport';

export type CostSlice = {
  id: string;
  title: string;
  value: number;
};

export type FinancialChartData = {
  structure: CostSlice[];
  annualBars: CostSlice[];
  cumulativeTco: number[];
  discountedTco: number[];
};

const DISCOUNT_RATE = 0.12;

export function buildFinancialChartData(state: DataState): FinancialChartData {
  const report = buildReport(state);
  const recurringAnnual = report.periodicTotalAnnual + report.electricityTotalAnnual;
  const oneTime = report.totalOneTimeExpenses;
  const cumulativeTco = Array.from({ length: 6 }, (_, year) => oneTime + recurringAnnual * year);
  const discountedTco = Array.from({ length: 6 }, (_, year) => {
    const recurring = Array.from({ length: year }, (_, index) => index + 1).reduce(
      (sum, currentYear) => sum + recurringAnnual / Math.pow(1 + DISCOUNT_RATE, currentYear),
      0
    );
    return Math.round(oneTime + recurring);
  });

  return {
    structure: [
      { id: 'hardware', title: 'ТО', value: report.hardwareTotal },
      { id: 'software', title: 'ПО', value: report.softwareTotal },
      { id: 'one-time-opex', title: 'Разовые OPEX', value: report.oneTimeOperatingTotal },
      { id: 'recurring', title: 'Годовой OPEX', value: report.periodicTotalAnnual },
      { id: 'electricity', title: 'Энергия/год', value: report.electricityTotalAnnual },
    ].filter((item) => item.value > 0),
    annualBars: [
      { id: 'one-time', title: 'Старт', value: oneTime },
      { id: 'recurring', title: 'Годовые', value: recurringAnnual },
      { id: 'total', title: '1 год', value: report.grandTotalAnnual },
    ],
    cumulativeTco,
    discountedTco,
  };
}
