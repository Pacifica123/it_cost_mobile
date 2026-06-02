import type { CapitalEquipment, DataState, ProjectEvent } from '../../../store/data/types';
import { buildProjectReadiness } from '../../project/logic/readiness';
import { buildReport } from '../../report/logic/buildReport';
import { validateProjectData } from '../../validation/logic/validateProjectData';

export type DashboardTone = 'ok' | 'warning' | 'danger' | 'info';

export type DashboardMetric = {
  id: string;
  title: string;
  value: number | string;
  suffix?: string;
  hint: string;
  tone: DashboardTone;
};

export type DashboardInsight = {
  id: string;
  tone: DashboardTone;
  title: string;
  description: string;
  actionLabel?: string;
  route?: string;
};

export type DashboardTopItem = {
  id: string;
  name: string;
  cost: number;
  category: string;
  sharePercent: number;
};

export type DashboardSummary = {
  readinessPercent: number;
  dataQualityScore: number;
  budget: number;
  capitalTotal: number;
  budgetUsedPercent: number;
  budgetRemainder: number;
  oneTimeTotal: number;
  monthlyRunRate: number;
  annualTotal: number;
  recurringAnnualTotal: number;
  topCapitalItems: DashboardTopItem[];
  recentEvents: ProjectEvent[];
  metrics: DashboardMetric[];
  insights: DashboardInsight[];
  statusLabel: string;
};

const percent = (value: number, total: number) => {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.round((value / total) * 100);
};

const categoryNameById = (state: DataState) => new Map(state.categories.map((category) => [category.id, category.name]));

const buildTopCapitalItems = (state: DataState, capitalTotal: number): DashboardTopItem[] => {
  const names = categoryNameById(state);
  return [...state.capitalData]
    .map((item: CapitalEquipment) => {
      const cost = item.quantity * item.price;
      return {
        id: item.id,
        name: item.name || 'Без названия',
        cost,
        category: names.get(item.categoryId) ?? 'Без категории',
        sharePercent: percent(cost, capitalTotal),
      };
    })
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5);
};

const makeStatusLabel = (readinessPercent: number, qualityScore: number, hasErrors: boolean) => {
  if (hasErrors) return 'нужно исправить ошибки';
  if (readinessPercent >= 90 && qualityScore >= 85) return 'готов к итоговой выгрузке';
  if (readinessPercent >= 70) return 'рабочий черновик';
  return 'требует заполнения';
};

export function buildDashboardSummary(state: DataState): DashboardSummary {
  const report = buildReport(state);
  const readiness = buildProjectReadiness(state);
  const validation = validateProjectData(state);
  const budget = Math.max(0, Number(state.projectMeta?.budget ?? 0));
  const budgetUsedPercent = percent(report.capitalTotal, budget);
  const budgetRemainder = budget - report.capitalTotal;
  const monthlyRunRate = report.periodicTotalMonthly + report.electricityTotalMonthly;
  const recurringAnnualTotal = report.periodicTotalAnnual + report.electricityTotalAnnual;
  const topCapitalItems = buildTopCapitalItems(state, report.capitalTotal);
  const largestItem = topCapitalItems[0];
  const insights: DashboardInsight[] = [];

  if (validation.errors.length > 0) {
    insights.push({
      id: 'validation-errors',
      tone: 'danger',
      title: 'Есть критичные ошибки данных',
      description: 'Часть расчётов может быть некорректной. Сначала откройте проверку данных и исправьте ошибки.',
      actionLabel: 'Открыть проверку',
      route: '/it-cost/validation',
    });
  }

  if (budget <= 0) {
    insights.push({
      id: 'budget-empty',
      tone: 'warning',
      title: 'Бюджет проекта не задан',
      description: 'Без бюджета сложнее оценивать запас, превышение и результаты подбора конфигурации.',
      actionLabel: 'Открыть проект',
      route: '/it-cost/project',
    });
  } else if (budgetRemainder < 0) {
    insights.push({
      id: 'budget-overrun',
      tone: 'danger',
      title: 'CAPEX превышает бюджет',
      description: `Капитальные затраты выше бюджета на ${Math.abs(budgetRemainder).toLocaleString('ru-RU')} ₽. Стоит убрать дорогие позиции или поднять бюджет.`,
      actionLabel: 'Открыть CAPEX',
      route: '/it-cost/capital_expenditures',
    });
  } else if (budgetUsedPercent >= 85) {
    insights.push({
      id: 'budget-tight',
      tone: 'warning',
      title: 'Запас бюджета почти исчерпан',
      description: `Использовано около ${budgetUsedPercent}% бюджета. Для реального проекта лучше оставить резерв на внедрение и непредвиденные расходы.`,
      actionLabel: 'Открыть сводный отчёт',
      route: '/it-cost/export',
    });
  }

  if (readiness.blockers.length > 0) {
    insights.push({
      id: 'readiness-blockers',
      tone: 'warning',
      title: 'Расчёт заполнен не полностью',
      description: readiness.blockers[0]?.description ?? readiness.summary,
      actionLabel: 'Продолжить расчёт',
      route: '/it-cost/quick_start',
    });
  } else if (readiness.warnings.length > 0) {
    insights.push({
      id: 'readiness-warnings',
      tone: 'info',
      title: 'Расчёт можно улучшить',
      description: readiness.warnings[0]?.description ?? readiness.summary,
      actionLabel: 'Проверить данные',
      route: '/it-cost/validation',
    });
  }

  if (recurringAnnualTotal > report.capitalTotal && report.capitalTotal > 0) {
    insights.push({
      id: 'recurring-heavy',
      tone: 'warning',
      title: 'OPEX заметно влияет на стоимость владения',
      description: 'Годовые периодические расходы выше капитальных затрат. Проверьте подписки, аренду и сопровождение.',
      actionLabel: 'Открыть OPEX',
      route: '/it-cost/operating_expenses',
    });
  }

  if (largestItem && largestItem.sharePercent >= 50) {
    insights.push({
      id: 'cost-concentration',
      tone: 'info',
      title: 'Есть крупная позиция в CAPEX',
      description: `${largestItem.name} даёт около ${largestItem.sharePercent}% капитальных затрат. Её стоит проверить отдельно.`,
      actionLabel: 'Открыть CAPEX',
      route: '/it-cost/capital_expenditures',
    });
  }

  if (state.electricityTotal <= 0 && state.capitalData.length > 0) {
    insights.push({
      id: 'electricity-missing',
      tone: 'info',
      title: 'Электроэнергия не влияет на итог',
      description: 'Если важно посчитать стоимость владения точнее, добавьте энергопотребление оборудования.',
      actionLabel: 'Рассчитать энергию',
      route: '/it-cost/electricity',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'all-good',
      tone: 'ok',
      title: 'Сводка выглядит устойчиво',
      description: 'Ключевые разделы заполнены, критичных замечаний нет. Можно переходить к отчёту или сравнению методов.',
      actionLabel: 'Открыть отчёт',
      route: '/it-cost/export',
    });
  }

  const metrics: DashboardMetric[] = [
    {
      id: 'one-time',
      title: 'Стартовые затраты',
      value: report.totalOneTimeExpenses,
      hint: 'CAPEX + разовые работы',
      tone: report.totalOneTimeExpenses > budget && budget > 0 ? 'danger' : 'ok',
    },
    {
      id: 'annual',
      title: 'Итог за год',
      value: report.grandTotalAnnual,
      hint: 'разовые + годовые расходы',
      tone: 'info',
    },
    {
      id: 'monthly',
      title: 'Ежемесячно',
      value: monthlyRunRate,
      hint: 'OPEX + электричество',
      tone: monthlyRunRate > 0 ? 'ok' : 'warning',
    },
    {
      id: 'budget-used',
      title: 'Бюджет CAPEX',
      value: budget > 0 ? budgetUsedPercent : '—',
      suffix: budget > 0 ? '%' : undefined,
      hint: budget > 0 ? 'использовано' : 'не задан',
      tone: budgetRemainder < 0 ? 'danger' : budgetUsedPercent >= 85 ? 'warning' : 'ok',
    },
    {
      id: 'readiness',
      title: 'Готовность',
      value: readiness.percent,
      suffix: '%',
      hint: readiness.summary,
      tone: readiness.blockers.length ? 'warning' : 'ok',
    },
    {
      id: 'quality',
      title: 'Качество данных',
      value: validation.score,
      suffix: '/100',
      hint: validation.summary,
      tone: validation.errors.length ? 'danger' : validation.score >= 80 ? 'ok' : 'warning',
    },
  ];

  return {
    readinessPercent: readiness.percent,
    dataQualityScore: validation.score,
    budget,
    capitalTotal: report.capitalTotal,
    budgetUsedPercent,
    budgetRemainder,
    oneTimeTotal: report.totalOneTimeExpenses,
    monthlyRunRate,
    annualTotal: report.grandTotalAnnual,
    recurringAnnualTotal,
    topCapitalItems,
    recentEvents: [...(state.projectEvents ?? [])].slice(0, 4),
    metrics,
    insights: insights.slice(0, 5),
    statusLabel: makeStatusLabel(readiness.percent, validation.score, validation.errors.length > 0),
  };
}
