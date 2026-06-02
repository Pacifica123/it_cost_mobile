"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareOptimizationMethods = compareOptimizationMethods;
const currency_1 = require("../../../shared/utils/currency");
const selectors_1 = require("../../../store/data/selectors");
const optimization_1 = require("../../optimization/logic/optimization");
const describeSolution = (solution) => {
    if (!solution)
        return 'нет результата';
    const firstItems = solution.selectedItems.slice(0, 2).map((item) => item.name).join(', ');
    const suffix = solution.selectedItems.length > 2 ? ` + ещё ${solution.selectedItems.length - 2}` : '';
    return `${(0, currency_1.formatCurrencyRU)(solution.totalCost)} · ${solution.clientSeats} раб. мест · ${firstItems}${suffix}`;
};
const dominates = (a, b) => {
    const noWorse = a.totalCost <= b.totalCost &&
        a.categoryCoverage >= b.categoryCoverage &&
        a.clientSeats >= b.clientSeats;
    const better = a.totalCost < b.totalCost ||
        a.categoryCoverage > b.categoryCoverage ||
        a.clientSeats > b.clientSeats;
    return noWorse && better;
};
const buildParetoFront = (solutions) => solutions.filter((candidate) => !solutions.some((other) => other !== candidate && dominates(other, candidate)));
const bestByHybrid = (solutions) => [...solutions].sort((a, b) => (b.hybridScore ?? b.score) - (a.hybridScore ?? a.score))[0];
function compareOptimizationMethods(state) {
    const capitalTotal = (0, selectors_1.selectCapitalTotal)(state);
    if (state.capitalData.length < 2 || capitalTotal <= 0) {
        return {
            status: 'not_enough_data',
            budgetUsed: 0,
            candidateCount: state.capitalData.length,
            rows: [],
            paretoCount: 0,
            conclusion: 'Для сравнения методов нужно минимум две CAPEX-позиции с ненулевой стоимостью.',
            notes: [
                'Добавьте несколько альтернатив оборудования или ПО.',
                'После этого можно сравнить GA, AHP-переоценку, гибридный рейтинг и Pareto-фронт.',
            ],
        };
    }
    const budgetUsed = Math.max(1, Math.round(state.projectMeta?.budget || capitalTotal));
    const report = (0, optimization_1.runOptimization)({
        capitalData: state.capitalData,
        categories: state.categories,
        scope: 'all',
        params: {
            maxBudget: budgetUsed,
            targetClientSeats: Math.max(1, Math.round(state.projectMeta?.targetClientSeats || 10)),
            requiredCategoryIds: [],
            weights: {
                cost: 0.35,
                categoryCoverage: 0.3,
                clientSeats: 0.25,
                itemCount: 0.1,
            },
            generations: 25,
            popSize: 24,
            seed: 11,
            topSolutionsLimit: 8,
        },
    });
    if (report.status !== 'ok' || !report.best) {
        return {
            status: 'not_enough_data',
            budgetUsed,
            candidateCount: report.candidateCount,
            rows: [],
            paretoCount: 0,
            conclusion: 'Методы не удалось сравнить: GA не нашёл допустимые конфигурации на текущих данных.',
            notes: [
                report.warning ?? 'Проверьте стоимость позиций и категории.',
                'Попробуйте добавить больше вариантов или снизить ограничения в разделе генетического подбора.',
            ],
        };
    }
    const gaBest = report.best;
    const ahpBest = report.ahpRanking[0] ?? report.best;
    const hybridBest = bestByHybrid(report.ahpRanking.length ? report.ahpRanking : report.topSolutions) ?? report.best;
    const paretoFront = buildParetoFront(report.topSolutions);
    const paretoBest = paretoFront[0] ?? report.best;
    const sameWinner = gaBest.mask.join('') === ahpBest.mask.join('') && gaBest.mask.join('') === hybridBest.mask.join('');
    const conclusion = sameWinner
        ? 'GA, AHP-переоценка и гибридный рейтинг сходятся на одном варианте. Это хороший аргумент в пользу выбранной конфигурации.'
        : 'Методы дают разные лидирующие варианты. Это нормально: GA оптимизирует по весам и ограничениям, AHP переоценивает топ-кандидатов, а Pareto показывает набор недоминируемых решений без единственного победителя.';
    return {
        status: 'ok',
        budgetUsed,
        candidateCount: report.candidateCount,
        paretoCount: paretoFront.length,
        rows: [
            {
                id: 'ga',
                method: 'GA',
                winner: describeSolution(gaBest),
                scoreLabel: `GA score ${gaBest.score.toFixed(3)}`,
                description: 'Лучший вариант по генетическому алгоритму с учётом бюджета, покрытия категорий, клиентских мест и размера набора.',
            },
            {
                id: 'ahp',
                method: 'AHP после GA',
                winner: describeSolution(ahpBest),
                scoreLabel: `AHP score ${(ahpBest.ahpScore ?? ahpBest.score).toFixed(3)}`,
                description: 'Тот же пул кандидатов переоценивается по нормализованным критериям, чтобы показать экспертное ранжирование.',
            },
            {
                id: 'hybrid',
                method: 'Гибрид GA+AHP',
                winner: describeSolution(hybridBest),
                scoreLabel: `Hybrid ${(hybridBest.hybridScore ?? hybridBest.score).toFixed(3)}`,
                description: 'Компромисс между результатом генетического поиска и AHP-переоценкой.',
            },
            {
                id: 'pareto',
                method: 'Pareto-фронт',
                winner: describeSolution(paretoBest),
                scoreLabel: `${paretoFront.length} недоминируемых`,
                description: 'Показывает варианты, которые нельзя однозначно улучшить одновременно по стоимости, покрытию категорий и клиентским местам.',
            },
        ],
        conclusion,
        notes: [
            `Для автоматического сравнения использован бюджет ${(0, currency_1.formatCurrencyRU)(budgetUsed)} из паспорта проекта или текущей суммы CAPEX.`,
            'Этот экран нужен не для окончательного выбора, а для объяснения различий между методами в отчёте.',
        ],
    };
}
