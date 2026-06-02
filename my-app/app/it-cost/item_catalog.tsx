import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { projectStyles as styles } from '../../features/project/styles';
import {
  catalogItemToCapital,
  catalogItemToOperating,
  filterCatalogItems,
  typicalCatalogItems,
  type CatalogItemType,
  type TypicalCatalogItem,
} from '../../features/catalog/logic/itemCatalog';
import { useData } from '../../store/data/DataContext';
import { AnimatedPressable, AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing } from '../../shared/theme';
import { formatCurrencyRU } from '../../shared/utils/currency';

export const title = 'Каталог типовых позиций';

type FilterType = CatalogItemType | 'all';
type SortMode = 'default' | 'priceDesc' | 'priceAsc' | 'name';

const sortOptions: Array<{ id: SortMode; label: string }> = [
  { id: 'default', label: 'Как добавлено' },
  { id: 'priceDesc', label: 'Дороже' },
  { id: 'priceAsc', label: 'Дешевле' },
  { id: 'name', label: 'А–Я' },
];

const filters: { id: FilterType; title: string }[] = [
  { id: 'all', title: 'Все' },
  { id: 'hardware', title: 'ТО' },
  { id: 'software', title: 'ПО' },
  { id: 'operating', title: 'OPEX' },
];

function FilterButton({ filter, active, onPress }: { filter: { id: FilterType; title: string }; active: boolean; onPress: () => void }) {
  return (
    <AnimatedPressable onPress={onPress} pressedScale={0.96} style={[local.filterButton, active && local.filterButtonActive]}>
      <Text style={[local.filterText, active && local.filterTextActive]} maxFontSizeMultiplier={1.1}>{filter.title}</Text>
    </AnimatedPressable>
  );
}

function SortButton({ option, active, onPress }: { option: { id: SortMode; label: string }; active: boolean; onPress: () => void }) {
  return (
    <AnimatedPressable onPress={onPress} pressedScale={0.96} style={[local.filterButton, active && local.filterButtonActive]}>
      <Text style={[local.filterText, active && local.filterTextActive]} maxFontSizeMultiplier={1.1}>{option.label}</Text>
    </AnimatedPressable>
  );
}

const getCatalogItemPrice = (item: TypicalCatalogItem) => item.defaultPrice * (item.defaultQuantity ?? 1);

const sortCatalogItems = (items: TypicalCatalogItem[], sortMode: SortMode) => {
  const indexed = items.map((item, index) => ({ item, index }));
  indexed.sort((a, b) => {
    if (sortMode === 'priceDesc') return getCatalogItemPrice(b.item) - getCatalogItemPrice(a.item);
    if (sortMode === 'priceAsc') return getCatalogItemPrice(a.item) - getCatalogItemPrice(b.item);
    if (sortMode === 'name') return a.item.title.localeCompare(b.item.title, 'ru');
    return a.index - b.index;
  });
  return indexed.map((entry) => entry.item);
};

function CatalogCard({ item, onAdd }: { item: TypicalCatalogItem; onAdd: () => void }) {
  const typeLabel = item.type === 'hardware' ? 'ТО' : item.type === 'software' ? 'ПО' : 'OPEX';
  const quantityLabel = item.type === 'operating' ? 'ежемесячно' : `${item.defaultQuantity ?? 1} шт.`;

  return (
    <View style={local.itemCard}>
      <View style={local.itemHeader}>
        <View style={local.itemTitleBox}>
          <Text style={local.itemTitle} maxFontSizeMultiplier={1.12}>{item.title}</Text>
          <Text style={local.itemDescription} maxFontSizeMultiplier={1.12}>{item.description}</Text>
        </View>
        <Text style={local.typeBadge} maxFontSizeMultiplier={1.1}>{typeLabel}</Text>
      </View>
      <View style={local.metaRow}>
        <Text style={local.metaText} maxFontSizeMultiplier={1.1}>{formatCurrencyRU(item.defaultPrice)}</Text>
        <Text style={local.metaText} maxFontSizeMultiplier={1.1}>{quantityLabel}</Text>
      </View>
      <View style={local.tagRow}>
        {item.tags.slice(0, 3).map((tag) => (
          <Text key={tag} style={local.tag} maxFontSizeMultiplier={1.05}>{tag}</Text>
        ))}
      </View>
      <AnimatedPressable onPress={onAdd} pressedScale={0.97} style={local.addButton}>
        <Text style={local.addButtonText} maxFontSizeMultiplier={1.1}>Добавить в проект</Text>
      </AnimatedPressable>
    </View>
  );
}

export default function ItemCatalogScreen() {
  const data = useData();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const filteredItems = useMemo(
    () => sortCatalogItems(filterCatalogItems(typicalCatalogItems, query, filter), sortMode),
    [filter, query, sortMode]
  );

  const addItem = (item: TypicalCatalogItem) => {
    if (item.type === 'operating') {
      data.setOperatingData((current) => [catalogItemToOperating(item), ...current]);
      return;
    }

    data.setCapitalData((current) => [catalogItemToCapital(item), ...current]);
  };

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.1}>Быстрое заполнение</Text>
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.08}>Каталог типовых позиций</Text>
        <Text style={styles.heroText} maxFontSizeMultiplier={1.12}>
          Добавляйте оборудование, ПО и эксплуатационные расходы из готового справочника, а затем уточняйте цены в нужном разделе.
        </Text>
      </View>

      <AppCard delay={40} style={local.cardGap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Найти: сервер, ПК, backup, Office..."
          placeholderTextColor={colors.textMuted}
          style={local.searchInput}
          autoCorrect={false}
          autoCapitalize="none"
          maxFontSizeMultiplier={1.12}
        />
        <View style={local.filterRow}>
          {filters.map((item) => (
            <FilterButton key={item.id} filter={item} active={filter === item.id} onPress={() => setFilter(item.id)} />
          ))}
        </View>
        <View style={local.filterRow}>
          {sortOptions.map((option) => (
            <SortButton key={option.id} option={option} active={sortMode === option.id} onPress={() => setSortMode(option.id)} />
          ))}
        </View>
      </AppCard>

      <AppCard delay={80} style={local.cardGap}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Позиции</Text>
        {filteredItems.length === 0 ? (
          <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>Ничего не найдено. Попробуйте другой запрос или фильтр.</Text>
        ) : null}
        {filteredItems.map((item) => (
          <CatalogCard key={item.id} item={item} onAdd={() => addItem(item)} />
        ))}
      </AppCard>
    </AnimatedScreenScroll>
  );
}

const local = StyleSheet.create({
  cardGap: {
    gap: spacing.md,
  },
  searchInput: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingVertical: 9,
    paddingHorizontal: 13,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  filterTextActive: {
    color: colors.textOnDark,
  },
  itemCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  itemTitleBox: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
  },
  itemDescription: {
    color: colors.textSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: 4,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaText: {
    color: colors.text,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    color: colors.textMuted,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
  },
  addButton: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  addButtonText: {
    color: colors.textOnDark,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
});
