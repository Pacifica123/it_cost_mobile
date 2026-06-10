/* eslint-disable */
// AUTO-GENERATED FILE. DO NOT EDIT.

export type TabScreen = {
  id: string;
  name: string;
  title: string;
  route: string;
  group?: string;
  isTab: boolean;
  isEntry: boolean;
};

export type ScreenLink = {
  id: string;
  title: string;
  route: string;
  group?: string;
};

export const allTabScreens: TabScreen[] = [
  {
    "id": "/it-cost/menu",
    "name": "menu",
    "title": "Меню ИТ",
    "route": "/it-cost/menu",
    "group": "/it-cost",
    "isTab": true,
    "isEntry": true
  },
  {
    "id": "/it-cost/export",
    "name": "export",
    "title": "Отчёт",
    "route": "/it-cost/export",
    "group": "/it-cost",
    "isTab": true,
    "isEntry": false
  }
] as const;
export const entryBlocks: ScreenLink[] = [
  {
    "id": "/it-cost/menu",
    "title": "Меню ИТ",
    "route": "/it-cost/menu",
    "group": "/it-cost"
  }
] as const;
export const hiddenBlocks: ScreenLink[] = [
  {
    "id": "/it-cost/project_hub",
    "title": "Проект",
    "route": "/it-cost/project_hub",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/calculations_hub",
    "title": "Расчёты",
    "route": "/it-cost/calculations_hub",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/analytics_hub",
    "title": "Аналитика",
    "route": "/it-cost/analytics_hub",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/report_hub",
    "title": "Отчёт и готовность",
    "route": "/it-cost/report_hub",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/service_hub",
    "title": "Сервис",
    "route": "/it-cost/service_hub",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/project",
    "title": "Проект расчёта",
    "route": "/it-cost/project",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/projects",
    "title": "Мои проекты",
    "route": "/it-cost/projects",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/project_io",
    "title": "Импорт и экспорт проекта",
    "route": "/it-cost/project_io",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/backups",
    "title": "Резервные копии",
    "route": "/it-cost/backups",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/templates",
    "title": "Шаблоны проектов",
    "route": "/it-cost/templates",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/history",
    "title": "История изменений",
    "route": "/it-cost/history",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/it_kit_builder",
    "title": "Конструктор ИТ-комплекта",
    "route": "/it-cost/it_kit_builder",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/budget_autopick",
    "title": "Автоподбор под бюджет",
    "route": "/it-cost/budget_autopick",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/item_catalog",
    "title": "Каталог типовых позиций",
    "route": "/it-cost/item_catalog",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/technical_equipment",
    "title": "ТО",
    "route": "/it-cost/technical_equipment",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/software",
    "title": "ПО",
    "route": "/it-cost/software",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/capital_expenditures",
    "title": "Капитальные затраты",
    "route": "/it-cost/capital_expenditures",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/operating_expenses",
    "title": "Операционные затраты",
    "route": "/it-cost/operating_expenses",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/electricity",
    "title": "Электропотребление",
    "route": "/it-cost/electricity",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/it_infrastructure",
    "title": "ИТ-инфраструктура",
    "route": "/it-cost/it_infrastructure",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/implementation_plan",
    "title": "План внедрения",
    "route": "/it-cost/implementation_plan",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/dashboard",
    "title": "Сводка проекта",
    "route": "/it-cost/dashboard",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/financial_charts",
    "title": "Финансовые графики",
    "route": "/it-cost/financial_charts",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/risks",
    "title": "Риски и рекомендации",
    "route": "/it-cost/risks",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/scenarios",
    "title": "Сценарии расчёта",
    "route": "/it-cost/scenarios",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/local_cloud_compare",
    "title": "Локально vs облако",
    "route": "/it-cost/local_cloud_compare",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/amortization",
    "title": "Амортизация и срок службы",
    "route": "/it-cost/amortization",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/NPV",
    "title": "NPV-анализ",
    "route": "/it-cost/NPV",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/ahp",
    "title": "AHP-анализ",
    "route": "/it-cost/ahp",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/criteria_importance",
    "title": "Обоснование выбора ИТ-решения",
    "route": "/it-cost/criteria_importance",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/genetic_optimization",
    "title": "Генетический подбор",
    "route": "/it-cost/genetic_optimization",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/method_comparison",
    "title": "Сравнение методов",
    "route": "/it-cost/method_comparison",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/validation",
    "title": "Проверка данных",
    "route": "/it-cost/validation",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/settings",
    "title": "Настройки",
    "route": "/it-cost/settings",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/diagnostics",
    "title": "Диагностика приложения",
    "route": "/it-cost/diagnostics",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/app_update",
    "title": "Обновление приложения",
    "route": "/it-cost/app_update",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/quick_start",
    "title": "Быстрый расчёт",
    "route": "/it-cost/quick_start",
    "group": "/it-cost"
  }
] as const;
