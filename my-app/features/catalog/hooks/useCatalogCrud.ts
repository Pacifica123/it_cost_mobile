import { useMemo, useState } from 'react';
import { Alert } from 'react-native';

import {
  useData,
  type CapitalEquipment,
  type ExpenseCategory,
  type OperatingEquipment,
} from '../../../store/data/DataContext';
import type { ItemKind } from '../../../store/data/types';
import { onlyDigits } from '../../../shared/utils/number';
import { getDefaultCategoryId } from '../helpers';
import { inferCapitalKindByText, getCategoryNameById } from '../../../store/data/catalogRules';
import {
  buildCapitalItem,
  buildOperatingItem,
  getInitialCatalogForm,
  mapItemToCatalogForm,
} from '../logic/catalogForm';
import type { CatalogFormState, CatalogMode } from '../types';

export type CatalogFormErrors = Partial<Record<'categoryId' | 'name' | 'quantityRaw' | 'priceRaw', string>>;

type DeletedSnapshot = {
  item: CapitalEquipment | OperatingEquipment;
  mode: CatalogMode;
} | null;

const getCatalogFormErrors = (mode: CatalogMode, form: CatalogFormState): CatalogFormErrors => {
  const errors: CatalogFormErrors = {};
  const price = Number(form.priceRaw || 0);
  const quantity = Number(form.quantityRaw || 0);

  if (!form.categoryId.trim()) errors.categoryId = 'Выберите категорию.';
  if (!form.name.trim()) errors.name = 'Введите название позиции.';
  if (!form.priceRaw.trim()) errors.priceRaw = 'Введите сумму.';
  else if (!Number.isFinite(price) || price < 0) errors.priceRaw = 'Сумма не должна быть отрицательной.';

  if (mode === 'capital') {
    if (!form.quantityRaw.trim()) errors.quantityRaw = 'Введите количество.';
    else if (!Number.isFinite(quantity) || quantity <= 0) errors.quantityRaw = 'Количество должно быть больше 0.';
  }

  return errors;
};

const hasErrors = (errors: CatalogFormErrors) => Object.keys(errors).length > 0;

export function useCatalogCrud(mode: CatalogMode, categories: ExpenseCategory[], capitalKind?: ItemKind) {
  const { capitalData, operatingData, categories: allCategories, setCapitalData, setOperatingData, appSettings } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CatalogFormState>(() =>
    getInitialCatalogForm(getDefaultCategoryId(categories, mode))
  );
  const [formErrors, setFormErrors] = useState<CatalogFormErrors>({});
  const [lastDeleted, setLastDeleted] = useState<DeletedSnapshot>(null);

  const items = useMemo(
    () => (mode === 'capital' ? capitalData : operatingData),
    [capitalData, mode, operatingData]
  );

  const resetForm = () => {
    setEditingId(null);
    setForm(getInitialCatalogForm(getDefaultCategoryId(categories, mode)));
    setFormErrors({});
  };

  const openCreate = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEdit = (item: CapitalEquipment | OperatingEquipment) => {
    setEditingId(item.id);
    setForm(mapItemToCatalogForm(mode, item));
    setFormErrors({});
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const updateField = (field: keyof CatalogFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const persistCapitalItem = (nextItem: CapitalEquipment) => {
    setCapitalData((prev) =>
      editingId ? prev.map((item) => (item.id === editingId ? nextItem : item)) : [...prev, nextItem]
    );
  };

  const persistOperatingItem = (nextItem: OperatingEquipment) => {
    setOperatingData((prev) =>
      editingId ? prev.map((item) => (item.id === editingId ? nextItem : item)) : [...prev, nextItem]
    );
  };

  const saveItem = () => {
    const errors = getCatalogFormErrors(mode, form);
    setFormErrors(errors);
    if (hasErrors(errors)) return;

    if (mode === 'capital') {
      persistCapitalItem(buildCapitalItem(form, categories, editingId, capitalKind));
    } else {
      persistOperatingItem(buildOperatingItem(form, editingId));
    }

    closeModal();
  };

  const deleteNow = (id: string) => {
    const deleted = items.find((item) => item.id === id);
    if (mode === 'capital') {
      setCapitalData((prev) => prev.filter((item) => item.id !== id));
    } else {
      setOperatingData((prev) => prev.filter((item) => item.id !== id));
    }
    if (deleted) setLastDeleted({ item: deleted, mode });
    setSelectedId(null);
  };

  const deleteItem = (id: string) => {
    if (!appSettings.confirmDelete) {
      deleteNow(id);
      return;
    }

    Alert.alert('Удаление', 'Вы уверены?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => deleteNow(id) },
    ]);
  };

  const restoreLastDeleted = () => {
    if (!lastDeleted || lastDeleted.mode !== mode) return;

    if (mode === 'capital') {
      setCapitalData((prev) => [...prev, lastDeleted.item as CapitalEquipment]);
    } else {
      setOperatingData((prev) => [...prev, lastDeleted.item as OperatingEquipment]);
    }
    setLastDeleted(null);
  };

  const duplicateItem = (item: CapitalEquipment | OperatingEquipment) => {
    const copyId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

    if (mode === 'capital') {
      const capitalItem = item as CapitalEquipment;
      setCapitalData((prev) => [
        ...prev,
        { ...capitalItem, id: copyId, name: `${capitalItem.name} — копия` },
      ]);
    } else {
      const operatingItem = item as OperatingEquipment;
      setOperatingData((prev) => [
        ...prev,
        { ...operatingItem, id: copyId, name: `${operatingItem.name} — копия` },
      ]);
    }
  };

  const deleteCategoryItems = (categoryId: string) => {
    const categoryItems = items.filter((item) => item.categoryId === categoryId);
    if (!categoryItems.length) return;

    Alert.alert('Удалить все записи категории?', `Будет удалено записей: ${categoryItems.length}.`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          if (mode === 'capital') {
            setCapitalData((prev) => prev.filter((item) => item.categoryId !== categoryId));
          } else {
            setOperatingData((prev) => prev.filter((item) => item.categoryId !== categoryId));
          }
          setSelectedId(null);
        },
      },
    ]);
  };


  const getDefaultCapitalCategoryForKind = (targetKind: ItemKind) => {
    if (targetKind === 'software') return allCategories.find((category) => category.id === 'capital-software')?.id ?? getDefaultCategoryId(allCategories, 'capital');
    return allCategories.find((category) => category.id === 'capital-client')?.id ?? getDefaultCategoryId(allCategories, 'capital');
  };

  const getDefaultOperatingCategory = () =>
    allCategories.find((category) => category.id === 'operating-subscriptions')?.id ?? getDefaultCategoryId(allCategories, 'operating');

  const moveItem = (item: CapitalEquipment | OperatingEquipment, target: 'hardware' | 'software' | 'operating') => {
    const nextId = `${Date.now().toString(36)}-move-${Math.random().toString(36).slice(2, 7)}`;

    if (mode === 'capital') {
      const capitalItem = item as CapitalEquipment;
      if (target === 'operating') {
        setCapitalData((prev) => prev.filter((entry) => entry.id !== capitalItem.id));
        setOperatingData((prev) => [
          ...prev,
          {
            id: nextId,
            categoryId: getDefaultOperatingCategory(),
            name: capitalItem.name,
            price: capitalItem.quantity * capitalItem.price,
          },
        ]);
      } else {
        setCapitalData((prev) =>
          prev.map((entry) =>
            entry.id === capitalItem.id
              ? { ...entry, kind: target, categoryId: getDefaultCapitalCategoryForKind(target) }
              : entry
          )
        );
      }
    } else {
      const operatingItem = item as OperatingEquipment;
      setOperatingData((prev) => prev.filter((entry) => entry.id !== operatingItem.id));
      setCapitalData((prev) => [
        ...prev,
        {
          id: nextId,
          categoryId: getDefaultCapitalCategoryForKind(target === 'software' ? 'software' : 'hardware'),
          name: operatingItem.name,
          quantity: 1,
          price: operatingItem.price,
          kind: target === 'software' ? 'software' : 'hardware',
        },
      ]);
    }

    setSelectedId(null);
  };

  const mergeDuplicates = () => {
    if (mode === 'capital') {
      let mergedCount = 0;
      const relevant = (item: CapitalEquipment) => {
        if (!capitalKind) return true;
        const categoryName = getCategoryNameById(allCategories, item.categoryId);
        const kind = item.kind ?? inferCapitalKindByText(categoryName, item.name);
        return kind === capitalKind;
      };

      const kept: CapitalEquipment[] = [];
      const map = new Map<string, CapitalEquipment>();
      for (const item of capitalData) {
        if (!relevant(item)) {
          kept.push(item);
          continue;
        }
        const key = `${item.name.trim().toLowerCase()}::${item.categoryId}::${item.kind ?? 'unknown'}::${item.price}`;
        const existing = map.get(key);
        if (existing) {
          existing.quantity += item.quantity;
          mergedCount += 1;
        } else {
          map.set(key, { ...item });
        }
      }

      if (mergedCount === 0) {
        Alert.alert('Дубли не найдены', 'Одинаковых позиций для объединения нет.');
        return;
      }

      setCapitalData([...kept, ...Array.from(map.values())]);
      setSelectedId(null);
      Alert.alert('Дубли объединены', `Объединено повторов: ${mergedCount}.`);
      return;
    }

    let mergedCount = 0;
    const map = new Map<string, OperatingEquipment>();
    for (const item of operatingData) {
      const key = `${item.name.trim().toLowerCase()}::${item.categoryId}`;
      const existing = map.get(key);
      if (existing) {
        existing.price += item.price;
        mergedCount += 1;
      } else {
        map.set(key, { ...item });
      }
    }

    if (mergedCount === 0) {
      Alert.alert('Дубли не найдены', 'Одинаковых OPEX-позиций для объединения нет.');
      return;
    }

    setOperatingData(Array.from(map.values()));
    setSelectedId(null);
    Alert.alert('Дубли объединены', `Объединено повторов: ${mergedCount}.`);
  };

  const setQuantityRaw = (value: string) => updateField('quantityRaw', onlyDigits(value));
  const setPriceRaw = (value: string) => updateField('priceRaw', onlyDigits(value));

  return {
    items,
    modalVisible,
    editingId,
    form,
    formErrors,
    lastDeleted,
    selectedId,
    setSelectedId,
    openCreate,
    openEdit,
    closeModal,
    saveItem,
    deleteItem,
    duplicateItem,
    moveItem,
    mergeDuplicates,
    deleteCategoryItems,
    restoreLastDeleted,
    updateField,
    setQuantityRaw,
    setPriceRaw,
  };
}
