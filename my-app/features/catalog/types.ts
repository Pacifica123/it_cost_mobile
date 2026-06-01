import type { CapitalEquipment, CategoryMode, ExpenseCategory, OperatingEquipment } from '../../store/data/types';

export type CatalogMode = 'capital' | 'operating';

export type CatalogItem = CapitalEquipment | OperatingEquipment;

export type CatalogFormState = {
  name: string;
  categoryId: string;
  quantityRaw: string;
  priceRaw: string;
};

export type CategoryOption = Pick<ExpenseCategory, 'id' | 'name'>;

export type CategoryFormState = {
  name: string;
  mode: CategoryMode;
};
