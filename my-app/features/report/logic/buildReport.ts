import type { CapitalEquipment, DataState, OperatingEquipment } from '../../../store/data/types';
import { groupByResolvedCategory, selectCapitalTotal, selectOperatingByMode } from '../../../store/data/selectors';
import type { BuiltReport, ReportInsight } from '../types';

const MONTHS_PER_YEAR = 12;

const sumCapitalByKind = (state: DataState, kind: 'hardware' | 'software') =>
  state.capitalData
    .filter((item) => item.kind === kind)
    .reduce((sum, item) => sum + item.quantity * item.price, 0);

const hasClientWorkplaces = (state: DataState) => {
  const categoryNamesById = new Map(state.categories.map((category) => [category.id, category.name.toLowerCase()]));

  return state.capitalData.some((item) => {
    const categoryName = categoryNamesById.get(item.categoryId) ?? '';
    const itemName = item.name.toLowerCase();
    return categoryName.includes('клиент') || itemName.includes('пк') || itemName.includes('рабоч');
  });
};

const buildInsights = (params: {
  state: DataState;
  capitalTotal: number;
  oneTimeOperatingTotal: number;
  periodicTotalMonthly: number;
  electricityTotalMonthly: number;
  hardwareTotal: number;
  softwareTotal: number;
}): ReportInsight[] => {
  const {
    state,
    capitalTotal,
    oneTimeOperatingTotal,
    periodicTotalMonthly,
    electricityTotalMonthly,
    hardwareTotal,
    softwareTotal,
  } = params;

  const insights: ReportInsight[] = [];

  insights.push(
    state.capitalData.length > 0
      ? {
          id: 'capex-filled',
          tone: 'ok',
          title: 'CAPEX заполнен',
          description: `В расчёте есть ${state.capitalData.length} позиций капитальных затрат.`,
        }
      : {
          id: 'capex-empty',
          tone: 'warning',
          title: 'Нет капитальных затрат',
          description: 'Добавьте хотя бы серверы, клиентские устройства, сеть или лицензии, иначе итог будет неполным.',
        }
  );

  insights.push(
    hardwareTotal > 0
      ? {
          id: 'hardware-filled',
          tone: 'ok',
          title: 'ТО учтено',
          description: 'В капитальных затратах есть техническое оборудование.',
        }
      : {
          id: 'hardware-empty',
          tone: 'warning',
          title: 'ТО не учтено',
          description: 'Добавьте техническое оборудование, чтобы GA/AHP и отчёт не опирались только на ПО.',
        }
  );

  insights.push(
    softwareTotal > 0
      ? {
          id: 'software-filled',
          tone: 'ok',
          title: 'ПО учтено',
          description: 'В капитальных затратах есть лицензии или программные продукты.',
        }
      : {
          id: 'software-empty',
          tone: 'warning',
          title: 'ПО не учтено',
          description: 'Добавьте лицензии и программные продукты, чтобы разделение ТО/ПО было видно в отчёте.',
        }
  );

  insights.push(
    hasClientWorkplaces(state)
      ? {
          id: 'clients-filled',
          tone: 'ok',
          title: 'Клиентские места найдены',
          description: 'В данных есть позиции, похожие на рабочие места пользователей.',
        }
      : {
          id: 'clients-empty',
          tone: 'info',
          title: 'Клиентские места не выделены',
          description: 'Для корректной работы GA лучше явно добавить ПК, тонкие клиенты или рабочие места.',
        }
  );

  insights.push(
    periodicTotalMonthly > 0
      ? {
          id: 'opex-filled',
          tone: 'ok',
          title: 'OPEX заполнен',
          description: 'Периодические расходы будут корректно нормализованы до годового горизонта.',
        }
      : {
          id: 'opex-empty',
          tone: 'warning',
          title: 'Нет ежемесячного OPEX',
          description: 'Добавьте подписки, сопровождение, аренду или администрирование, чтобы годовой итог был реалистичнее.',
        }
  );

  insights.push(
    electricityTotalMonthly > 0
      ? {
          id: 'electricity-filled',
          tone: 'ok',
          title: 'Электроэнергия рассчитана',
          description: 'Энергопотребление включено в годовую стоимость владения.',
        }
      : {
          id: 'electricity-empty',
          tone: 'info',
          title: 'Электроэнергия пока равна нулю',
          description: 'Запустите раздел электропотребления, если нужно показать TCO ближе к реальной эксплуатации.',
        }
  );

  if (capitalTotal > 0 && oneTimeOperatingTotal > capitalTotal * 0.35) {
    insights.push({
      id: 'one-time-high',
      tone: 'info',
      title: 'Высокая доля разовых работ',
      description: 'Миграция, тестирование или внедрение заметно влияют на стартовую стоимость проекта.',
    });
  }

  return insights;
};

export function buildReport(state: DataState): BuiltReport {
  const oneTimeOperating = selectOperatingByMode(state, 'oneTime');
  const periodicOperating = selectOperatingByMode(state, 'periodic');
  const capitalTotal = selectCapitalTotal(state);
  const oneTimeOperatingTotal = oneTimeOperating.reduce((sum, item) => sum + item.price, 0);
  const periodicTotalMonthly = periodicOperating.reduce((sum, item) => sum + item.price, 0);
  const periodicTotalAnnual = periodicTotalMonthly * MONTHS_PER_YEAR;
  const electricityTotalMonthly = state.electricityTotal;
  const electricityTotalAnnual = electricityTotalMonthly * MONTHS_PER_YEAR;
  const totalOneTimeExpenses = capitalTotal + oneTimeOperatingTotal;
  const grandTotalAnnual = totalOneTimeExpenses + periodicTotalAnnual + electricityTotalAnnual;
  const hardwareTotal = sumCapitalByKind(state, 'hardware');
  const softwareTotal = sumCapitalByKind(state, 'software');
  const insights = buildInsights({
    state,
    capitalTotal,
    oneTimeOperatingTotal,
    periodicTotalMonthly,
    electricityTotalMonthly,
    hardwareTotal,
    softwareTotal,
  });
  const blockingWarnings = insights.filter((insight) => insight.tone === 'warning').length;
  const summaryText = blockingWarnings
    ? 'Расчёт можно использовать как черновой, но перед итоговой выгрузкой стоит закрыть предупреждения: добавить недостающие категории, OPEX или разделить ТО/ПО.'
    : 'Расчёт выглядит достаточно полным для сводного отчёта: учтены капитальные затраты, эксплуатационные расходы и ключевые разделы инфраструктуры.';

  return {
    capitalTotal,
    oneTimeOperating,
    periodicOperating,
    oneTimeOperatingTotal,
    periodicTotalMonthly,
    periodicTotalAnnual,
    electricityTotalMonthly,
    electricityTotalAnnual,
    totalOneTimeExpenses,
    grandTotalAnnual,
    groupedCapital: groupByResolvedCategory<CapitalEquipment>(state.capitalData, state.categories),
    groupedOneTimeOperating: groupByResolvedCategory<OperatingEquipment>(oneTimeOperating, state.categories),
    groupedPeriodicOperating: groupByResolvedCategory<OperatingEquipment>(periodicOperating, state.categories),
    hardwareTotal,
    softwareTotal,
    capitalItemsCount: state.capitalData.length,
    operatingItemsCount: state.operatingData.length,
    insights,
    summaryText,
    assumptions: {
      periodicMultiplier: MONTHS_PER_YEAR,
      electricityMultiplier: MONTHS_PER_YEAR,
    },
  };
}
