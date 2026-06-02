import { formatCurrencyRU } from '../../../shared/utils/currency';
import type { AppSettings, ProjectEvent, ProjectMeta } from '../../../store/data/types';
import type { BuiltReport } from '../types';
import type { ProjectReadiness } from '../../project/logic/readiness';

export function buildReportMarkdown(
  report: BuiltReport,
  readiness?: ProjectReadiness,
  meta?: ProjectMeta,
  settings?: AppSettings,
  events: ProjectEvent[] = []
) {
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
  ];

  if (mode !== 'short') {
    lines.push(
      '## Структура капитальных затрат',
      `- Техническое оборудование: ${formatCurrencyRU(report.hardwareTotal)}.`,
      `- Программное обеспечение: ${formatCurrencyRU(report.softwareTotal)}.`,
      ''
    );
  }

  if (includeCharts && mode !== 'short') {
    lines.push(
      '## Графики и аналитика',
      '- В HTML-отчёте включается структура затрат и финансовые графики.',
      `- Горизонт расчёта: ${settings?.calculationHorizonYears ?? 5} лет.`,
      `- Ставка дисконтирования: ${settings?.discountRatePercent ?? 12}%.`,
      ''
    );
  }

  if (includeRisks) {
    lines.push(
      '## Проверка полноты расчёта',
      ...(readiness ? [
        `- Готовность расчёта: ${readiness.percent}%.`,
        `- Вывод проверки: ${readiness.summary}`,
      ] : []),
      ...report.insights.map((insight) => `- ${insight.title}: ${insight.description}`),
      ''
    );
  }

  if (mode === 'full' || mode === 'technical') {
    const hasCapital = Object.keys(report.groupedCapital).length > 0;
    const hasOpex = Object.keys(report.groupedOneTimeOperating).length > 0 || Object.keys(report.groupedPeriodicOperating).length > 0;
    if (hasCapital || includeEmpty) lines.push('## Таблицы CAPEX', hasCapital ? '- CAPEX-таблица включена в HTML-версию.' : '- CAPEX не заполнен.', '');
    if (hasOpex || includeEmpty) lines.push('## Таблицы OPEX', hasOpex ? '- OPEX-таблицы включены в HTML-версию.' : '- OPEX не заполнен.', '');
  }

  if (includeHistory && events.length) {
    lines.push(
      '## Последние действия',
      ...events.slice(0, 8).map((event) => `- ${new Date(event.createdAt).toLocaleString('ru-RU')}: ${event.title}${event.description ? ` — ${event.description}` : ''}`),
      ''
    );
  }

  lines.push('## Вывод', report.summaryText);

  return lines.join('\n');
}
