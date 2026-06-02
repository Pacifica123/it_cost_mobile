"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReportMarkdown = buildReportMarkdown;
const currency_1 = require("../../../shared/utils/currency");
function buildReportMarkdown(report, readiness, meta) {
    const lines = [
        `# ${meta?.name || 'Сводный отчёт по оценке ИТ-инфраструктуры'}`,
        '',
        ...(meta ? [
            '## Паспорт проекта',
            `- Организация: ${meta.organization || 'не указана'}.`,
            `- Бюджет: ${(0, currency_1.formatCurrencyRU)(meta.budget)}.`,
            `- Целевые клиентские места: ${meta.targetClientSeats}.`,
            meta.note ? `- Комментарий: ${meta.note}.` : '- Комментарий: не указан.',
            '',
        ] : []),
        '## Итоговые показатели',
        `- Разовые затраты: ${(0, currency_1.formatCurrencyRU)(report.totalOneTimeExpenses)}.`,
        `- Периодические затраты в месяц: ${(0, currency_1.formatCurrencyRU)(report.periodicTotalMonthly)}.`,
        `- Периодические затраты в год: ${(0, currency_1.formatCurrencyRU)(report.periodicTotalAnnual)}.`,
        `- Электроэнергия в месяц: ${(0, currency_1.formatCurrencyRU)(report.electricityTotalMonthly)}.`,
        `- Электроэнергия в год: ${(0, currency_1.formatCurrencyRU)(report.electricityTotalAnnual)}.`,
        `- Общий итог за год: ${(0, currency_1.formatCurrencyRU)(report.grandTotalAnnual)}.`,
        '',
        '## Структура капитальных затрат',
        `- Техническое оборудование: ${(0, currency_1.formatCurrencyRU)(report.hardwareTotal)}.`,
        `- Программное обеспечение: ${(0, currency_1.formatCurrencyRU)(report.softwareTotal)}.`,
        '',
        '## Проверка полноты расчёта',
        ...(readiness ? [
            `- Готовность расчёта: ${readiness.percent}%.`,
            `- Вывод проверки: ${readiness.summary}`,
        ] : []),
        ...report.insights.map((insight) => `- ${insight.title}: ${insight.description}`),
        '',
        '## Вывод',
        report.summaryText,
    ];
    return lines.join('\n');
}
