import type { CapitalEquipment, CategoryScope, ExpenseCategory, ItemKind, OperatingEquipment } from '../../store/data/types';
import { inferCapitalKindByText, getCategoryNameById } from '../../store/data/catalogRules';
import type { CatalogMode } from './types';

export const getDefaultCategoryId = (categories: ExpenseCategory[], scope: CategoryScope) =>
  categories.find((category) => category.scope === scope)?.id ?? '';

export const getCategoryItems = (
  mode: CatalogMode,
  categoryId: string,
  capitalData: CapitalEquipment[],
  operatingData: OperatingEquipment[],
  categories: ExpenseCategory[] = [],
  capitalKind?: ItemKind
): Array<CapitalEquipment | OperatingEquipment> => {
  if (mode !== 'capital') {
    return operatingData.filter((item) => item.categoryId === categoryId);
  }

  return capitalData
    .filter((item) => item.categoryId === categoryId)
    .filter((item) => {
      if (!capitalKind) return true;
      const categoryName = getCategoryNameById(categories, item.categoryId);
      const kind = item.kind ?? inferCapitalKindByText(categoryName, item.name);
      return kind === capitalKind;
    });
};

export const isCapitalCategoryRelevantForKind = (
  category: ExpenseCategory,
  capitalKind: ItemKind,
  capitalData: CapitalEquipment[],
  categories: ExpenseCategory[]
) => {
  const inferredByName = inferCapitalKindByText(category.name, '') === capitalKind;
  const hasItems = getCategoryItems('capital', category.id, capitalData, [], categories, capitalKind).length > 0;
  return inferredByName || hasItems;
};

export const getCategoryTotal = (mode: CatalogMode, items: Array<CapitalEquipment | OperatingEquipment>) => {
  if (mode === 'capital') {
    return items.reduce(
      (sum, item) => sum + Number('quantity' in item ? item.quantity : 0) * Number(item.price || 0),
      0
    );
  }

  return items.reduce((sum, item) => sum + Number(item.price || 0), 0);
};
