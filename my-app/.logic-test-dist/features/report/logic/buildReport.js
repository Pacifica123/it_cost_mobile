"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReport = buildReport;
const selectors_1 = require("../../../store/data/selectors");
const MONTHS_PER_YEAR = 12;
const sumCapitalByKind = (state, kind) => state.capitalData
    .filter((item) => item.kind === kind)
    .reduce((sum, item) => sum + item.quantity * item.price, 0);
const hasClientWorkplaces = (state) => {
    const categoryNamesById = new Map(state.categories.map((category) => [category.id, category.name.toLowerCase()]));
    return state.capitalData.some((item) => {
        const categoryName = categoryNamesById.get(item.categoryId) ?? '';
        const itemName = item.name.toLowerCase();
        return categoryName.includes('клиент') || itemName.includes('пк') || itemName.includes('рабоч');
    });
};
const buildInsights = (params) => {
    const { state, capitalTotal, oneTimeOperatingTotal, periodicTotalMonthly, electricityTotalMonthly, hardwareTotal, softwareTotal, } = params;
    const insights = [];
    insights.push(state.capitalData.length > 0
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
        });
    insights.push(hardwareTotal > 0
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
        });
    insights.push(softwareTotal > 0
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
        });
    insights.push(hasClientWorkplaces(state)
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
        });
    insights.push(periodicTotalMonthly > 0
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
        });
    insights.push(electricityTotalMonthly > 0
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
        });
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
function buildReport(state) {
    const oneTimeOperating = (0, selectors_1.selectOperatingByMode)(state, 'oneTime');
    const periodicOperating = (0, selectors_1.selectOperatingByMode)(state, 'periodic');
    const capitalTotal = (0, selectors_1.selectCapitalTotal)(state);
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
        groupedCapital: (0, selectors_1.groupByResolvedCategory)(state.capitalData, state.categories),
        groupedOneTimeOperating: (0, selectors_1.groupByResolvedCategory)(oneTimeOperating, state.categories),
        groupedPeriodicOperating: (0, selectors_1.groupByResolvedCategory)(periodicOperating, state.categories),
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
