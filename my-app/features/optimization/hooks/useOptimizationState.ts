import { useMemo, useState } from 'react';

import { onlyDecimal, onlyDigits, toNumberSafe } from '../../../shared/utils/number';
import { selectCapitalTotal } from '../../../store/data/selectors';
import type { CapitalEquipment, ExpenseCategory } from '../../../store/data/types';
import { runOptimization } from '../logic/optimization';
import type { OptimizationReport, OptimizationScope } from '../types';

const parseWeight = (value: string, fallback: number) => {
  const parsed = toNumberSafe(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export function useOptimizationState(capitalData: CapitalEquipment[], categories: ExpenseCategory[], defaults?: { budget?: number; targetClientSeats?: number }) {
  const [scope, setScope] = useState<OptimizationScope>('all');
  const [budget, setBudgetValue] = useState(String(defaults?.budget || 150000));
  const [targetSeats, setTargetSeatsValue] = useState(String(defaults?.targetClientSeats || 10));
  const [costWeight, setCostWeightValue] = useState('0.35');
  const [coverageWeight, setCoverageWeightValue] = useState('0.30');
  const [clientWeight, setClientWeightValue] = useState('0.25');
  const [countWeight, setCountWeightValue] = useState('0.10');
  const [requiredCategoryIds, setRequiredCategoryIds] = useState<string[]>([]);
  const [report, setReport] = useState<OptimizationReport | null>(null);

  const capitalTotal = useMemo(
    () => selectCapitalTotal({ schemaVersion: 3, projectMeta: { name: '', organization: '', budget: 0, targetClientSeats: 0, note: '', createdAt: '', updatedAt: '' }, appSettings: { themeMode: 'system', currency: 'RUB', roundingMode: 'rubles', confirmDelete: true }, projectEvents: [], projectBackups: [], undoStack: [], redoStack: [], capitalData, operatingData: [], categories, electricityTotal: 0 }),
    [capitalData, categories]
  );

  const capitalCategories = useMemo(
    () => categories.filter((category) => category.scope === 'capital'),
    [categories]
  );

  const toggleRequiredCategory = (categoryId: string) => {
    setRequiredCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const run = () => {
    setReport(
      runOptimization({
        capitalData,
        categories,
        scope,
        params: {
          maxBudget: toNumberSafe(budget),
          targetClientSeats: toNumberSafe(targetSeats),
          requiredCategoryIds,
          weights: {
            cost: parseWeight(costWeight, 0.35),
            categoryCoverage: parseWeight(coverageWeight, 0.3),
            clientSeats: parseWeight(clientWeight, 0.25),
            itemCount: parseWeight(countWeight, 0.1),
          },
        },
      })
    );
  };

  return {
    scope,
    setScope,
    budget,
    setBudget: (value: string) => setBudgetValue(onlyDigits(value)),
    targetSeats,
    setTargetSeats: (value: string) => setTargetSeatsValue(onlyDigits(value)),
    costWeight,
    setCostWeight: (value: string) => setCostWeightValue(onlyDecimal(value)),
    coverageWeight,
    setCoverageWeight: (value: string) => setCoverageWeightValue(onlyDecimal(value)),
    clientWeight,
    setClientWeight: (value: string) => setClientWeightValue(onlyDecimal(value)),
    countWeight,
    setCountWeight: (value: string) => setCountWeightValue(onlyDecimal(value)),
    requiredCategoryIds,
    toggleRequiredCategory,
    capitalCategories,
    capitalTotal,
    report,
    run,
  };
}
