import type { Href } from 'expo-router';

import type { DataState } from '../../../store/data/types';
import { buildProjectReadiness } from './readiness';

export type NextCalculationStep = {
  title: string;
  description: string;
  route: Href;
  actionLabel: string;
};

const routeByCheckId: Record<string, Href> = {
  capex: '/it-cost/capital_expenditures' as Href,
  hardware: '/it-cost/technical_equipment' as Href,
  software: '/it-cost/software' as Href,
  'client-seats': '/it-cost/technical_equipment' as Href,
  'periodic-opex': '/it-cost/operating_expenses' as Href,
  'one-time-opex': '/it-cost/operating_expenses' as Href,
  electricity: '/it-cost/electricity' as Href,
  'analysis-data': '/it-cost/genetic_optimization' as Href,
};

const actionByCheckId: Record<string, string> = {
  capex: 'Открыть CAPEX',
  hardware: 'Добавить ТО',
  software: 'Добавить ПО',
  'client-seats': 'Добавить рабочие места',
  'periodic-opex': 'Заполнить OPEX',
  'one-time-opex': 'Проверить разовые работы',
  electricity: 'Рассчитать энергию',
  'analysis-data': 'Открыть GA',
};

export function getNextCalculationStep(state: DataState): NextCalculationStep {
  const readiness = buildProjectReadiness(state);
  const candidate = readiness.blockers[0] ?? readiness.warnings[0];

  if (candidate) {
    return {
      title: candidate.title,
      description: candidate.description,
      route: routeByCheckId[candidate.id] ?? '/it-cost/quick_start' as Href,
      actionLabel: actionByCheckId[candidate.id] ?? 'Продолжить',
    };
  }

  return {
    title: 'Расчёт готов',
    description: 'Основные данные заполнены. Можно открыть итоговый отчёт или сравнить методы анализа.',
    route: '/it-cost/export' as Href,
    actionLabel: 'Открыть отчёт',
  };
}
