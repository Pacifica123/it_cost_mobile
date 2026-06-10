import { RouteHubScreen } from '../../components/RouteHubScreen';

export const title = 'Проект';

const routes = [
  '/it-cost/project',
  '/it-cost/projects',
  '/it-cost/project_io',
  '/it-cost/backups',
  '/it-cost/templates',
];

export default function ProjectHubScreen() {
  return (
    <RouteHubScreen
      label="Управление"
      title="Проект"
      description="Управление проектом: паспорт, сохранение, импорт/экспорт и резервные копии."
      routes={routes}
      shortcuts={[
        { title: 'Паспорт проекта', subtitle: 'бюджет, места, описание', route: '/it-cost/project', accent: true },
        { title: 'Мои проекты', subtitle: 'открыть или сохранить расчёт', route: '/it-cost/projects' },
        { title: 'Импорт и экспорт', subtitle: 'JSON и CSV', route: '/it-cost/project_io' },
      ]}
    />
  );
}
