"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dominanceRelation = dominanceRelation;
exports.validateImportanceCase = validateImportanceCase;
exports.runImportancePipeline = runImportancePipeline;
class Dsu {
    constructor(items) {
        this.parent = Object.fromEntries(items.map((item) => [item, item]));
    }
    find(value) {
        if (this.parent[value] !== value) {
            this.parent[value] = this.find(this.parent[value]);
        }
        return this.parent[value];
    }
    union(left, right) {
        const leftRoot = this.find(left);
        const rightRoot = this.find(right);
        if (leftRoot !== rightRoot)
            this.parent[rightRoot] = leftRoot;
    }
}
const gcd = (aRaw, bRaw) => {
    let a = Math.abs(Math.trunc(aRaw));
    let b = Math.abs(Math.trunc(bRaw));
    while (b) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a || 1;
};
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b || 1) || 1;
const approximateFraction = (value, maxDenominator = 12) => {
    let bestNum = 1;
    let bestDen = 1;
    let bestError = Math.abs(value - 1);
    for (let den = 1; den <= maxDenominator; den += 1) {
        const num = Math.max(1, Math.round(value * den));
        const error = Math.abs(value - num / den);
        if (error < bestError) {
            bestNum = num;
            bestDen = den;
            bestError = error;
        }
    }
    return { num: bestNum, den: bestDen };
};
function dominanceRelation(vecA, vecB) {
    const aGeB = vecA.every((a, index) => a >= vecB[index]);
    const bGeA = vecB.every((b, index) => b >= vecA[index]);
    const aGtB = vecA.some((a, index) => a > vecB[index]);
    const bGtA = vecB.some((b, index) => b > vecA[index]);
    if (aGeB && aGtB)
        return 'dominates';
    if (bGeA && bGtA)
        return 'dominated';
    return 'incomparable';
}
function validateImportanceCase(caseData) {
    const criterionIds = new Set(caseData.criteria.map((criterion) => criterion.id));
    const alternativeIds = new Set(caseData.alternatives.map((alternative) => alternative.id));
    if (criterionIds.size === 0)
        throw new Error('Нет критериев для анализа');
    if (alternativeIds.size < 2)
        throw new Error('Для анализа нужны минимум две альтернативы');
    for (const alternativeId of alternativeIds) {
        if (!caseData.scores[alternativeId])
            throw new Error(`Нет оценок для альтернативы ${alternativeId}`);
        for (const criterionId of criterionIds) {
            const value = Number(caseData.scores[alternativeId][criterionId]);
            if (!Number.isFinite(value))
                throw new Error(`Нет оценки для критерия ${criterionId} у альтернативы ${alternativeId}`);
        }
    }
    for (const relation of caseData.relations) {
        if (!criterionIds.has(relation.left) || !criterionIds.has(relation.right)) {
            throw new Error(`Связь ${relation.left} ? ${relation.right} ссылается на неизвестный критерий`);
        }
        if (relation.op !== '>' && relation.op !== '=')
            throw new Error(`Неподдерживаемая операция: ${relation.op}`);
        if (!(Number(relation.factor) > 0))
            throw new Error('Коэффициент важности должен быть положительным');
    }
}
const buildImportanceGroups = (caseData) => {
    const criterionIds = caseData.criteria.map((criterion) => criterion.id);
    const dsu = new Dsu(criterionIds);
    for (const relation of caseData.relations) {
        if (relation.op === '=')
            dsu.union(relation.left, relation.right);
    }
    const groups = {};
    for (const criterionId of criterionIds) {
        const root = dsu.find(criterionId);
        groups[root] = [...(groups[root] ?? []), criterionId];
    }
    const edgeMap = new Map();
    for (const relation of caseData.relations) {
        if (relation.op !== '>')
            continue;
        const left = dsu.find(relation.left);
        const right = dsu.find(relation.right);
        if (left === right)
            continue;
        const key = `${left}|||${right}`;
        const previous = edgeMap.get(key);
        edgeMap.set(key, { left, right, factor: Math.max(previous?.factor ?? 1, Number(relation.factor)) });
    }
    const groupIds = Object.keys(groups);
    const logWeights = Object.fromEntries(groupIds.map((id) => [id, 0]));
    const edges = Array.from(edgeMap.values());
    for (let i = 0; i < groupIds.length * Math.max(edges.length, 1); i += 1) {
        let changed = false;
        for (const edge of edges) {
            const proposed = logWeights[edge.right] + Math.log(edge.factor);
            if (proposed > logWeights[edge.left] + 1e-12) {
                logWeights[edge.left] = proposed;
                changed = true;
            }
        }
        if (!changed)
            break;
    }
    for (const edge of edges) {
        if (logWeights[edge.left] + 1e-12 < logWeights[edge.right] + Math.log(edge.factor)) {
            throw new Error('Отношения важности критериев противоречивы: найден цикл ограничений');
        }
    }
    const rawWeights = Object.fromEntries(groupIds.map((id) => [id, Math.exp(logWeights[id])]));
    const minWeight = Math.min(...Object.values(rawWeights));
    const relativeWeights = Object.fromEntries(groupIds.map((id) => [id, rawWeights[id] / minWeight]));
    const fractions = Object.fromEntries(groupIds.map((id) => [id, approximateFraction(relativeWeights[id])]));
    const commonDenominator = Object.values(fractions).reduce((acc, frac) => lcm(acc, frac.den), 1);
    const groupMultiplicity = Object.fromEntries(groupIds.map((id) => [id, Math.max(1, Math.trunc((fractions[id].num * commonDenominator) / fractions[id].den))]));
    const criterionMultiplicity = Object.fromEntries(criterionIds.map((criterionId) => [criterionId, groupMultiplicity[dsu.find(criterionId)]]));
    const criterionOrder = [...criterionIds].sort((a, b) => criterionMultiplicity[b] - criterionMultiplicity[a] || a.localeCompare(b));
    return {
        groups,
        edges: edges.map((edge) => ({ leftGroup: edge.left, rightGroup: edge.right, factor: edge.factor })),
        groupMultiplicity,
        criterionMultiplicity,
        criterionOrder,
    };
};
const baseVectors = (caseData, criterionOrder) => Object.fromEntries(caseData.alternatives.map((alternative) => [
    alternative.id,
    criterionOrder.map((criterionId) => Number(caseData.scores[alternative.id][criterionId])),
]));
const expandedVectors = (caseData, criterionOrder, criterionMultiplicity) => Object.fromEntries(caseData.alternatives.map((alternative) => {
    const vector = criterionOrder.flatMap((criterionId) => {
        const count = Math.max(1, Math.trunc(criterionMultiplicity[criterionId] ?? 1));
        return Array.from({ length: count }, () => Number(caseData.scores[alternative.id][criterionId]));
    });
    return [alternative.id, vector];
}));
const dominanceMatrix = (alternatives, vectors) => Object.fromEntries(alternatives.map((left) => [
    left.id,
    Object.fromEntries(alternatives.map((right) => [
        right.id,
        left.id === right.id ? 'self' : dominanceRelation(vectors[left.id], vectors[right.id]),
    ])),
]));
const nondominatedSet = (alternatives, dominance) => alternatives
    .map((alternative) => alternative.id)
    .filter((id) => !alternatives.some((other) => other.id !== id && dominance[id][other.id] === 'dominated'));
const weightedSum = (caseData, criterionMultiplicity) => Object.fromEntries(caseData.alternatives.map((alternative) => {
    const total = Object.entries(criterionMultiplicity).reduce((sum, [criterionId, multiplicity]) => sum + Number(caseData.scores[alternative.id][criterionId]) * multiplicity, 0);
    return [alternative.id, total];
}));
const explain = (caseData, report) => {
    const criteriaName = Object.fromEntries(caseData.criteria.map((criterion) => [criterion.id, criterion.name]));
    const altName = Object.fromEntries(caseData.alternatives.map((alternative) => [alternative.id, alternative.name]));
    const topCriteria = Object.entries(report.analysisModel.criterionMultiplicity)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 5)
        .map(([criterionId, multiplicity]) => `${criterionId} (${criteriaName[criterionId]}, кратность ${multiplicity})`)
        .join(', ');
    const nondominatedText = report.finalNondominated.map((id) => altName[id]).join(', ');
    const winnerScores = caseData.scores[report.winnerId];
    const winnerBest = Object.entries(winnerScores)
        .sort((a, b) => Number(b[1]) * report.analysisModel.criterionMultiplicity[b[0]] -
        Number(a[1]) * report.analysisModel.criterionMultiplicity[a[0]] ||
        a[0].localeCompare(b[0]))
        .slice(0, 3)
        .map(([criterionId, value]) => `${criterionId}=${Number(value).toFixed(1)}`)
        .join(', ');
    return [
        'После применения отношений важности критериев построена N-кратная модель оценки.',
        `Наиболее важные критерии в модели: ${topCriteria}.`,
        `Множество недоминируемых альтернатив: ${nondominatedText}.`,
        `Финальный выбор: ${report.winnerName} (суммарная взвешенная оценка ${report.weightedSum[report.winnerId].toFixed(2)}).`,
        `Наибольший вклад в итог дали: ${winnerBest}.`,
    ].join('\n');
};
function runImportancePipeline(caseData) {
    validateImportanceCase(caseData);
    const rawOrder = caseData.criteria.map((criterion) => criterion.id);
    const rawVectors = baseVectors(caseData, rawOrder);
    const rawDominance = dominanceMatrix(caseData.alternatives, rawVectors);
    const rawNondominated = nondominatedSet(caseData.alternatives, rawDominance);
    const analysisModel = buildImportanceGroups(caseData);
    const finalVectors = expandedVectors(caseData, analysisModel.criterionOrder, analysisModel.criterionMultiplicity);
    const finalDominance = dominanceMatrix(caseData.alternatives, finalVectors);
    const finalNondominated = nondominatedSet(caseData.alternatives, finalDominance);
    const sums = weightedSum(caseData, analysisModel.criterionMultiplicity);
    const ranking = [...caseData.alternatives]
        .sort((a, b) => {
        const nondominatedDiff = Number(!finalNondominated.includes(a.id)) - Number(!finalNondominated.includes(b.id));
        if (nondominatedDiff !== 0)
            return nondominatedDiff;
        return sums[b.id] - sums[a.id] || a.name.localeCompare(b.name, 'ru');
    })
        .map((alternative) => ({
        id: alternative.id,
        name: alternative.name,
        weightedSum: sums[alternative.id],
        nondominated: finalNondominated.includes(alternative.id),
    }));
    const winnerId = ranking[0].id;
    const winnerName = ranking[0].name;
    const baseReport = {
        caseName: caseData.name || 'Без названия',
        rawVectors,
        rawDominance,
        rawNondominated,
        analysisModel,
        expandedVectors: finalVectors,
        finalDominance,
        finalNondominated,
        weightedSum: sums,
        ranking,
        winnerId,
        winnerName,
    };
    return {
        ...baseReport,
        explanation: explain(caseData, baseReport),
    };
}
