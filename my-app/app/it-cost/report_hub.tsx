import { RouteHubScreen } from '../../components/RouteHubScreen';

export const title = 'Отчёт и готовность';

const routes = [
  '/it-cost/validation',
  '/it-cost/export',
  '/it-cost/history',
  '/it-cost/project_io',
];

export default function ReportHubScreen() {
  return (
    <RouteHubScreen
      label="Финальный этап"
      title="Отчёт"
      description="Финальный этап: проверка, отчёт и история изменений."
      routes={routes}
      shortcuts={[
        { title: 'Проверка готовности', subtitle: 'ошибки и предупреждения', route: '/it-cost/validation', accent: true },
        { title: 'Итоговый отчёт', subtitle: 'таблицы и экспорт', route: '/it-cost/export' },
        { title: 'История изменений', subtitle: 'что менялось', route: '/it-cost/history' },
      ]}
    />
  );
}
