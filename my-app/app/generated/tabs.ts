/* eslint-disable */
// AUTO-GENERATED FILE. DO NOT EDIT.

import type { Href } from "expo-router";

export type ЭкранТаба = {
  id: string;
  name: string;
  title: string;
  route: Href;
  group?: string;
  isTab: boolean;
  isEntry: boolean;
};

export type ПунктЭкрана = {
  id: string;
  title: string;
  route: Href;
  group?: string;
};

export const всеЭкраныТабов: ЭкранТаба[] = [
  {
    "id": "/test_name/it_infrastructure",
    "name": "it_infrastructure",
    "title": "ИТ-инфраструктура",
    "route": "/test_name/it_infrastructure",
    "group": "/test_name",
    "isTab": false,
    "isEntry": false
  },
  {
    "id": "/test_name/capital_expenditures",
    "name": "capital_expenditures",
    "title": "Капитальные затраты",
    "route": "/test_name/capital_expenditures",
    "group": "/test_name",
    "isTab": false,
    "isEntry": false
  },
  {
    "id": "/test_name/menu",
    "name": "menu",
    "title": "Меню ИТ",
    "route": "/test_name/menu",
    "group": "/test_name",
    "isTab": true,
    "isEntry": true
  },
  {
    "id": "/test_name/operating_expenses",
    "name": "operating_expenses",
    "title": "Операционные затраты",
    "route": "/test_name/operating_expenses",
    "group": "/test_name",
    "isTab": false,
    "isEntry": false
  },
  {
    "id": "/test_name/export",
    "name": "export",
    "title": "Отчёт",
    "route": "/test_name/export",
    "group": "/test_name",
    "isTab": true,
    "isEntry": false
  },
  {
    "id": "/test_name/electricity",
    "name": "electricity",
    "title": "Электропотребление",
    "route": "/test_name/electricity",
    "group": "/test_name",
    "isTab": false,
    "isEntry": false
  },
  {
    "id": "/test_name/ahp",
    "name": "ahp",
    "title": "AHP-анализ",
    "route": "/test_name/ahp",
    "group": "/test_name",
    "isTab": false,
    "isEntry": false
  },
  {
    "id": "/test_name/NPV",
    "name": "NPV",
    "title": "NPV-анализ",
    "route": "/test_name/NPV",
    "group": "/test_name",
    "isTab": false,
    "isEntry": false
  }
] as const;
export const главныеЭкраны: ПунктЭкрана[] = [
  {
    "id": "/test_name/menu",
    "title": "Меню ИТ",
    "route": "/test_name/menu",
    "group": "/test_name"
  }
] as const;
export const скрытыеЭкраны: ПунктЭкрана[] = [
  {
    "id": "/test_name/it_infrastructure",
    "title": "ИТ-инфраструктура",
    "route": "/test_name/it_infrastructure",
    "group": "/test_name"
  },
  {
    "id": "/test_name/capital_expenditures",
    "title": "Капитальные затраты",
    "route": "/test_name/capital_expenditures",
    "group": "/test_name"
  },
  {
    "id": "/test_name/operating_expenses",
    "title": "Операционные затраты",
    "route": "/test_name/operating_expenses",
    "group": "/test_name"
  },
  {
    "id": "/test_name/electricity",
    "title": "Электропотребление",
    "route": "/test_name/electricity",
    "group": "/test_name"
  },
  {
    "id": "/test_name/ahp",
    "title": "AHP-анализ",
    "route": "/test_name/ahp",
    "group": "/test_name"
  },
  {
    "id": "/test_name/NPV",
    "title": "NPV-анализ",
    "route": "/test_name/NPV",
    "group": "/test_name"
  }
] as const;

// Английские алиасы для совместимости
export type TabBlock = ЭкранТаба;
export type BlockItem = ПунктЭкрана;

export const allTabScreens = всеЭкраныТабов;
export const entryBlocks = главныеЭкраны;
export const hiddenBlocks = скрытыеЭкраны;
