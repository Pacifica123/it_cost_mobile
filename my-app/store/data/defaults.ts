import type { AppSettings, DataState, ExchangeRates, ExpenseCategory, ProjectEvent, ProjectMeta, ProjectSnapshot } from './types';
import { ensureCapitalKinds } from './catalogRules';

const now = '2026-01-01T00:00:00.000Z';

export const CURRENT_DATA_SCHEMA_VERSION = 5;

export const createDefaultProjectMeta = (patch: Partial<ProjectMeta> = {}): ProjectMeta => ({
  name: 'Расчёт ИТ-инфраструктуры',
  organization: 'Организация',
  budget: 1000000,
  targetClientSeats: 10,
  note: 'Базовый локальный проект для оценки затрат и подбора конфигурации.',
  createdAt: now,
  updatedAt: now,
  ...patch,
});

export const createProjectEvent = (
  title: string,
  description = '',
  type: ProjectEvent['type'] = 'project',
  createdAt = now
): ProjectEvent => ({
  id: `${createdAt}-${title}`.replace(/[^a-zA-Zа-яА-Я0-9]+/g, '-'),
  type,
  title,
  description,
  createdAt,
});


export const defaultAppSettings: AppSettings = {
  themeMode: 'system',
  currency: 'RUB',
  roundingMode: 'rubles',
  confirmDelete: true,
};

export const defaultExchangeRates: ExchangeRates = {
  baseCurrency: 'RUB',
  rates: {
    USD: null,
    EUR: null,
  },
  updatedAt: null,
  source: 'ЦБ РФ',
};

export const initialCategories: ExpenseCategory[] = [
  { id: 'capital-server', name: 'Серверное оборудование', scope: 'capital' },
  { id: 'capital-network', name: 'Сетевое оборудование', scope: 'capital' },
  { id: 'capital-client', name: 'Клиентское оборудование', scope: 'capital' },
  { id: 'capital-software', name: 'Лицензии ПО', scope: 'capital' },
  { id: 'operating-subscriptions', name: 'Лицензии по подписке', scope: 'operating', mode: 'periodic' },
  { id: 'operating-rent', name: 'Аренда серверов', scope: 'operating', mode: 'periodic' },
  { id: 'operating-migration', name: 'Миграция', scope: 'operating', mode: 'oneTime' },
  { id: 'operating-testing', name: 'Тестирование', scope: 'operating', mode: 'oneTime' },
  { id: 'operating-backup', name: 'Резервирование', scope: 'operating', mode: 'periodic' },
  { id: 'operating-labor', name: 'Оплата труда', scope: 'operating', mode: 'periodic' },
  { id: 'operating-admin', name: 'Администрирование серверов', scope: 'operating', mode: 'periodic' },
];

export const makeProjectSnapshot = (state: Pick<DataState, 'projectMeta' | 'appSettings' | 'capitalData' | 'operatingData' | 'categories' | 'electricityTotal'>): ProjectSnapshot => ({
  projectMeta: state.projectMeta,
  appSettings: state.appSettings,
  capitalData: state.capitalData,
  operatingData: state.operatingData,
  categories: state.categories,
  electricityTotal: state.electricityTotal,
});

export const initialState: DataState = {
  schemaVersion: CURRENT_DATA_SCHEMA_VERSION,
  projectMeta: createDefaultProjectMeta({
    name: 'Демо-проект ИТ-инфраструктуры',
    organization: 'Локальная компания',
    budget: 1000000,
    targetClientSeats: 10,
    note: 'Демонстрационный набор данных с разделением ТО, ПО, OPEX и отчётом.',
  }),
  appSettings: defaultAppSettings,
  exchangeRates: defaultExchangeRates,
  projectEvents: [
    createProjectEvent('Создан демо-проект', 'Загружены стартовые категории и демонстрационные позиции.', 'template'),
  ],
  activeProjectId: null,
  savedProjects: [],
  projectBackups: [],
  undoStack: [],
  redoStack: [],
  capitalData: ensureCapitalKinds(
    [
      { id: '1', categoryId: 'capital-server', name: 'Сервер HP ProLiant', quantity: 5, price: 50000 },
      { id: '2', categoryId: 'capital-network', name: 'Коммутатор Cisco', quantity: 1, price: 25000 },
      { id: '3', categoryId: 'capital-client', name: 'ПК Dell OptiPlex', quantity: 10, price: 30000 },
      { id: '4', categoryId: 'capital-software', name: 'MS Windows 11 Pro', quantity: 10, price: 20000, kind: 'software' },
    ],
    initialCategories
  ),
  operatingData: [
    { id: '1', categoryId: 'operating-subscriptions', name: 'Microsoft 365', price: 1300 },
    { id: '2', categoryId: 'operating-rent', name: 'Виртуальный сервер', price: 0 },
    { id: '3', categoryId: 'operating-migration', name: 'Перенос сервисов', price: 0 },
    { id: '4', categoryId: 'operating-testing', name: 'Регрессионное тестирование', price: 0 },
    { id: '5', categoryId: 'operating-backup', name: 'Резервное копирование', price: 0 },
    { id: '6', categoryId: 'operating-labor', name: 'Заработная плата персонала', price: 0 },
    { id: '7', categoryId: 'operating-admin', name: 'Сопровождение инфраструктуры', price: 0 },
  ],
  categories: initialCategories,
  electricityTotal: 0,
};

export const emptyProjectState: DataState = {
  schemaVersion: CURRENT_DATA_SCHEMA_VERSION,
  projectMeta: createDefaultProjectMeta({
    name: 'Новый расчёт ИТ-инфраструктуры',
    organization: '',
    budget: 0,
    targetClientSeats: 0,
    note: '',
  }),
  appSettings: defaultAppSettings,
  exchangeRates: defaultExchangeRates,
  projectEvents: [
    createProjectEvent('Создан пустой проект', 'Позиции очищены, базовые категории сохранены.', 'reset'),
  ],
  activeProjectId: null,
  savedProjects: [],
  projectBackups: [],
  undoStack: [],
  redoStack: [],
  categories: initialCategories,
  capitalData: [],
  operatingData: [],
  electricityTotal: 0,
};
