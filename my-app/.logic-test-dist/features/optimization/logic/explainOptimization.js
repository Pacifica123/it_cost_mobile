"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explainOptimizationSolution = explainOptimizationSolution;
exports.explainOptimizationReport = explainOptimizationReport;
const currency_1 = require("../../../shared/utils/currency");
const percent = (value) => `${Math.round(value * 100)}%`;
function explainOptimizationSolution(solution) {
    const lines = [
        `Конфигурация уложилась в бюджетную модель: итоговая стоимость ${(0, currency_1.formatCurrencyRU)(solution.totalCost)}.`,
        `Покрытие категорий составило ${percent(solution.categoryCoverage)}, рабочих мест найдено: ${solution.clientSeats}.`,
        `Оценка GA: ${solution.score.toFixed(3)}${solution.ahpScore !== undefined ? `, AHP: ${solution.ahpScore.toFixed(3)}` : ''}${solution.hybridScore !== undefined ? `, гибрид: ${solution.hybridScore.toFixed(3)}` : ''}.`,
    ];
    const strongCriteria = Object.entries(solution.criteria)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([key]) => {
        if (key === 'costUtility')
            return 'стоимость';
        if (key === 'categoryCoverage')
            return 'покрытие категорий';
        if (key === 'clientSeats')
            return 'клиентские места';
        return 'размер набора';
    });
    if (strongCriteria.length) {
        lines.push(`Сильнее всего на результат повлияли: ${strongCriteria.join(' и ')}.`);
    }
    return lines;
}
function explainOptimizationReport(report) {
    if (report.status === 'empty') {
        return [
            'Для выбранной области анализа нет элементов CAPEX.',
            'Добавьте ТО или ПО, затем повторите запуск GA.',
        ];
    }
    if (report.status === 'no_feasible') {
        return [
            'GA не нашёл допустимых конфигураций.',
            'Обычно причина в слишком маленьком бюджете или слишком жёстком наборе обязательных категорий.',
            'Попробуйте увеличить бюджет, снять часть обязательных категорий или добавить более дешёвые альтернативы.',
        ];
    }
    if (!report.best) {
        return ['Результат получен, но лучшая конфигурация не определена. Проверьте исходные данные.'];
    }
    return explainOptimizationSolution(report.best);
}
