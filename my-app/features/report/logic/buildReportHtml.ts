import { formatCurrencyRU } from '../../../shared/utils/currency';
import type { AppSettings, ProjectEvent, ProjectMeta } from '../../../store/data/types';
import type { ProjectReadiness } from '../../project/logic/readiness';
import type { BuiltReport } from '../types';

const escapeHtml = (value: string | number) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const renderInsight = (title: string, description: string) =>
  `<li><strong>${escapeHtml(title)}.</strong> ${escapeHtml(description)}</li>`;

const renderGrouped = <T extends { name: string }>(
  title: string,
  grouped: Record<string, T[]>,
  getQty: (item: T) => number,
  getCost: (item: T) => number
) => {
  const rows = Object.entries(grouped).flatMap(([category, items]) => [
    `<tr class="category"><td colspan="3">${escapeHtml(category)}</td></tr>`,
    ...items.map((item) =>
      `<tr><td>${escapeHtml(item.name)}</td><td>${escapeHtml(getQty(item))}</td><td>${escapeHtml(formatCurrencyRU(getCost(item)))}</td></tr>`
    ),
  ]).join('');

  return `
    <h2>${escapeHtml(title)}</h2>
    <table>
      <thead><tr><th>Наименование</th><th>Кол-во</th><th>Сумма</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="3">Нет данных</td></tr>'}</tbody>
    </table>
  `;
};

export function buildReportHtml(report: BuiltReport, readiness?: ProjectReadiness, meta?: ProjectMeta, settings?: AppSettings, events: ProjectEvent[] = []) {
  const title = meta?.name || 'Сводный отчёт по оценке ИТ-инфраструктуры';
  const mode = settings?.reportMode ?? 'full';
  const includeRisks = settings?.reportIncludeRisks ?? true;
  const includeHistory = settings?.reportIncludeHistory ?? false;
  const includeEmpty = settings?.reportIncludeEmptySections ?? false;
  const includeCharts = settings?.reportIncludeCharts ?? true;
  const readinessBlock = readiness
    ? `<p><strong>Готовность расчёта:</strong> ${readiness.percent}%.</p><p>${escapeHtml(readiness.summary)}</p>`
    : '';

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; color: #111827; background: #f6f7fb; }
    main { max-width: 980px; margin: 0 auto; padding: 32px 20px; }
    .hero, section { background: #fff; border: 1px solid #e5e7eb; border-radius: 20px; padding: 22px; margin-bottom: 16px; }
    h1 { font-size: 30px; margin: 0 0 8px; }
    h2 { font-size: 20px; margin: 18px 0 10px; }
    p, li { line-height: 1.55; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
    .pill { background: #f3f4f6; border-radius: 14px; padding: 12px; }
    .value { font-size: 18px; font-weight: 800; }
    .label { color: #6b7280; font-size: 12px; font-weight: 700; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; overflow: hidden; border-radius: 14px; }
    th, td { padding: 10px 12px; border: 1px solid #e5e7eb; text-align: left; }
    th { background: #f3f4f6; }
    .category td { background: #eef2ff; font-weight: 800; }
    .print-actions { position: sticky; top: 0; z-index: 2; background: rgba(246,247,251,0.92); backdrop-filter: blur(10px); padding: 12px 0; margin-bottom: 10px; }
    .print-actions button { border: 0; border-radius: 999px; background: #2563eb; color: #fff; font-weight: 800; padding: 10px 16px; cursor: pointer; }
    .muted { color: #6b7280; }
    .risk { border-left: 4px solid #f59e0b; }
    @media print { body { background: #fff; } main { padding: 0; } .hero, section { break-inside: avoid; border-color: #d1d5db; } .print-actions { display: none; } }
  </style>
</head>
<body>
  <main>
    <div class="print-actions"><button onclick="window.print()">Печать / сохранить PDF</button> <span class="muted">Откройте меню печати и выберите сохранение в PDF.</span></div>
    <div class="hero">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(meta?.organization || 'Организация не указана')}</p>
    </div>

    <section>
      <h2>Паспорт проекта</h2>
      <div class="grid">
        <div class="pill"><div class="value">${escapeHtml(formatCurrencyRU(meta?.budget ?? 0))}</div><div class="label">Бюджет</div></div>
        <div class="pill"><div class="value">${escapeHtml(meta?.targetClientSeats ?? 0)}</div><div class="label">Клиентские места</div></div>
        <div class="pill"><div class="value">${escapeHtml(formatCurrencyRU(report.grandTotalAnnual))}</div><div class="label">Итог за год</div></div>
      </div>
      <p>${escapeHtml(meta?.note || 'Комментарий не указан.')}</p>
    </section>

    <section>
      <h2>Итоговые показатели</h2>
      <div class="grid">
        <div class="pill"><div class="value">${escapeHtml(formatCurrencyRU(report.totalOneTimeExpenses))}</div><div class="label">Разовые затраты</div></div>
        <div class="pill"><div class="value">${escapeHtml(formatCurrencyRU(report.periodicTotalMonthly))}</div><div class="label">Периодические в месяц</div></div>
        <div class="pill"><div class="value">${escapeHtml(formatCurrencyRU(report.periodicTotalAnnual))}</div><div class="label">Периодические в год</div></div>
        <div class="pill"><div class="value">${escapeHtml(formatCurrencyRU(report.electricityTotalAnnual))}</div><div class="label">Электроэнергия в год</div></div>
      </div>
    </section>

    <section>
      <h2>Структура затрат</h2>
      <ul>
        <li>Техническое оборудование: ${escapeHtml(formatCurrencyRU(report.hardwareTotal))}</li>
        <li>Программное обеспечение: ${escapeHtml(formatCurrencyRU(report.softwareTotal))}</li>
        <li>OPEX и работы за год: ${escapeHtml(formatCurrencyRU(report.periodicTotalAnnual + report.oneTimeOperatingTotal))}</li>
        <li>Электроэнергия за год: ${escapeHtml(formatCurrencyRU(report.electricityTotalAnnual))}</li>
      </ul>
    </section>

    ${includeCharts && mode !== 'short' ? `<section>
      <h2>Параметры финансового анализа</h2>
      <div class="grid">
        <div class="pill"><div class="value">${escapeHtml(settings?.calculationHorizonYears ?? 5)} лет</div><div class="label">Горизонт расчёта</div></div>
        <div class="pill"><div class="value">${escapeHtml(settings?.discountRatePercent ?? 12)}%</div><div class="label">Ставка дисконтирования</div></div>
      </div>
    </section>` : ''}

    ${includeRisks ? `<section class="risk">
      <h2>Проверка данных и риски</h2>
      ${readinessBlock}
      <ul>${report.insights.map((insight) => renderInsight(insight.title, insight.description)).join('')}</ul>
    </section>` : ''}

    ${mode === 'short' ? '' : `<section>
      ${(Object.keys(report.groupedCapital).length || includeEmpty) ? renderGrouped('Капитальные затраты', report.groupedCapital, (item) => item.quantity, (item) => item.quantity * item.price) : ''}
      ${(Object.keys(report.groupedOneTimeOperating).length || includeEmpty) ? renderGrouped('Разовые OPEX', report.groupedOneTimeOperating, () => 1, (item) => item.price) : ''}
      ${(Object.keys(report.groupedPeriodicOperating).length || includeEmpty) ? renderGrouped('Периодические OPEX в месяц', report.groupedPeriodicOperating, () => 1, (item) => item.price) : ''}
    </section>`}

    ${includeHistory && events.length ? `<section>
      <h2>Последние действия</h2>
      <ul>${events.slice(0, 8).map((event) => renderInsight(new Date(event.createdAt).toLocaleString('ru-RU'), `${event.title}${event.description ? ` — ${event.description}` : ''}`)).join('')}</ul>
    </section>` : ''}

    <section>
      <h2>Итоговая рекомендация</h2>
      <p>${escapeHtml(report.summaryText)}</p>
    </section>
  </main>
</body>
</html>`;
}
