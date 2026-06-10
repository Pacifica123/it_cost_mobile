import { RouteHubScreen } from '../../components/RouteHubScreen';

export const title = 'Сервис';

const routes = [
  '/it-cost/settings',
  '/it-cost/diagnostics',
  '/it-cost/app_update',
];

export default function ServiceHubScreen() {
  return (
    <RouteHubScreen
      label="Служебное"
      title="Сервис"
      description="Служебные действия: настройки, диагностика и обновления."
      routes={routes}
      shortcuts={[
        { title: 'Настройки', subtitle: 'тема, валюта, отчёт', route: '/it-cost/settings', accent: true },
        { title: 'Диагностика приложения', subtitle: 'хранилище и данные', route: '/it-cost/diagnostics' },
        { title: 'Обновление приложения', subtitle: 'проверить GitHub', route: '/it-cost/app_update' },
      ]}
    />
  );
}
