import { CURRENT_DATA_SCHEMA_VERSION, createDefaultProjectMeta, createProjectEvent, defaultAppSettings, defaultExchangeRates, initialCategories } from '../../../store/data/defaults';
import { ensureCapitalKinds } from '../../../store/data/catalogRules';
import type { DataState } from '../../../store/data/types';

export type ProjectTemplate = {
  id: string;
  title: string;
  subtitle: string;
  state: DataState;
};

const buildTemplateState = (_id: string, patch: Omit<DataState, 'schemaVersion' | 'projectEvents' | 'projectBackups' | 'undoStack' | 'redoStack'>): DataState => ({
  schemaVersion: CURRENT_DATA_SCHEMA_VERSION,
  ...patch,
  projectBackups: [],
  undoStack: [],
  redoStack: [],
  projectEvents: [
    createProjectEvent('Применён шаблон', `Шаблон: ${patch.projectMeta.name}.`, 'template', patch.projectMeta.updatedAt),
  ],
});

export const projectTemplates: ProjectTemplate[] = [
  {
    id: 'office-basic',
    title: 'Офис на 5 рабочих мест',
    subtitle: 'Минимальный набор: ПК, сеть, базовые лицензии и ежемесячная подписка.',
    state: buildTemplateState('office-basic', {
      projectMeta: createDefaultProjectMeta({
        name: 'Офис на 5 рабочих мест',
        organization: 'Малый офис',
        budget: 450000,
        targetClientSeats: 5,
        note: 'Шаблон для небольшого офиса с базовым набором оборудования и ПО.',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
      appSettings: defaultAppSettings,
      exchangeRates: defaultExchangeRates,
      categories: initialCategories,
      capitalData: ensureCapitalKinds(
        [
          { id: 'tpl-office-pc', categoryId: 'capital-client', name: 'Офисный ПК', quantity: 5, price: 36000 },
          { id: 'tpl-office-router', categoryId: 'capital-network', name: 'Маршрутизатор и коммутатор', quantity: 1, price: 18000 },
          { id: 'tpl-office-nas', categoryId: 'capital-server', name: 'NAS для файлов', quantity: 1, price: 52000 },
          { id: 'tpl-office-os', categoryId: 'capital-software', name: 'ОС и офисные лицензии', quantity: 5, price: 14500, kind: 'software' },
        ],
        initialCategories
      ),
      operatingData: [
        { id: 'tpl-office-m365', categoryId: 'operating-subscriptions', name: 'Облачная почта и офис', price: 4500 },
        { id: 'tpl-office-backup', categoryId: 'operating-backup', name: 'Резервное копирование', price: 1800 },
        { id: 'tpl-office-admin', categoryId: 'operating-admin', name: 'Администрирование', price: 12000 },
      ],
      electricityTotal: 2800,
    }),
  },
  {
    id: 'small-server',
    title: 'Локальный сервер + 10 мест',
    subtitle: 'Больше капитальных затрат, но больше контроля над инфраструктурой.',
    state: buildTemplateState('small-server', {
      projectMeta: createDefaultProjectMeta({
        name: 'Локальный сервер + 10 рабочих мест',
        organization: 'Компания с локальными сервисами',
        budget: 950000,
        targetClientSeats: 10,
        note: 'Шаблон для инфраструктуры с локальным сервером, сетью и рабочими местами.',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
      appSettings: defaultAppSettings,
      exchangeRates: defaultExchangeRates,
      categories: initialCategories,
      capitalData: ensureCapitalKinds(
        [
          { id: 'tpl-server-host', categoryId: 'capital-server', name: 'Сервер виртуализации', quantity: 1, price: 240000 },
          { id: 'tpl-server-ups', categoryId: 'capital-server', name: 'ИБП для сервера', quantity: 1, price: 48000 },
          { id: 'tpl-server-switch', categoryId: 'capital-network', name: 'Управляемый коммутатор', quantity: 2, price: 26000 },
          { id: 'tpl-server-pc', categoryId: 'capital-client', name: 'Рабочая станция', quantity: 10, price: 42000 },
          { id: 'tpl-server-licenses', categoryId: 'capital-software', name: 'Серверные и клиентские лицензии', quantity: 1, price: 155000, kind: 'software' },
        ],
        initialCategories
      ),
      operatingData: [
        { id: 'tpl-server-admin', categoryId: 'operating-admin', name: 'Сопровождение сервера', price: 25000 },
        { id: 'tpl-server-backup', categoryId: 'operating-backup', name: 'Резервное копирование', price: 5500 },
        { id: 'tpl-server-migration', categoryId: 'operating-migration', name: 'Внедрение и перенос данных', price: 70000 },
      ],
      electricityTotal: 8500,
    }),
  },
  {
    id: 'cloud-light',
    title: 'Облачный вариант',
    subtitle: 'Меньше локального оборудования, выше доля периодических расходов.',
    state: buildTemplateState('cloud-light', {
      projectMeta: createDefaultProjectMeta({
        name: 'Облачная инфраструктура',
        organization: 'Распределённая команда',
        budget: 600000,
        targetClientSeats: 8,
        note: 'Шаблон с упором на облачные сервисы и минимальный локальный контур.',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
      appSettings: defaultAppSettings,
      exchangeRates: defaultExchangeRates,
      categories: initialCategories,
      capitalData: ensureCapitalKinds(
        [
          { id: 'tpl-cloud-laptops', categoryId: 'capital-client', name: 'Ноутбук сотрудника', quantity: 8, price: 52000 },
          { id: 'tpl-cloud-network', categoryId: 'capital-network', name: 'Wi‑Fi и сетевой шлюз', quantity: 1, price: 38000 },
          { id: 'tpl-cloud-endpoint', categoryId: 'capital-software', name: 'Endpoint security', quantity: 8, price: 4500, kind: 'software' },
        ],
        initialCategories
      ),
      operatingData: [
        { id: 'tpl-cloud-vps', categoryId: 'operating-rent', name: 'Облачный сервер', price: 18000 },
        { id: 'tpl-cloud-office', categoryId: 'operating-subscriptions', name: 'SaaS-подписки', price: 9600 },
        { id: 'tpl-cloud-backup', categoryId: 'operating-backup', name: 'Облачные бэкапы', price: 4200 },
        { id: 'tpl-cloud-migration', categoryId: 'operating-migration', name: 'Первичная настройка', price: 45000 },
      ],
      electricityTotal: 2500,
    }),
  },
];

export const findProjectTemplate = (id: string) => projectTemplates.find((template) => template.id === id);
