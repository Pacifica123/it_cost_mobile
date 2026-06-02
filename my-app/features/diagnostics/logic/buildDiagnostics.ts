import type { DataState } from '../../../store/data/types';
import { formatExchangeRate } from '../../../shared/utils/currency';
import { buildProjectReadiness } from '../../project/logic/readiness';
import { validateProjectData } from '../../validation/logic/validateProjectData';

export type DiagnosticItem = {
  id: string;
  title: string;
  value: string;
  tone: 'ok' | 'warning' | 'danger' | 'info';
};

export type DiagnosticReport = {
  schemaVersion: number;
  storageKey: string;
  estimatedSizeBytes: number;
  estimatedSizeLabel: string;
  items: DiagnosticItem[];
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
};

export function buildDiagnostics(state: DataState): DiagnosticReport {
  const readiness = buildProjectReadiness(state);
  const validation = validateProjectData(state);
  const serialized = JSON.stringify(state);
  const estimatedSizeBytes = serialized.length;
  const hasRouteRisk = false;

  const items: DiagnosticItem[] = [
    {
      id: 'schema',
      title: 'Версия структуры данных',
      value: String(state.schemaVersion ?? 0),
      tone: (state.schemaVersion ?? 0) >= 5 ? 'ok' : 'warning',
    },
    {
      id: 'storage',
      title: 'Ключ локального сохранения',
      value: 'itcost_store_v5',
      tone: 'info',
    },
    {
      id: 'size',
      title: 'Оценочный размер данных',
      value: formatBytes(estimatedSizeBytes),
      tone: estimatedSizeBytes > 700_000 ? 'warning' : 'ok',
    },
    {
      id: 'readiness',
      title: 'Готовность расчёта',
      value: `${readiness.percent}%`,
      tone: readiness.blockers.length ? 'warning' : 'ok',
    },
    {
      id: 'quality',
      title: 'Качество данных',
      value: `${validation.score}/100`,
      tone: validation.errors.length ? 'danger' : validation.score >= 80 ? 'ok' : 'warning',
    },
    {
      id: 'counts',
      title: 'Позиции CAPEX/OPEX',
      value: `${state.capitalData.length}/${state.operatingData.length}`,
      tone: state.capitalData.length ? 'ok' : 'warning',
    },
    {
      id: 'history',
      title: 'Журнал действий',
      value: `${state.projectEvents.length} записей`,
      tone: state.projectEvents.length > 70 ? 'warning' : 'ok',
    },
    {
      id: 'undo',
      title: 'Стек отмены/повтора',
      value: `${state.undoStack.length}/${state.redoStack.length}`,
      tone: 'info',
    },

    {
      id: 'projects',
      title: 'Сохранённые проекты',
      value: `${state.savedProjects?.length ?? 0} шт.`,
      tone: (state.savedProjects?.length ?? 0) ? 'ok' : 'info',
    },
    {
      id: 'backups',
      title: 'Резервные копии',
      value: `${state.projectBackups.length} шт.`,
      tone: state.projectBackups.length ? 'ok' : 'info',
    },
    {
      id: 'exchangeRates',
      title: 'Курсы валют',
      value: `${formatExchangeRate('USD', state.exchangeRates)} · ${formatExchangeRate('EUR', state.exchangeRates)}`,
      tone: state.exchangeRates.rates.USD && state.exchangeRates.rates.EUR ? 'ok' : 'warning',
    },
    {
      id: 'routes',
      title: 'Риск дублей роутера',
      value: hasRouteRisk ? 'требует проверки' : 'контролируется preflight',
      tone: hasRouteRisk ? 'warning' : 'ok',
    },
  ];

  return {
    schemaVersion: state.schemaVersion ?? 0,
    storageKey: 'itcost_store_v5',
    estimatedSizeBytes,
    estimatedSizeLabel: formatBytes(estimatedSizeBytes),
    items,
  };
}
