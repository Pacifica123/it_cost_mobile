import type { DataState } from '../../../store/data/types';
import { buildReport } from '../../report/logic/buildReport';
import { validateProjectData, type ValidationIssue } from '../../validation/logic/validateProjectData';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export type RiskItem = {
  id: string;
  level: RiskLevel;
  title: string;
  description: string;
  recommendation: string;
  route?: string;
};

export type RisksSummary = {
  score: number;
  label: string;
  risks: RiskItem[];
  recommendations: RiskItem[];
};

const issueLevel = (issue: ValidationIssue): RiskLevel => {
  if (issue.severity === 'error') return 'critical';
  if (issue.id.includes('budget') || issue.id.includes('duplicate') || issue.id.includes('server')) return 'high';
  if (issue.severity === 'warning') return 'medium';
  return 'low';
};

const issueRoute = (issue: ValidationIssue) => {
  if (issue.area === 'Проект') return '/it-cost/project';
  if (issue.area === 'CAPEX') return '/it-cost/capital_expenditures';
  if (issue.area === 'OPEX') return '/it-cost/operating_expenses';
  if (issue.area === 'Электроэнергия') return '/it-cost/electricity';
  if (issue.area === 'Категории') return '/it-cost/capital_expenditures';
  return '/it-cost/validation';
};

const recommendationForIssue = (issue: ValidationIssue) => {
  if (issue.id.includes('duplicate')) return 'Объедините одинаковые позиции или удалите лишние строки после импорта.';
  if (issue.id.includes('budget')) return 'Проверьте бюджет проекта, дорогие позиции и альтернативные конфигурации.';
  if (issue.id.includes('server-without-network')) return 'Добавьте сетевое оборудование или уточните, что сервер не требует локальной сети.';
  if (issue.id.includes('clients-without-software')) return 'Добавьте ОС, офисный пакет, антивирус или подписки на рабочие места.';
  if (issue.id.includes('no-backup')) return 'Добавьте резервное копирование в OPEX или CAPEX.';
  if (issue.id.includes('no-security')) return 'Добавьте защиту рабочих мест или укажите существующую систему безопасности.';
  if (issue.area === 'Электроэнергия') return 'Заполните расчёт энергопотребления, если важна полная стоимость владения.';
  return 'Откройте проверку данных и исправьте найденное замечание.';
};

const levelWeight: Record<RiskLevel, number> = {
  critical: 28,
  high: 16,
  medium: 9,
  low: 4,
};

const buildLabel = (score: number) => {
  if (score >= 85) return 'низкий риск';
  if (score >= 65) return 'умеренный риск';
  if (score >= 40) return 'повышенный риск';
  return 'критичный риск';
};

export function buildRisksSummary(state: DataState): RisksSummary {
  const validation = validateProjectData(state);
  const report = buildReport(state);
  const risks: RiskItem[] = validation.issues.map((issue) => {
    const level = issueLevel(issue);
    return {
      id: issue.id,
      level,
      title: issue.title,
      description: issue.description,
      recommendation: recommendationForIssue(issue),
      route: issueRoute(issue),
    };
  });

  const capitalTotal = report.capitalTotal;
  const recurringAnnual = report.periodicTotalAnnual + report.electricityTotalAnnual;
  if (capitalTotal > 0 && recurringAnnual > capitalTotal * 0.7) {
    risks.push({
      id: 'risk-high-recurring-costs',
      level: 'medium',
      title: 'Высокая доля периодических расходов',
      description: 'Годовой OPEX и электричество заметно влияют на стоимость владения.',
      recommendation: 'Проверьте подписки, аренду и сопровождение, чтобы снизить долгосрочную нагрузку.',
      route: '/it-cost/operating_expenses',
    });
  }

  if (state.projectMeta.budget > 0 && capitalTotal > state.projectMeta.budget * 0.9 && capitalTotal <= state.projectMeta.budget) {
    risks.push({
      id: 'risk-tight-budget-reserve',
      level: 'medium',
      title: 'Малый запас бюджета',
      description: 'CAPEX почти полностью использует заданный бюджет.',
      recommendation: 'Оставьте резерв на доставку, внедрение, замену комплектующих и рост цен.',
      route: '/it-cost/dashboard',
    });
  }

  const scorePenalty = risks.reduce((sum, risk) => sum + levelWeight[risk.level], 0);
  const score = Math.max(0, Math.min(100, 100 - scorePenalty));
  const recommendations = [...risks].sort((a, b) => levelWeight[b.level] - levelWeight[a.level]).slice(0, 7);

  return {
    score,
    label: buildLabel(score),
    risks: risks.sort((a, b) => levelWeight[b.level] - levelWeight[a.level]),
    recommendations,
  };
}
