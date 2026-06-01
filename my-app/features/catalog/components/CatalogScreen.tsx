import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { exploreStyles as styles } from '../styles';
import { useData, selectCategoriesByScope } from '../../../store/data/DataContext';
import { getCategoryItems, getCategoryTotal, isCapitalCategoryRelevantForKind } from '../helpers';
import { useCatalogCrud } from '../hooks/useCatalogCrud';
import { useCategoryActions } from '../hooks/useCategoryActions';
import type { ItemKind } from '../../../store/data/types';
import type { CatalogMode } from '../types';
import { CategoryFormModal } from './CategoryFormModal';
import { CategoryTable } from './CategoryTable';
import { ItemFormModal } from './ItemFormModal';
import { AnimatedPressable, AnimatedScreenScroll, AnimatedSurface } from '../../../shared/ui';

export function CatalogScreen({ mode, title, capitalKind }: { mode: CatalogMode; title: string; capitalKind?: ItemKind }) {
  const { categories: allCategories, capitalData, operatingData } = useData();
  const baseCategories = selectCategoriesByScope(
    { projectMeta: { name: '', organization: '', budget: 0, targetClientSeats: 0, note: '', createdAt: '', updatedAt: '' }, projectEvents: [], categories: allCategories, capitalData, operatingData, electricityTotal: 0 },
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

      {categories.length === 0 ? (
        <AnimatedSurface style={styles.emptyState}>
          <Ionicons name="file-tray-outline" size={24} color="rgba(17,24,39,0.5)" />
          <Text style={styles.emptyTitle}>Нет категорий для отображения</Text>
          <Text style={styles.emptyText}>Добавь категорию или запись, чтобы раздел появился в расчётах.</Text>
        </AnimatedSurface>
      ) : null}

      {categories.map((category) => {
        const items = getCategoryItems(mode, category.id, capitalData, operatingData, allCategories, capitalKind);
        const total = getCategoryTotal(mode, items);

        return (
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
        );
      })}

      <ItemFormModal
        visible={catalog.modalVisible}
        title={catalog.editingId ? 'Редактировать запись' : 'Добавить запись'}
        categories={categoryOptions}
        categoryId={catalog.form.categoryId}
        name={catalog.form.name}
        quantityRaw={catalog.form.quantityRaw}
        priceRaw={catalog.form.priceRaw}
        showQuantity={mode === 'capital'}
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
