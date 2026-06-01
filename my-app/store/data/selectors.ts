import type { CapitalEquipment, CategoryMode, CategoryScope, DataState, ExpenseCategory, OperatingEquipment } from './types';

export const selectCategoriesByScope = (state: DataState, scope: CategoryScope) =>
  state.categories
    .filter((category) => category.scope === scope)
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));

export const selectCategoryById = (state: DataState, categoryId: string): ExpenseCategory | undefined =>
  state.categories.find((category) => category.id === categoryId);

export const selectCategoryByName = (
  state: DataState,
  scope: CategoryScope,
  categoryName: string
): ExpenseCategory | undefined =>
  state.categories.find(
    (category) => category.scope === scope && category.name === categoryName
  );

export const resolveCategoryName = (categories: ExpenseCategory[], categoryId: string) =>
  categories.find((category) => category.id === categoryId)?.name ?? 'Без категории';

export const groupByResolvedCategory = <T extends { categoryId: string }>(items: T[], categories: ExpenseCategory[]) => {
  const grouped: Record<string, T[]> = {};
  for (const item of items) {
    const categoryName = resolveCategoryName(categories, item.categoryId);
    (grouped[categoryName] ||= []).push(item);
  }
  return grouped;
};

export const selectCapitalGrouped = (state: DataState) => groupByResolvedCategory(state.capitalData, state.categories);
export const selectOperatingGrouped = (state: DataState) => groupByResolvedCategory(state.operatingData, state.categories);

export const selectCapitalTotal = (state: DataState) =>
  state.capitalData.reduce((sum, item) => sum + item.quantity * item.price, 0);

export const selectOperatingTotal = (state: DataState) =>
  state.operatingData.reduce((sum, item) => sum + item.price, 0);

export const selectOperatingByMode = (state: DataState, mode: CategoryMode): OperatingEquipment[] => {
  const categoryIds = new Set(
    state.categories
      .filter((category) => category.scope === 'operating' && category.mode === mode)
      .map((category) => category.id)
  );

  return state.operatingData.filter((item) => categoryIds.has(item.categoryId));
};

export const selectCapitalForCategory = (state: DataState, categoryId: string): CapitalEquipment[] =>
  state.capitalData.filter((item) => item.categoryId === categoryId);

export const selectOperatingForCategory = (state: DataState, categoryId: string): OperatingEquipment[] =>
  state.operatingData.filter((item) => item.categoryId === categoryId);
