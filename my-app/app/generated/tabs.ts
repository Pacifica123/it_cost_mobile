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
    "id": "/it-cost/project",
    "title": "Проект расчёта",
    "route": "/it-cost/project",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/templates",
    "title": "Шаблоны проектов",
    "route": "/it-cost/templates",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/quick_start",
    "title": "Быстрый расчёт",
    "route": "/it-cost/quick_start",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/project_io",
    "title": "Импорт и экспорт проекта",
    "route": "/it-cost/project_io",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/history",
    "title": "История изменений",
    "route": "/it-cost/history",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/validation",
    "title": "Проверка данных",
    "route": "/it-cost/validation",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/it_infrastructure",
    "title": "ИТ-инфраструктура",
    "route": "/it-cost/it_infrastructure",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/capital_expenditures",
    "title": "Капитальные затраты",
    "route": "/it-cost/capital_expenditures",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/criteria_importance",
    "title": "Обоснование выбора ИТ-решения",
    "route": "/it-cost/criteria_importance",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/operating_expenses",
    "title": "Операционные затраты",
    "route": "/it-cost/operating_expenses",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/software",
    "title": "ПО",
    "route": "/it-cost/software",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/technical_equipment",
    "title": "ТО",
    "route": "/it-cost/technical_equipment",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/electricity",
    "title": "Электропотребление",
    "route": "/it-cost/electricity",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/ahp",
    "title": "AHP-анализ",
    "route": "/it-cost/ahp",
    "group": "/it-cost"
  },
  {
    "id": "/it-cost/NPV",
    "title": "NPV-анализ",
    "route": "/it-cost/NPV",
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
  }
] as const;
