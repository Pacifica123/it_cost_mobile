import { formatCurrencyRU } from '../../../shared/utils/currency';
import type { ProjectMeta } from '../../../store/data/types';
import type { BuiltReport } from '../types';
import type { ProjectReadiness } from '../../project/logic/readiness';

export function buildReportMarkdown(report: BuiltReport, readiness?: ProjectReadiness, meta?: ProjectMeta) {
  const lines = [
    `# ${meta?.name || 'Сводный отчёт по оценке ИТ-инфраструктуры'}`,
    '',
    ...(meta ? [
      '## Паспорт проекта',
      `- Организация: ${meta.organization || 'не указана'}.`,
      `- Бюджет: ${formatCurrencyRU(meta.budget)}.`,
      `- Целевые клиентские места: ${meta.targetClientSeats}.`,
      meta.note ? `- Комментарий: ${meta.note}.` : '- Комментарий: не указан.',
      '',
    ] : []),
    '## Итоговые показатели',
    `- Разовые затраты: ${formatCurrencyRU(report.totalOneTimeExpenses)}.`,
    `- Периодические затраты в месяц: ${formatCurrencyRU(report.periodicTotalMonthly)}.`,
    `- Периодические затраты в год: ${formatCurrencyRU(report.periodicTotalAnnual)}.`,
    `- Электроэнергия в месяц: ${formatCurrencyRU(report.electricityTotalMonthly)}.`,
    `- Электроэнергия в год: ${formatCurrencyRU(report.electricityTotalAnnual)}.`,
    `- Общий итог за год: ${formatCurrencyRU(report.grandTotalAnnual)}.`,
    '',
    '## Структура капитальных затрат',
    `- Техническое оборудование: ${formatCurrencyRU(report.hardwareTotal)}.`,
    `- Программное обеспечение: ${formatCurrencyRU(report.softwareTotal)}.`,
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
