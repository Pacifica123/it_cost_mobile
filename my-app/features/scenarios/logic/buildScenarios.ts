import type { DataState } from '../../../store/data/types';
import { buildReport } from '../../report/logic/buildReport';
import { validateProjectData } from '../../validation/logic/validateProjectData';
import { projectTemplates } from '../../project/logic/templates';

export type ScenarioTone = 'ok' | 'warning' | 'danger' | 'info';

export type ScenarioComparisonItem = {
  id: string;
  title: string;
  subtitle: string;
  capitalTotal: number;
  annualTotal: number;
  monthlyRunRate: number;
  budgetRemainder: number;
  riskScore: number;
  qualityScore: number;
  tone: ScenarioTone;
  summary: string;
};

export type ScenarioComparison = {
  items: ScenarioComparisonItem[];
  recommended?: ScenarioComparisonItem;
};

const riskScoreForState = (state: DataState) => {
  const validation = validateProjectData(state);
  return Math.max(0, 100 - validation.errors.length * 30 - validation.warnings.length * 12 - validation.infos.length * 5);
};

const scenarioTone = (state: DataState, budgetRemainder: number, qualityScore: number): ScenarioTone => {
  if (budgetRemainder < 0) return 'danger';
  if (qualityScore < 65) return 'warning';
  if (state.projectMeta.budget > 0 && budgetRemainder < state.projectMeta.budget * 0.1) return 'warning';
  return 'ok';
};

const buildScenarioItem = (id: string, title: string, subtitle: string, state: DataState): ScenarioComparisonItem => {
  const report = buildReport(state);
  const validation = validateProjectData(state);
  const riskScore = riskScoreForState(state);
  const budget = Math.max(0, state.projectMeta.budget || 0);
  const budgetRemainder = budget - report.capitalTotal;
  const monthlyRunRate = report.periodicTotalMonthly + report.electricityTotalMonthly;
  const tone = scenarioTone(state, budgetRemainder, validation.score);
  const summary = budgetRemainder < 0
    ? 'Превышает бюджет, но может быть полезен как производительный ориентир.'
    : monthlyRunRate > report.capitalTotal / 12 && report.capitalTotal > 0
      ? 'Низкий стартовый порог, но заметная ежемесячная нагрузка.'
      : 'Сбалансирован по стартовым и ежегодным затратам.';

  return {
    id,
    title,
    subtitle,
    capitalTotal: report.capitalTotal,
    annualTotal: report.grandTotalAnnual,
    monthlyRunRate,
    budgetRemainder,
    riskScore,
    qualityScore: validation.score,
    tone,
    summary,
  };
};

export function buildScenarioComparison(currentState: DataState): ScenarioComparison {
  const current = buildScenarioItem('current', 'Текущий проект', 'Состояние, которое сейчас открыто в приложении.', currentState);
  const templateItems = projectTemplates.map((template) => buildScenarioItem(template.id, template.title, template.subtitle, template.state));
  const items = [current, ...templateItems].sort((a, b) => {
    const scoreA = a.riskScore + a.qualityScore - (a.budgetRemainder < 0 ? 80 : 0) - a.monthlyRunRate / 10000;
    const scoreB = b.riskScore + b.qualityScore - (b.budgetRemainder < 0 ? 80 : 0) - b.monthlyRunRate / 10000;
    return scoreB - scoreA;
  });

  return {
    items,
    recommended: items.find((item) => item.tone !== 'danger') ?? items[0],
  };
}
