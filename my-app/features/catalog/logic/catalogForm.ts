import type { CapitalEquipment, ExpenseCategory, ItemKind, OperatingEquipment } from '../../../store/data/types';
import { inferCapitalKindByText, getCategoryNameById } from '../../../store/data/catalogRules';
import type { CatalogFormState, CatalogMode } from '../types';

export const hasRequiredCatalogFields = (mode: CatalogMode, form: CatalogFormState) => {
  const hasBaseFields = !!form.name.trim() && !!form.priceRaw.trim() && !!form.categoryId.trim();
  return mode === 'capital' ? hasBaseFields && !!form.quantityRaw.trim() : hasBaseFields;
};

export const getInitialCatalogForm = (categoryId: string): CatalogFormState => ({
  name: '',
  categoryId,
  quantityRaw: '',
  priceRaw: '',
});

export const buildCapitalItem = (
  form: CatalogFormState,
  categories: ExpenseCategory[],
  editingId?: string | null,
  forcedKind?: ItemKind
): CapitalEquipment => ({
  id: editingId ?? Date.now().toString(),
  categoryId: form.categoryId,
  name: form.name.trim(),
  quantity: Number(form.quantityRaw || 0),
  price: Number(form.priceRaw || 0),
  kind: forcedKind ?? inferCapitalKindByText(getCategoryNameById(categories, form.categoryId), form.name),
});

export const buildOperatingItem = (form: CatalogFormState, editingId?: string | null): OperatingEquipment => ({
  id: editingId ?? Date.now().toString(),
  categoryId: form.categoryId,
  name: form.name.trim(),
  price: Number(form.priceRaw || 0),
});

export const mapItemToCatalogForm = (
  mode: CatalogMode,
  item: CapitalEquipment | OperatingEquipment
): CatalogFormState => ({
  name: item.name,
  categoryId: item.categoryId,
  quantityRaw: mode === 'capital' && 'quantity' in item ? String(item.quantity ?? '') : '',
  priceRaw: String(item.price ?? ''),
});

export const categoryExistsByName = (categories: ExpenseCategory[], name: string) => {
  const normalized = name.trim().toLowerCase();
  return categories.some((category) => category.name.trim().toLowerCase() === normalized);
};
