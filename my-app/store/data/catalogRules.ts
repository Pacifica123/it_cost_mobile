import type {
  CapitalEquipment,
  CategoryScope,
  ExpenseCategory,
  ItemKind,
  OperatingEquipment,
} from './types';

const SOFTWARE_HINTS = ['лиценз', 'подписк', 'windows', 'linux', 'software', 'license', 'office'];
export const ONE_TIME_OPERATING_CATEGORIES = new Set(['Миграция', 'Тестирование']);

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const createCategoryId = (scope: CategoryScope, name: string) => `${scope}-${slugify(name) || Date.now()}`;

export const getCategoryNameById = (categories: ExpenseCategory[], categoryId: string) =>
  categories.find((category) => category.id === categoryId)?.name ?? 'Без категории';

export const inferCapitalKindByText = (categoryName: string, name: string): ItemKind => {
  const haystack = `${categoryName} ${name}`.toLowerCase();
  return SOFTWARE_HINTS.some((hint) => haystack.includes(hint)) ? 'software' : 'hardware';
};

export const ensureCapitalKinds = (items: CapitalEquipment[], categories: ExpenseCategory[]) =>
  items.map((item) => ({
    ...item,
    kind: item.kind ?? inferCapitalKindByText(getCategoryNameById(categories, item.categoryId), item.name),
  }));

export const ensureUniqueCategories = (
  existing: ExpenseCategory[],
  extraCapital: CapitalEquipment[],
  extraOperating: OperatingEquipment[]
) => {
  const map = new Map(existing.map((category) => [category.id, category]));

  for (const item of extraCapital) {
    if (map.has(item.categoryId)) continue;

    map.set(item.categoryId, {
      id: item.categoryId,
      name: 'Без категории',
      scope: 'capital',
    });
  }

  for (const item of extraOperating) {
    if (map.has(item.categoryId)) continue;

    map.set(item.categoryId, {
      id: item.categoryId,
      name: 'Без категории',
      scope: 'operating',
      mode: 'periodic',
    });
  }

  return Array.from(map.values());
};

export const getCategoryModeFallback = (categoryName: string) =>
  ONE_TIME_OPERATING_CATEGORIES.has(categoryName) ? 'oneTime' : 'periodic';
