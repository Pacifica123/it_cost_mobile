import { RouteHubScreen } from '../../components/RouteHubScreen';

export const title = 'Аналитика';

const routes = [
  '/it-cost/dashboard',
  '/it-cost/financial_charts',
  '/it-cost/risks',
  '/it-cost/scenarios',
  '/it-cost/local_cloud_compare',
  '/it-cost/amortization',
  '/it-cost/NPV',
  '/it-cost/ahp',
  '/it-cost/criteria_importance',
  '/it-cost/genetic_optimization',
  '/it-cost/method_comparison',
];

export default function AnalyticsHubScreen() {
  return (
    <RouteHubScreen
      label="Проверка решений"
      title="Аналитика"
      description="Проверка результата: сводка, риски, графики, сценарии и методы."
      routes={routes}
      shortcuts={[
        { title: 'Сводка проекта', subtitle: 'главные показатели', route: '/it-cost/dashboard', accent: true },
        { title: 'Риски и рекомендации', subtitle: 'что исправить', route: '/it-cost/risks' },
        { title: 'Финансовые графики', subtitle: 'TCO и структура затрат', route: '/it-cost/financial_charts' },
      ]}
    />
  );
}
