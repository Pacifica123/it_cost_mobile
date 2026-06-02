"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOptimizationCandidates = buildOptimizationCandidates;
exports.runOptimization = runOptimization;
const catalogRules_1 = require("../../../store/data/catalogRules");
const DEFAULT_WEIGHTS = {
    cost: 0.35,
    categoryCoverage: 0.3,
    clientSeats: 0.25,
    itemCount: 0.1,
};
const DEFAULT_GA = {
    popSize: 40,
    generations: 80,
    mutationRate: 0.04,
    elite: 2,
    seed: 42,
    topSolutionsLimit: 8,
};
const CLIENT_WORDS = [
    'client',
    'workstation',
    'desktop',
    'notebook',
    'laptop',
    'pc',
    'пк',
    'ноутбук',
    'рабоч',
    'клиент',
    'терминал',
];
const normalizeWeights = (weights) => {
    const merged = { ...DEFAULT_WEIGHTS, ...(weights ?? {}) };
    const nonNegative = {
        cost: Math.max(0, Number(merged.cost) || 0),
        categoryCoverage: Math.max(0, Number(merged.categoryCoverage) || 0),
        clientSeats: Math.max(0, Number(merged.clientSeats) || 0),
        itemCount: Math.max(0, Number(merged.itemCount) || 0),
    };
    const sum = nonNegative.cost +
        nonNegative.categoryCoverage +
        nonNegative.clientSeats +
        nonNegative.itemCount;
    if (sum <= 0)
        return DEFAULT_WEIGHTS;
    return {
        cost: nonNegative.cost / sum,
        categoryCoverage: nonNegative.categoryCoverage / sum,
        clientSeats: nonNegative.clientSeats / sum,
        itemCount: nonNegative.itemCount / sum,
    };
};
const seededRandom = (seedRaw) => {
    let seed = Math.trunc(seedRaw) || DEFAULT_GA.seed;
    return () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 0x100000000;
    };
};
const shuffle = (items, rand) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rand() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};
const scopeToKind = (scope) => {
    if (scope === 'technical')
        return 'hardware';
    if (scope === 'software')
        return 'software';
    return null;
};
const hasClientRole = (item, categoryName) => {
    const text = `${item.name} ${categoryName}`.toLowerCase();
    return CLIENT_WORDS.some((word) => text.includes(word));
};
function buildOptimizationCandidates(items, categories, scope) {
    const requestedKind = scopeToKind(scope);
    return items
        .map((item) => {
        const categoryName = (0, catalogRules_1.getCategoryNameById)(categories, item.categoryId);
        const kind = item.kind ?? (0, catalogRules_1.inferCapitalKindByText)(categoryName, item.name);
        const quantity = Math.max(0, Number(item.quantity) || 0);
        const price = Math.max(0, Number(item.price) || 0);
        const normalized = {
            ...item,
            quantity,
            price,
            kind,
            categoryName,
            totalCost: quantity * price,
            clientSeats: hasClientRole(item, categoryName) ? quantity : 0,
        };
        return normalized;
    })
        .filter((item) => item.quantity > 0)
        .filter((item) => (requestedKind ? item.kind === requestedKind : true));
}
const maskKey = (mask) => mask.join('');
const maskHasAny = (mask) => mask.some((bit) => bit === 1);
const selectedFromMask = (items, mask) => items.filter((_, index) => mask[index] === 1);
const uniqueCategoryIds = (items) => Array.from(new Set(items.map((item) => item.categoryId))).sort();
const evaluateMask = (items, mask, availableCategoryIds, requiredCategoryIds, maxBudget, targetClientSeats, weights) => {
    if (!maskHasAny(mask))
        return null;
    const selectedItems = selectedFromMask(items, mask);
    const totalCost = selectedItems.reduce((sum, item) => sum + item.totalCost, 0);
    const selectedCategoryIds = uniqueCategoryIds(selectedItems);
    const selectedCategorySet = new Set(selectedCategoryIds);
    const clientSeats = selectedItems.reduce((sum, item) => sum + item.clientSeats, 0);
    if (maxBudget > 0 && totalCost > maxBudget)
        return null;
    if (requiredCategoryIds.some((categoryId) => !selectedCategorySet.has(categoryId)))
        return null;
    const categoryBase = requiredCategoryIds.length > 0 ? requiredCategoryIds : availableCategoryIds;
    const categoryCoverage = categoryBase.length > 0
        ? categoryBase.filter((categoryId) => selectedCategorySet.has(categoryId)).length / categoryBase.length
        : 1;
    const costUtility = maxBudget > 0
        ? Math.max(0, Math.min(1, 1 - totalCost / maxBudget))
        : 1 / (1 + totalCost);
    const clientSeatUtility = targetClientSeats > 0
        ? Math.max(0, 1 - Math.abs(clientSeats - targetClientSeats) / Math.max(targetClientSeats, 1))
        : Math.min(1, clientSeats / Math.max(1, items.reduce((sum, item) => sum + item.clientSeats, 0)));
    const itemCount = selectedItems.length / Math.max(1, items.length);
    const criteria = {
        costUtility,
        categoryCoverage,
        clientSeats: clientSeatUtility,
        itemCount,
    };
    const score = criteria.costUtility * weights.cost +
        criteria.categoryCoverage * weights.categoryCoverage +
        criteria.clientSeats * weights.clientSeats +
        criteria.itemCount * weights.itemCount;
    return {
        mask,
        selectedItems,
        totalCost,
        categoryCoverage,
        selectedCategoryIds,
        clientSeats,
        criteria,
        score,
    };
};
const repairMask = (mask, items, maxBudget, rand) => {
    const next = [...mask];
    let selected = selectedFromMask(items, next);
    let totalCost = selected.reduce((sum, item) => sum + item.totalCost, 0);
    while (maxBudget > 0 && totalCost > maxBudget && selected.length > 0) {
        const selectedIndexes = next
            .map((bit, index) => (bit ? index : -1))
            .filter((index) => index >= 0)
            .sort((a, b) => items[b].totalCost - items[a].totalCost);
        const expensiveHalf = selectedIndexes.slice(0, Math.max(1, Math.ceil(selectedIndexes.length / 2)));
        const removeIndex = expensiveHalf[Math.floor(rand() * expensiveHalf.length)];
        next[removeIndex] = 0;
        selected = selectedFromMask(items, next);
        totalCost = selected.reduce((sum, item) => sum + item.totalCost, 0);
    }
    return next;
};
const rankSolutions = (candidates, topSolutionsLimit) => {
    const sorted = [...candidates].sort((a, b) => b.score - a.score || a.totalCost - b.totalCost);
    return sorted.slice(0, topSolutionsLimit).map((item, index) => ({ ...item, rank: index + 1 }));
};
const applyAhpRanking = (solutions, weights) => {
    if (solutions.length === 0)
        return [];
    const costs = solutions.map((solution) => solution.totalCost);
    const seats = solutions.map((solution) => solution.clientSeats);
    const coverage = solutions.map((solution) => solution.categoryCoverage);
    const count = solutions.map((solution) => solution.selectedItems.length);
    const maxCost = Math.max(...costs, 1);
    const minCost = Math.min(...costs, maxCost);
    const costRange = Math.max(maxCost - minCost, 1);
    const maxSeats = Math.max(...seats, 1);
    const maxCoverage = Math.max(...coverage, 1);
    const maxCount = Math.max(...count, 1);
    return solutions
        .map((solution) => {
        const costUtility = 1 - (solution.totalCost - minCost) / costRange;
        const ahpScore = costUtility * weights.cost +
            (solution.categoryCoverage / maxCoverage) * weights.categoryCoverage +
            (solution.clientSeats / maxSeats) * weights.clientSeats +
            (solution.selectedItems.length / maxCount) * weights.itemCount;
        const hybridScore = solution.score * 0.55 + ahpScore * 0.45;
        return { ...solution, ahpScore, hybridScore };
    })
        .sort((a, b) => (b.ahpScore ?? 0) - (a.ahpScore ?? 0))
        .map((solution, index) => ({ ...solution, rank: index + 1 }));
};
function runOptimization(input) {
    const ga = {
        popSize: input.params.popSize ?? DEFAULT_GA.popSize,
        generations: input.params.generations ?? DEFAULT_GA.generations,
        mutationRate: input.params.mutationRate ?? DEFAULT_GA.mutationRate,
        elite: input.params.elite ?? DEFAULT_GA.elite,
        seed: input.params.seed ?? DEFAULT_GA.seed,
        topSolutionsLimit: input.params.topSolutionsLimit ?? DEFAULT_GA.topSolutionsLimit,
    };
    const weights = normalizeWeights(input.params.weights);
    const candidates = buildOptimizationCandidates(input.capitalData, input.categories, input.scope);
    const availableCategoryIds = uniqueCategoryIds(candidates);
    const requiredCategoryIds = Array.from(new Set(input.params.requiredCategoryIds))
        .filter((categoryId) => availableCategoryIds.includes(categoryId));
    const maxBudget = Math.max(0, Number(input.params.maxBudget) || 0);
    const targetClientSeats = Math.max(0, Number(input.params.targetClientSeats) || 0);
    if (candidates.length === 0) {
        return {
            status: 'empty',
            scope: input.scope,
            candidateCount: 0,
            feasibleInitialCount: 0,
            generationsRan: 0,
            terminationReason: 'no_feasible_solution',
            weights,
            requiredCategoryIds,
            categoriesAvailable: [],
            topSolutions: [],
            ahpRanking: [],
            history: [],
            warning: 'Нет элементов для выбранной области анализа.',
        };
    }
    const rand = seededRandom(ga.seed);
    const archive = new Map();
    const history = [];
    const registerMask = (maskRaw) => {
        const mask = repairMask(maskRaw, candidates, maxBudget, rand);
        const solution = evaluateMask(candidates, mask, availableCategoryIds, requiredCategoryIds, maxBudget, targetClientSeats, weights);
        if (!solution)
            return false;
        const key = maskKey(mask);
        const previous = archive.get(key);
        if (!previous || solution.score > previous.score)
            archive.set(key, solution);
        return true;
    };
    const singletonPopulation = candidates.map((_, index) => candidates.map((_item, itemIndex) => (itemIndex === index ? 1 : 0)));
    singletonPopulation.forEach(registerMask);
    const greedyOrder = [...candidates.keys()].sort((a, b) => {
        const aCost = Math.max(candidates[a].totalCost, 1);
        const bCost = Math.max(candidates[b].totalCost, 1);
        const aValue = (candidates[a].clientSeats + 1) / aCost;
        const bValue = (candidates[b].clientSeats + 1) / bCost;
        return bValue - aValue;
    });
    const greedyMask = candidates.map(() => 0);
    for (const index of greedyOrder) {
        greedyMask[index] = 1;
        if (!registerMask(greedyMask))
            greedyMask[index] = 0;
    }
    let population = Array.from(archive.values()).map((solution) => solution.mask);
    let randomAttempts = 0;
    const maxRandomAttempts = Math.max(ga.popSize * 20, candidates.length * 8);
    while (population.length < ga.popSize && randomAttempts < maxRandomAttempts) {
        const mask = candidates.map(() => (rand() > 0.5 ? 1 : 0));
        registerMask(mask);
        population = Array.from(archive.values()).map((solution) => solution.mask);
        randomAttempts += 1;
    }
    if (archive.size === 0) {
        return {
            status: 'no_feasible',
            scope: input.scope,
            candidateCount: candidates.length,
            feasibleInitialCount: 0,
            generationsRan: 0,
            terminationReason: 'no_feasible_solution',
            weights,
            requiredCategoryIds,
            categoriesAvailable: availableCategoryIds,
            topSolutions: [],
            ahpRanking: [],
            history: [],
            warning: 'Не найдено допустимых решений. Ослабь бюджет или обязательные категории.',
        };
    }
    const feasibleInitialCount = archive.size;
    population = Array.from(archive.values()).map((solution) => solution.mask);
    while (population.length < ga.popSize) {
        population.push(population[Math.floor(rand() * population.length)]);
    }
    const solutionScore = (mask) => evaluateMask(candidates, mask, availableCategoryIds, requiredCategoryIds, maxBudget, targetClientSeats, weights)?.score ?? -1;
    let bestScore = Math.max(...Array.from(archive.values()).map((solution) => solution.score));
    for (let generation = 1; generation <= ga.generations; generation += 1) {
        const repaired = population.map((mask) => repairMask(mask, candidates, maxBudget, rand));
        repaired.forEach(registerMask);
        const sorted = [...repaired].sort((a, b) => solutionScore(b) - solutionScore(a));
        const nextPopulation = sorted.slice(0, Math.max(1, ga.elite));
        const tournament = () => {
            const picks = shuffle(sorted, rand).slice(0, Math.min(3, sorted.length));
            return picks.sort((a, b) => solutionScore(b) - solutionScore(a))[0];
        };
        while (nextPopulation.length < ga.popSize) {
            const left = tournament();
            const right = tournament();
            const point = candidates.length <= 1 ? 1 : Math.max(1, Math.floor(rand() * candidates.length));
            const child = [...left.slice(0, point), ...right.slice(point)];
            const mutated = child.map((bit) => (rand() < ga.mutationRate ? 1 - bit : bit));
            const fixed = repairMask(mutated, candidates, maxBudget, rand);
            registerMask(fixed);
            nextPopulation.push(fixed);
        }
        population = nextPopulation;
        bestScore = Math.max(bestScore, ...Array.from(archive.values()).map((solution) => solution.score));
        history.push({
            generation,
            bestScore,
            feasibleCount: archive.size,
        });
    }
    const topSolutions = rankSolutions(Array.from(archive.values()), ga.topSolutionsLimit);
    const ahpRanking = applyAhpRanking(topSolutions, weights);
    const best = topSolutions[0];
    return {
        status: 'ok',
        scope: input.scope,
        candidateCount: candidates.length,
        feasibleInitialCount,
        generationsRan: ga.generations,
        terminationReason: 'max_generations',
        weights,
        requiredCategoryIds,
        categoriesAvailable: availableCategoryIds,
        best,
        topSolutions,
        ahpRanking,
        history,
    };
}
