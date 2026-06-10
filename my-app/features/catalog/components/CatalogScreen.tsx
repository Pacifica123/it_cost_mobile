import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { useCatalogStyles } from '../styles';
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
import { useThemePalette } from '../../../shared/theme';

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
  const styles = useCatalogStyles();

  const palette = useThemePalette();
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
    })
      .filter((entry) => query.trim() ? entry.items.length > 0 : true)
      .sort((a, b) => {
        if (sortMode === 'priceDesc') return b.total - a.total;
        if (sortMode === 'priceAsc') return a.total - b.total;
        if (sortMode === 'name') return a.category.name.localeCompare(b.category.name, 'ru');
        return 0;
      }),
    [allCategories, capitalData, capitalKind, categories, mode, operatingData, query, sortMode]
  );

  return (
    <AnimatedScreenScroll
      style={[styles.container, { backgroundColor: palette.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.topBar, { backgroundColor: palette.surface, borderColor: palette.borderSoft }]}>
        <Text style={[styles.screenTitle, { color: palette.text }]}>{title}</Text>

        <View style={styles.topActions}>
          <AnimatedPressable style={[styles.chipBtn, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]} onPress={catalog.openCreate}>
            <Ionicons name="add" size={18} color={palette.text} />
            <Text style={[styles.chipText, { color: palette.text }]}>Запись</Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.chipBtn, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}
            onPress={() => categoryActions.setModalVisible(true)}
          >
            <Ionicons name="folder-open-outline" size={18} color={palette.text} />
            <Text style={[styles.chipText, { color: palette.text }]}>Категория</Text>
          </AnimatedPressable>
        </View>
      </View>

      <AnimatedSurface style={[styles.catalogTools, { backgroundColor: palette.surface, borderColor: palette.borderSoft }]}>
        <View style={[styles.menuSearchBox, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}>
          <Ionicons name="search" size={18} color={palette.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Найти позицию"
            placeholderTextColor={palette.textMuted}
            style={[styles.menuSearchInput, { color: palette.text }]}
            autoCorrect={false}
            maxFontSizeMultiplier={1.12}
          />
          {query ? (
            <AnimatedPressable onPress={() => setQuery('')} style={[styles.menuSearchClear, { backgroundColor: palette.surface }]} pressedScale={0.9}>
              <Ionicons name="close" size={18} color={palette.textMuted} />
            </AnimatedPressable>
          ) : null}
        </View>
        <View style={styles.sortRow}>
          {sortOptions.map((option) => (
            <AnimatedPressable
              key={option.id}
              style={[styles.sortChip, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }, option.id === sortMode && { backgroundColor: palette.primarySoft, borderColor: palette.primary }]}
              onPress={() => setSortMode(option.id)}
              pressedScale={0.96}
            >
              <Text style={[styles.sortChipText, { color: option.id === sortMode ? palette.primary : palette.text }]} maxFontSizeMultiplier={1.1}>{option.label}</Text>
            </AnimatedPressable>
          ))}
          <AnimatedPressable style={[styles.sortChip, { backgroundColor: palette.primarySoft, borderColor: palette.primary }]} onPress={catalog.mergeDuplicates} pressedScale={0.96}>
            <Text style={[styles.sortChipText, { color: palette.primary }]} maxFontSizeMultiplier={1.1}>Объединить дубли</Text>
          </AnimatedPressable>
        </View>
      </AnimatedSurface>

      {catalog.lastDeleted ? (
        <AnimatedSurface style={[styles.undoBox, { backgroundColor: palette.warningSoft, borderColor: palette.isDark ? 'rgba(245,158,11,0.34)' : 'rgba(245,158,11,0.22)' }]}>
          <Text style={[styles.undoText, { color: palette.warning }]} maxFontSizeMultiplier={1.1}>Удалена запись «{catalog.lastDeleted.item.name}».</Text>
          <AnimatedPressable style={[styles.chipBtn, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]} onPress={catalog.restoreLastDeleted} pressedScale={0.96}>
            <Ionicons name="arrow-undo-outline" size={18} color={palette.text} />
            <Text style={[styles.chipText, { color: palette.text }]}>Отменить удаление</Text>
          </AnimatedPressable>
        </AnimatedSurface>
      ) : null}

      {categories.length === 0 ? (
        <AnimatedSurface style={[styles.emptyState, { backgroundColor: palette.surface, borderColor: palette.borderSoft }]}>
          <Ionicons name="file-tray-outline" size={24} color={palette.textMuted} />
          <Text style={[styles.emptyTitle, { color: palette.text }]}>Нет категорий для отображения</Text>
          <Text style={[styles.emptyText, { color: palette.textMuted }]}>Добавь категорию или запись, чтобы раздел появился в расчётах.</Text>
        </AnimatedSurface>
      ) : null}

      {visibleCategoryData.length === 0 && categories.length > 0 ? (
        <AnimatedSurface style={[styles.emptyState, { backgroundColor: palette.surface, borderColor: palette.borderSoft }]}>
          <Ionicons name="search-outline" size={24} color={palette.textMuted} />
          <Text style={[styles.emptyTitle, { color: palette.text }]}>Позиции не найдены</Text>
          <Text style={[styles.emptyText, { color: palette.textMuted }]}>Очистите поиск или измените запрос.</Text>
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
          onMove={catalog.moveItem}
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
