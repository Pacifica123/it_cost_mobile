import type { DataState } from '../../../store/data/types';
import { selectOperatingByMode } from '../../../store/data/selectors';

export type ReadinessStatus = 'ok' | 'warning' | 'missing';

export type ReadinessCheck = {
  id: string;
  title: string;
  description: string;
  status: ReadinessStatus;
  weight: number;
};

export type ProjectReadiness = {
  percent: number;
  completedWeight: number;
  totalWeight: number;
  checks: ReadinessCheck[];
  blockers: ReadinessCheck[];
  warnings: ReadinessCheck[];
  summary: string;
};

const includesClientWorkplace = (state: DataState) => {
  const categoryNameById = new Map(
    state.categories.map((category) => [category.id, category.name.toLowerCase()])
  );

  return state.capitalData.some((item) => {
    const categoryName = categoryNameById.get(item.categoryId) ?? '';
    const name = item.name.toLowerCase();
    return (
      categoryName.includes('клиент') ||
      categoryName.includes('рабоч') ||
      name.includes('пк') ||
      name.includes('pc') ||
      name.includes('ноутбук') ||
      name.includes('рабоч') ||
      name.includes('клиент')
    );
  });
};

const sumCapitalByKind = (state: DataState, kind: 'hardware' | 'software') =>
  state.capitalData
    .filter((item) => item.kind === kind)
    .reduce((sum, item) => sum + item.quantity * item.price, 0);

const checkScore = (check: ReadinessCheck) => {
  if (check.status === 'ok') return check.weight;
  if (check.status === 'warning') return check.weight * 0.5;
  return 0;
};

export function buildProjectReadiness(state: DataState): ProjectReadiness {
  const hardwareTotal = sumCapitalByKind(state, 'hardware');
  const softwareTotal = sumCapitalByKind(state, 'software');
  const periodicOpex = selectOperatingByMode(state, 'periodic');
  const oneTimeOpex = selectOperatingByMode(state, 'oneTime');
  const periodicOpexTotal = periodicOpex.reduce((sum, item) => sum + item.price, 0);
  const oneTimeOpexTotal = oneTimeOpex.reduce((sum, item) => sum + item.price, 0);
  const hasClient = includesClientWorkplace(state);

  const checks: ReadinessCheck[] = [
    {
      id: 'capex',
      title: 'CAPEX заполнен',
      description: state.capitalData.length > 0
        ? `Добавлено ${state.capitalData.length} позиций капитальных затрат.`
        : 'Добавьте хотя бы одну позицию капитальных затрат.',
      status: state.capitalData.length > 0 ? 'ok' : 'missing',
      weight: 20,
    },
    {
      id: 'hardware',
      title: 'ТО выделено отдельно',
      description: hardwareTotal > 0
        ? 'Техническое оборудование участвует в расчёте.'
        : 'Добавьте серверы, ПК, сеть или другое техническое оборудование.',
      status: hardwareTotal > 0 ? 'ok' : 'missing',
      weight: 15,
    },
    {
      id: 'software',
      title: 'ПО выделено отдельно',
      description: softwareTotal > 0
        ? 'Лицензии и программные продукты участвуют в расчёте.'
        : 'Добавьте лицензии или программные продукты, чтобы разделение ТО/ПО было видно.',
      status: softwareTotal > 0 ? 'ok' : 'missing',
      weight: 15,
    },
    {
      id: 'client-seats',
      title: 'Клиентские места распознаны',
      description: hasClient
        ? 'В данных есть позиции, похожие на рабочие места пользователей.'
        : 'Для GA лучше добавить ПК, ноутбуки, терминалы или рабочие места.',
      status: hasClient ? 'ok' : 'warning',
      weight: 12,
    },
    {
      id: 'periodic-opex',
      title: 'Ежемесячный OPEX заполнен',
      description: periodicOpexTotal > 0
        ? 'Периодические расходы включены в годовую стоимость владения.'
        : 'Добавьте подписки, сопровождение, аренду или администрирование.',
      status: periodicOpexTotal > 0 ? 'ok' : 'warning',
      weight: 14,
    },
    {
      id: 'one-time-opex',
      title: 'Разовые работы проверены',
      description: oneTimeOpexTotal > 0
        ? 'Разовые работы внедрения, миграции или тестирования учтены.'
        : 'Разовые работы можно оставить нулевыми, но для точного отчёта лучше указать их явно.',
      status: oneTimeOpexTotal > 0 ? 'ok' : 'warning',
      weight: 8,
    },
    {
      id: 'electricity',
      title: 'Электропотребление рассчитано',
      description: state.electricityTotal > 0
        ? 'Энергопотребление добавлено в итоговый годовой TCO.'
        : 'Запустите раздел электропотребления, если нужно показать эксплуатационные затраты точнее.',
      status: state.electricityTotal > 0 ? 'ok' : 'warning',
      weight: 8,
    },
    {
      id: 'analysis-data',
      title: 'Данных достаточно для анализа',
      description: state.capitalData.length >= 3
        ? 'Есть база для AHP/GA и сравнения конфигураций.'
        : 'Для AHP/GA желательно иметь минимум 3 позиции капитальных затрат.',
      status: state.capitalData.length >= 3 ? 'ok' : 'warning',
      weight: 8,
    },
  ];

  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const completedWeight = checks.reduce((sum, check) => sum + checkScore(check), 0);
  const percent = Math.round((completedWeight / Math.max(1, totalWeight)) * 100);
  const blockers = checks.filter((check) => check.status === 'missing');
  const warnings = checks.filter((check) => check.status === 'warning');
  const summary = blockers.length > 0
    ? 'Расчёт пока не готов: сначала закройте обязательные пробелы в CAPEX, ТО и ПО.'
    : warnings.length > 0
      ? 'Расчёт можно использовать как черновой, но перед итоговой выгрузкой лучше закрыть предупреждения.'
      : 'Расчёт выглядит готовым для демонстрации и формирования отчёта.';

  return {
    percent,
    completedWeight,
    totalWeight,
    checks,
    blockers,
    warnings,
    summary,
  };
}
