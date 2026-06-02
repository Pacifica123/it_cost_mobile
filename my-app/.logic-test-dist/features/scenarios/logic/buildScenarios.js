"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildScenarioComparison = buildScenarioComparison;
const buildReport_1 = require("../../report/logic/buildReport");
const validateProjectData_1 = require("../../validation/logic/validateProjectData");
const templates_1 = require("../../project/logic/templates");
const riskScoreForState = (state) => {
    const validation = (0, validateProjectData_1.validateProjectData)(state);
    return Math.max(0, 100 - validation.errors.length * 30 - validation.warnings.length * 12 - validation.infos.length * 5);
};
const scenarioTone = (state, budgetRemainder, qualityScore) => {
    if (budgetRemainder < 0)
        return 'danger';
    if (qualityScore < 65)
        return 'warning';
    if (state.projectMeta.budget > 0 && budgetRemainder < state.projectMeta.budget * 0.1)
        return 'warning';
    return 'ok';
};
const buildScenarioItem = (id, title, subtitle, state) => {
    const report = (0, buildReport_1.buildReport)(state);
    const validation = (0, validateProjectData_1.validateProjectData)(state);
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
function buildScenarioComparison(currentState) {
    const current = buildScenarioItem('current', 'Текущий проект', 'Состояние, которое сейчас открыто в приложении.', currentState);
    const templateItems = templates_1.projectTemplates.map((template) => buildScenarioItem(template.id, template.title, template.subtitle, template.state));
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
