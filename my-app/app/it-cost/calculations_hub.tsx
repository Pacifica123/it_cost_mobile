import { RouteHubScreen } from '../../components/RouteHubScreen';

export const title = 'Расчёты';

const routes = [
  '/it-cost/it_kit_builder',
  '/it-cost/budget_autopick',
  '/it-cost/item_catalog',
  '/it-cost/technical_equipment',
  '/it-cost/software',
  '/it-cost/capital_expenditures',
  '/it-cost/operating_expenses',
  '/it-cost/electricity',
  '/it-cost/it_infrastructure',
  '/it-cost/implementation_plan',
];

export default function CalculationsHubScreen() {
  return (
    <RouteHubScreen
      label="Исходные данные"
      title="Расчёты"
      description="Ввод исходных данных: комплект, оборудование, ПО, затраты и энергия."
      routes={routes}
      shortcuts={[
        { title: 'Конструктор комплекта', subtitle: 'быстро собрать основу', route: '/it-cost/it_kit_builder', accent: true },
        { title: 'Автоподбор под бюджет', subtitle: 'подобрать вариант', route: '/it-cost/budget_autopick' },
        { title: 'Техническое оборудование', subtitle: 'ПК, серверы, сеть', route: '/it-cost/technical_equipment' },
      ]}
    />
  );
}
