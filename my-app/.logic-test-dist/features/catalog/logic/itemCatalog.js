"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterCatalogItems = exports.catalogItemToOperating = exports.catalogItemToCapital = exports.typicalCatalogItems = void 0;
exports.typicalCatalogItems = [
    {
        id: 'typical-office-pc',
        type: 'hardware',
        title: 'Офисный ПК',
        categoryId: 'capital-client',
        defaultQuantity: 1,
        defaultPrice: 42000,
        description: 'Рабочее место пользователя: системный блок или моноблок базового уровня.',
        tags: ['ПК', 'рабочее место', 'клиент'],
    },
    {
        id: 'typical-laptop',
        type: 'hardware',
        title: 'Ноутбук сотрудника',
        categoryId: 'capital-client',
        defaultQuantity: 1,
        defaultPrice: 58000,
        description: 'Мобильное рабочее место для офисной работы и удалённого доступа.',
        tags: ['ноутбук', 'клиент'],
    },
    {
        id: 'typical-server',
        type: 'hardware',
        title: 'Сервер начального уровня',
        categoryId: 'capital-server',
        defaultQuantity: 1,
        defaultPrice: 210000,
        description: 'Локальный сервер для файлов, баз данных или виртуализации.',
        tags: ['сервер', 'виртуализация'],
    },
    {
        id: 'typical-switch',
        type: 'hardware',
        title: 'Управляемый коммутатор',
        categoryId: 'capital-network',
        defaultQuantity: 1,
        defaultPrice: 28000,
        description: 'Сетевое оборудование для подключения рабочих мест и серверов.',
        tags: ['сеть', 'коммутатор'],
    },
    {
        id: 'typical-router',
        type: 'hardware',
        title: 'Маршрутизатор',
        categoryId: 'capital-network',
        defaultQuantity: 1,
        defaultPrice: 17000,
        description: 'Шлюз доступа в интернет и базовой сегментации сети.',
        tags: ['сеть', 'интернет'],
    },
    {
        id: 'typical-ups',
        type: 'hardware',
        title: 'ИБП для сервера',
        categoryId: 'capital-server',
        defaultQuantity: 1,
        defaultPrice: 45000,
        description: 'Резерв питания для серверной части инфраструктуры.',
        tags: ['ИБП', 'резерв'],
    },
    {
        id: 'typical-windows',
        type: 'software',
        title: 'ОС для рабочих мест',
        categoryId: 'capital-software',
        defaultQuantity: 1,
        defaultPrice: 18000,
        description: 'Лицензия операционной системы для клиентского устройства.',
        tags: ['Windows', 'ОС', 'лицензия'],
    },
    {
        id: 'typical-office-license',
        type: 'software',
        title: 'Офисный пакет',
        categoryId: 'capital-software',
        defaultQuantity: 1,
        defaultPrice: 14500,
        description: 'Пакет офисных приложений для одного сотрудника.',
        tags: ['Office', 'документы'],
    },
    {
        id: 'typical-antivirus',
        type: 'software',
        title: 'Антивирусная защита',
        categoryId: 'capital-software',
        defaultQuantity: 1,
        defaultPrice: 3500,
        description: 'Базовая защита конечной точки от вредоносного ПО.',
        tags: ['безопасность', 'антивирус'],
    },
    {
        id: 'typical-admin',
        type: 'operating',
        title: 'Администрирование инфраструктуры',
        categoryId: 'operating-admin',
        defaultPrice: 18000,
        description: 'Ежемесячное сопровождение серверов, сети и рабочих мест.',
        tags: ['администрирование', 'поддержка'],
    },
    {
        id: 'typical-backup',
        type: 'operating',
        title: 'Резервное копирование',
        categoryId: 'operating-backup',
        defaultPrice: 4500,
        description: 'Регулярное резервирование данных и контроль восстановления.',
        tags: ['backup', 'резерв'],
    },
    {
        id: 'typical-cloud-rent',
        type: 'operating',
        title: 'Аренда облачного сервера',
        categoryId: 'operating-rent',
        defaultPrice: 15000,
        description: 'Периодические расходы на виртуальный сервер или облачную платформу.',
        tags: ['облако', 'VPS'],
    },
];
const nextId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const catalogItemToCapital = (item) => ({
    id: nextId('catalog-capex'),
    categoryId: item.categoryId,
    name: item.title,
    quantity: item.defaultQuantity ?? 1,
    price: item.defaultPrice,
    kind: item.type === 'software' ? 'software' : 'hardware',
});
exports.catalogItemToCapital = catalogItemToCapital;
const catalogItemToOperating = (item) => ({
    id: nextId('catalog-opex'),
    categoryId: item.categoryId,
    name: item.title,
    price: item.defaultPrice,
});
exports.catalogItemToOperating = catalogItemToOperating;
const filterCatalogItems = (items, query, type) => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
        const matchesType = type === 'all' || item.type === type;
        const searchText = `${item.title} ${item.description} ${item.tags.join(' ')}`.toLowerCase();
        const matchesQuery = !normalizedQuery || searchText.includes(normalizedQuery);
        return matchesType && matchesQuery;
    });
};
exports.filterCatalogItems = filterCatalogItems;
