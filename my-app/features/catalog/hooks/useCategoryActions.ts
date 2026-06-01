import { useState } from 'react';
import { Alert } from 'react-native';

import { useData, type CategoryMode, type ExpenseCategory } from '../../../store/data/DataContext';
import { categoryExistsByName } from '../logic/catalogForm';
import type { CatalogMode } from '../types';

export function useCategoryActions(mode: CatalogMode, categories: ExpenseCategory[]) {
  const { addCategory } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [categoryMode, setCategoryMode] = useState<CategoryMode>('periodic');

  const closeModal = () => {
    setModalVisible(false);
    setName('');
    setCategoryMode('periodic');
  };

  const saveCategory = () => {
    const trimmed = name.trim();

    if (!trimmed || categoryExistsByName(categories, trimmed)) {
      Alert.alert('Ошибка', 'Такая категория уже существует или поле пустое');
      return;
    }

    addCategory({
      name: trimmed,
      scope: mode,
      mode: mode === 'operating' ? categoryMode : undefined,
    });

    closeModal();
  };

  return {
    modalVisible,
    setModalVisible,
    closeModal,
    name,
    setName,
    categoryMode,
    setCategoryMode,
    saveCategory,
  };
}
