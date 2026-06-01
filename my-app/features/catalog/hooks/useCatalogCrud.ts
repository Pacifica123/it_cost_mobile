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
import {
  buildCapitalItem,
  buildOperatingItem,
  getInitialCatalogForm,
  hasRequiredCatalogFields,
  mapItemToCatalogForm,
} from '../logic/catalogForm';
import type { CatalogFormState, CatalogMode } from '../types';

export function useCatalogCrud(mode: CatalogMode, categories: ExpenseCategory[], capitalKind?: ItemKind) {
  const { capitalData, operatingData, setCapitalData, setOperatingData } = useData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CatalogFormState>(() =>
    getInitialCatalogForm(getDefaultCategoryId(categories, mode))
  );

  const items = useMemo(
    () => (mode === 'capital' ? capitalData : operatingData),
    [capitalData, mode, operatingData]
  );

  const resetForm = () => {
    setEditingId(null);
    setForm(getInitialCatalogForm(getDefaultCategoryId(categories, mode)));
  };

  const openCreate = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEdit = (item: CapitalEquipment | OperatingEquipment) => {
    setEditingId(item.id);
    setForm(mapItemToCatalogForm(mode, item));
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const updateField = (field: keyof CatalogFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
    if (!hasRequiredCatalogFields(mode, form)) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    if (mode === 'capital') {
      persistCapitalItem(buildCapitalItem(form, categories, editingId, capitalKind));
    } else {
      persistOperatingItem(buildOperatingItem(form, editingId));
    }

    closeModal();
  };

  const deleteItem = (id: string) => {
    Alert.alert('Удаление', 'Вы уверены?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          if (mode === 'capital') {
            setCapitalData((prev) => prev.filter((item) => item.id !== id));
          } else {
            setOperatingData((prev) => prev.filter((item) => item.id !== id));
          }
          setSelectedId(null);
        },
      },
    ]);
  };


  const duplicateItem = (item: CapitalEquipment | OperatingEquipment) => {
    const copyId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

    if (mode === 'capital') {
      const capitalItem = item as CapitalEquipment;
      setCapitalData((prev) => [
        ...prev,
        {
          ...capitalItem,
          id: copyId,
          name: `${capitalItem.name} — копия`,
        },
      ]);
    } else {
      const operatingItem = item as OperatingEquipment;
      setOperatingData((prev) => [
        ...prev,
        {
          ...operatingItem,
          id: copyId,
          name: `${operatingItem.name} — копия`,
        },
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

  const setQuantityRaw = (value: string) => updateField('quantityRaw', onlyDigits(value));
  const setPriceRaw = (value: string) => updateField('priceRaw', onlyDigits(value));

  return {
    items,
    modalVisible,
    editingId,
    form,
    selectedId,
    setSelectedId,
    openCreate,
    openEdit,
    closeModal,
    saveItem,
    deleteItem,
    duplicateItem,
    deleteCategoryItems,
    updateField,
    setQuantityRaw,
    setPriceRaw,
  };
}
