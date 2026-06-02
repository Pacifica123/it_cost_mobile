"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReportMarkdown = buildReportMarkdown;
const currency_1 = require("../../../shared/utils/currency");
function buildReportMarkdown(report, readiness, meta, settings, events = []) {
    const mode = settings?.reportMode ?? 'full';
    const includeRisks = settings?.reportIncludeRisks ?? true;
    const includeHistory = settings?.reportIncludeHistory ?? false;
    const includeEmpty = settings?.reportIncludeEmptySections ?? false;
    const includeCharts = settings?.reportIncludeCharts ?? true;
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
    ];
    if (mode !== 'short') {
        lines.push('## Структура капитальных затрат', `- Техническое оборудование: ${(0, currency_1.formatCurrencyRU)(report.hardwareTotal)}.`, `- Программное обеспечение: ${(0, currency_1.formatCurrencyRU)(report.softwareTotal)}.`, '');
    }
    if (includeCharts && mode !== 'short') {
        lines.push('## Графики и аналитика', '- В HTML-отчёте включается структура затрат и финансовые графики.', `- Горизонт расчёта: ${settings?.calculationHorizonYears ?? 5} лет.`, `- Ставка дисконтирования: ${settings?.discountRatePercent ?? 12}%.`, '');
    }
    if (includeRisks) {
        lines.push('## Проверка полноты расчёта', ...(readiness ? [
            `- Готовность расчёта: ${readiness.percent}%.`,
            `- Вывод проверки: ${readiness.summary}`,
        ] : []), ...report.insights.map((insight) => `- ${insight.title}: ${insight.description}`), '');
    }
    if (mode === 'full' || mode === 'technical') {
        const hasCapital = Object.keys(report.groupedCapital).length > 0;
        const hasOpex = Object.keys(report.groupedOneTimeOperating).length > 0 || Object.keys(report.groupedPeriodicOperating).length > 0;
        if (hasCapital || includeEmpty)
            lines.push('## Таблицы CAPEX', hasCapital ? '- CAPEX-таблица включена в HTML-версию.' : '- CAPEX не заполнен.', '');
        if (hasOpex || includeEmpty)
            lines.push('## Таблицы OPEX', hasOpex ? '- OPEX-таблицы включены в HTML-версию.' : '- OPEX не заполнен.', '');
    }
    if (includeHistory && events.length) {
        lines.push('## Последние действия', ...events.slice(0, 8).map((event) => `- ${new Date(event.createdAt).toLocaleString('ru-RU')}: ${event.title}${event.description ? ` — ${event.description}` : ''}`), '');
    }
    lines.push('## Вывод', report.summaryText);
    return lines.join('\n');
}
