import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { exploreStyles as styles } from '../styles';
import { useData, selectCategoriesByScope } from '../../../store/data/DataContext';
import { getCategoryItems, getCategoryTotal, isCapitalCategoryRelevantForKind } from '../helpers';
import { useCatalogCrud } from '../hooks/useCatalogCrud';
import { useCategoryActions } from '../hooks/useCategoryActions';
import type { CapitalEquipment, OperatingEquipment } from '../../../store/data/types';
import type { ItemKind } from '../../../store/data/types';
import type { CatalogMode } from '../types';
import { CategoryFormModal } from './CategoryFormModal';
import { CategoryTable } from './CategoryTable';
import { ItemFormModal } from './ItemFormModal';
import { AnimatedPressable, AnimatedScreenScroll, AnimatedSurface } from '../../../shared/ui';
import { colors } from '../../../shared/theme';

type SortMode = 'default' | 'priceDesc' | 'priceAsc' | 'name';

const sortOptions: Array<{ id: SortMode; label: string }> = [
  { id: 'default', label: 'Как добавлено' },
  { id: 'priceDesc', label: 'Дороже' },
  { id: 'priceAsc', label: 'Дешевле' },
  { id: 'name', label: 'А–Я' },
];

const getItemTotal = (mode: CatalogMode, item: CapitalEquipment | OperatingEquipment) =>
  mode === 'capital' ? (item as CapitalEquipment).quantity * item.price : item.price;

const filterAndSortItems = (
  mode: CatalogMode,
  items: Array<CapitalEquipment | OperatingEquipment>,
  query: string,
  sortMode: SortMode
) => {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? items.filter((item) => item.name.toLowerCase().includes(normalizedQuery))
    : items;

  return [...filtered].sort((a, b) => {
    if (sortMode === 'priceDesc') return getItemTotal(mode, b) - getItemTotal(mode, a);
    if (sortMode === 'priceAsc') return getItemTotal(mode, a) - getItemTotal(mode, b);
    if (sortMode === 'name') return a.name.localeCompare(b.name, 'ru');
    return 0;
  });
};

export function CatalogScreen({ mode, title, capitalKind }: { mode: CatalogMode; title: string; capitalKind?: ItemKind }) {
  const { categories: allCategories, capitalData, operatingData } = useData();
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const baseCategories = selectCategoriesByScope(
    { schemaVersion: 3, projectMeta: { name: '', organization: '', budget: 0, targetClientSeats: 0, note: '', createdAt: '', updatedAt: '' }, appSettings: { themeMode: 'system', currency: 'RUB', roundingMode: 'rubles', confirmDelete: true }, projectEvents: [], projectBackups: [], undoStack: [], redoStack: [], categories: allCategories, capitalData, operatingData, electricityTotal: 0 },
    mode
  );
  const categories = mode === 'capital' && capitalKind
    ? baseCategories.filter((category) =>
        isCapitalCategoryRelevantForKind(category, capitalKind, capitalData, allCategories)
      )
    : baseCategories;

  const catalog = useCatalogCrud(mode, categories, capitalKind);
  const categoryActions = useCategoryActions(mode, categories);
  const categoryOptions = categories.map((category) => ({ id: category.id, name: category.name }));

  const visibleCategoryData = useMemo(
    () => categories.map((category) => {
      const items = getCategoryItems(mode, category.id, capitalData, operatingData, allCategories, capitalKind);
      const visibleItems = filterAndSortItems(mode, items, query, sortMode);
      return {
        category,
        items: visibleItems,
        total: getCategoryTotal(mode, visibleItems),
        originalCount: items.length,
      };
    }).filter((entry) => query.trim() ? entry.items.length > 0 : true),
    [allCategories, capitalData, capitalKind, categories, mode, operatingData, query, sortMode]
  );

  return (
    <AnimatedScreenScroll
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topBar}>
        <Text style={styles.screenTitle}>{title}</Text>

        <View style={styles.topActions}>
          <AnimatedPressable style={styles.chipBtn} onPress={catalog.openCreate}>
            <Ionicons name="add" size={18} color="#111827" />
            <Text style={styles.chipText}>Запись</Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={styles.chipBtn}
            onPress={() => categoryActions.setModalVisible(true)}
          >
            <Ionicons name="folder-open-outline" size={18} color="#111827" />
            <Text style={styles.chipText}>Категория</Text>
          </AnimatedPressable>
        </View>
      </View>

      <AnimatedSurface style={styles.catalogTools}>
        <View style={styles.menuSearchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Найти позицию"
            placeholderTextColor={colors.textMuted}
            style={styles.menuSearchInput}
            autoCorrect={false}
            maxFontSizeMultiplier={1.12}
          />
          {query ? (
            <AnimatedPressable onPress={() => setQuery('')} style={styles.menuSearchClear} pressedScale={0.9}>
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </AnimatedPressable>
          ) : null}
        </View>
        <View style={styles.sortRow}>
          {sortOptions.map((option) => (
            <AnimatedPressable
              key={option.id}
              style={[styles.sortChip, option.id === sortMode && styles.sortChipActive]}
              onPress={() => setSortMode(option.id)}
              pressedScale={0.96}
            >
              <Text style={styles.sortChipText} maxFontSizeMultiplier={1.1}>{option.label}</Text>
            </AnimatedPressable>
          ))}
        </View>
      </AnimatedSurface>

      {catalog.lastDeleted ? (
        <AnimatedSurface style={styles.undoBox}>
          <Text style={styles.undoText} maxFontSizeMultiplier={1.1}>Удалена запись «{catalog.lastDeleted.item.name}».</Text>
          <AnimatedPressable style={styles.chipBtn} onPress={catalog.restoreLastDeleted} pressedScale={0.96}>
            <Ionicons name="arrow-undo-outline" size={18} color="#111827" />
            <Text style={styles.chipText}>Отменить удаление</Text>
          </AnimatedPressable>
        </AnimatedSurface>
      ) : null}

      {categories.length === 0 ? (
        <AnimatedSurface style={styles.emptyState}>
          <Ionicons name="file-tray-outline" size={24} color="rgba(17,24,39,0.5)" />
          <Text style={styles.emptyTitle}>Нет категорий для отображения</Text>
          <Text style={styles.emptyText}>Добавь категорию или запись, чтобы раздел появился в расчётах.</Text>
        </AnimatedSurface>
      ) : null}

      {visibleCategoryData.length === 0 && categories.length > 0 ? (
        <AnimatedSurface style={styles.emptyState}>
          <Ionicons name="search-outline" size={24} color="rgba(17,24,39,0.5)" />
          <Text style={styles.emptyTitle}>Позиции не найдены</Text>
          <Text style={styles.emptyText}>Очистите поиск или измените запрос.</Text>
        </AnimatedSurface>
      ) : null}

      {visibleCategoryData.map(({ category, items, total }) => (
        <CategoryTable
          key={category.id}
          mode={mode}
          categoryName={category.name}
          items={items}
          total={total}
          selectedId={catalog.selectedId}
          onToggleSelect={(itemId) =>
            catalog.setSelectedId((prev) => (prev === itemId ? null : itemId))
          }
          onEdit={catalog.openEdit}
          onDelete={catalog.deleteItem}
          onDuplicate={catalog.duplicateItem}
          onDeleteAll={() => catalog.deleteCategoryItems(category.id)}
        />
      ))}

      <ItemFormModal
        visible={catalog.modalVisible}
        title={catalog.editingId ? 'Редактировать запись' : 'Добавить запись'}
        categories={categoryOptions}
        categoryId={catalog.form.categoryId}
        name={catalog.form.name}
        quantityRaw={catalog.form.quantityRaw}
        priceRaw={catalog.form.priceRaw}
        showQuantity={mode === 'capital'}
        errors={catalog.formErrors}
        onChangeCategory={(value) => catalog.updateField('categoryId', value)}
        onChangeName={(value) => catalog.updateField('name', value)}
        onChangeQuantity={catalog.setQuantityRaw}
        onChangePrice={catalog.setPriceRaw}
        onSave={catalog.saveItem}
        onClose={catalog.closeModal}
      />

      <CategoryFormModal
        visible={categoryActions.modalVisible}
        name={categoryActions.name}
        showMode={mode === 'operating'}
        mode={categoryActions.categoryMode}
        onChangeName={categoryActions.setName}
        onChangeMode={categoryActions.setCategoryMode}
        onSave={categoryActions.saveCategory}
        onClose={categoryActions.closeModal}
      />
    </AnimatedScreenScroll>
  );
}
