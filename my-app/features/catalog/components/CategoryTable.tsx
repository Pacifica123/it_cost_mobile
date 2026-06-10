import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { useCatalogStyles } from '../styles';
import { formatNumber } from '../../../shared/utils/number';
import { formatRub } from '../../../shared/utils/currency';
import type { CapitalEquipment, OperatingEquipment } from '../../../store/data/types';
import type { CatalogMode } from '../types';
import { SwipeDeleteAction, SwipeEditAction } from './SwipeRowActions';
import { AnimatedPressable, AnimatedSurface } from '../../../shared/ui';
import { useThemePalette, colors, type ThemePalette } from '../../../shared/theme';

export function CategoryTable(props: {
  mode: CatalogMode;
  categoryName: string;
  items: Array<CapitalEquipment | OperatingEquipment>;
  total: number;
  selectedId: string | null;
  onToggleSelect: (itemId: string) => void;
  onEdit: (item: CapitalEquipment | OperatingEquipment) => void;
  onDelete: (itemId: string) => void;
  onDuplicate: (item: CapitalEquipment | OperatingEquipment) => void;
  onMove: (item: CapitalEquipment | OperatingEquipment, target: 'hardware' | 'software' | 'operating') => void;
  onDeleteAll: () => void;
}) {
  const localStyles = useLocalStyles();

  const styles = useCatalogStyles();

  const { mode, categoryName, items, total, selectedId, onToggleSelect, onEdit, onDelete, onDuplicate, onMove, onDeleteAll } = props;
  const palette = useThemePalette();
  const showQuantity = mode === 'capital';

  return (
    <AnimatedSurface style={[styles.categoryCard, { backgroundColor: palette.surface, borderColor: palette.borderSoft }]}>
      <View style={styles.categoryHeader}>
        <Text style={[styles.categoryTitle, { color: palette.text }]} numberOfLines={2}>{categoryName}</Text>
        <View style={[styles.badge, { backgroundColor: palette.primarySoft }]}>
          <Text style={[styles.badgeText, { color: palette.primary }]}>{formatNumber(items.length)}</Text>
        </View>
      </View>

      <Text style={[localStyles.totalText, { color: palette.textMuted }]}>Итого: {formatRub(total)}</Text>

      <View style={[styles.table, { backgroundColor: palette.surface, borderColor: palette.borderSoft }]}>
        <View style={[styles.tableHeader, { backgroundColor: palette.surfaceMuted }]}>
          <Text style={[styles.cell, styles.cellHeader, localStyles.nameCell, { color: palette.textSoft }]}>Наименование</Text>
          {showQuantity ? (
            <Text style={[styles.cell, styles.cellHeader, localStyles.qtyCell, styles.cellCenter, { color: palette.textSoft }]}>Кол-во</Text>
          ) : null}
          <Text style={[styles.cell, styles.cellHeader, localStyles.priceCell, showQuantity ? styles.cellCenter : styles.cellRight, { color: palette.textSoft }]}>
            Цена{showQuantity ? '' : ', ₽'}
          </Text>
        </View>

        {items.length === 0 ? (
          <View style={[localStyles.emptyRow, { backgroundColor: palette.surface, borderTopColor: palette.borderSoft }]}>
            <Text style={[localStyles.emptyText, { color: palette.textMuted }]}>Пока нет записей в этой категории.</Text>
          </View>
        ) : items.map((item, idx) => {
          const isSelected = selectedId === item.id;
          return (
            <Swipeable
              key={item.id}
              renderLeftActions={() => <SwipeEditAction onPress={() => onEdit(item)} />}
              renderRightActions={() => <SwipeDeleteAction onPress={() => onDelete(item.id)} />}
              overshootLeft={false}
              overshootRight={false}
            >
              <TouchableOpacity
                style={[styles.row, { backgroundColor: idx % 2 === 1 ? palette.surfaceMuted : palette.surface, borderTopColor: palette.borderSoft }, isSelected && { backgroundColor: palette.successSoft }]}
                activeOpacity={0.85}
                onPress={() => onToggleSelect(item.id)}
              >
                <Text style={[styles.cell, localStyles.nameCell, { color: palette.text }]} numberOfLines={2}>{item.name}</Text>
                {showQuantity ? (
                  <Text style={[styles.cell, localStyles.qtyCell, styles.cellCenter, { color: palette.text }]} numberOfLines={1}>
                    {formatNumber((item as CapitalEquipment).quantity)}
                  </Text>
                ) : null}
                <Text style={[styles.cell, localStyles.priceCell, showQuantity ? styles.cellCenter : styles.cellRight, { color: palette.text }]} numberOfLines={1}>
                  {formatRub(item.price)}
                </Text>
              </TouchableOpacity>
            </Swipeable>
          );
        })}
      </View>

      {selectedId && items.some((item) => item.id === selectedId) ? (
        <View style={styles.actionBar}>
          <AnimatedPressable
            style={[styles.actionBtn, localStyles.actionDuplicate, { backgroundColor: palette.primarySoft, borderColor: palette.borderSoft }]}
            onPress={() => {
              const selectedItem = items.find((item) => item.id === selectedId);
              if (selectedItem) onDuplicate(selectedItem);
            }}
          >
            <Ionicons name="copy-outline" size={18} color={palette.text} />
            <Text style={[styles.actionText, { color: palette.text }]}>Дублировать</Text>
          </AnimatedPressable>

          {(() => {
            const selectedItem = items.find((item) => item.id === selectedId);
            if (!selectedItem) return null;
            const isCapital = mode === 'capital';
            const currentKind = isCapital && 'kind' in selectedItem ? selectedItem.kind : undefined;
            return (
              <>
                {(!isCapital || currentKind !== 'hardware') ? (
                  <AnimatedPressable style={[styles.actionBtn, localStyles.actionMove, { backgroundColor: palette.primarySoft, borderColor: palette.borderSoft }]} onPress={() => onMove(selectedItem, 'hardware')}>
                    <Ionicons name="hardware-chip-outline" size={18} color={palette.text} />
                    <Text style={[styles.actionText, { color: palette.text }]}>В ТО</Text>
                  </AnimatedPressable>
                ) : null}
                {(!isCapital || currentKind !== 'software') ? (
                  <AnimatedPressable style={[styles.actionBtn, localStyles.actionMove, { backgroundColor: palette.primarySoft, borderColor: palette.borderSoft }]} onPress={() => onMove(selectedItem, 'software')}>
                    <Ionicons name="code-slash-outline" size={18} color={palette.text} />
                    <Text style={[styles.actionText, { color: palette.text }]}>В ПО</Text>
                  </AnimatedPressable>
                ) : null}
                {isCapital ? (
                  <AnimatedPressable style={[styles.actionBtn, localStyles.actionMove, { backgroundColor: palette.primarySoft, borderColor: palette.borderSoft }]} onPress={() => onMove(selectedItem, 'operating')}>
                    <Ionicons name="wallet-outline" size={18} color={palette.text} />
                    <Text style={[styles.actionText, { color: palette.text }]}>В OPEX</Text>
                  </AnimatedPressable>
                ) : null}
              </>
            );
          })()}

          <AnimatedPressable
            style={[styles.actionBtn, styles.actionEdit, { backgroundColor: palette.warningSoft, borderColor: palette.borderSoft }]}
            onPress={() => {
              const selectedItem = items.find((item) => item.id === selectedId);
              if (selectedItem) onEdit(selectedItem);
            }}
          >
            <Ionicons name="create-outline" size={18} color={palette.text} />
            <Text style={[styles.actionText, { color: palette.text }]}>Редактировать</Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.actionBtn, styles.actionDelete, { backgroundColor: palette.dangerSoft, borderColor: palette.borderSoft }]}
            onPress={() => onDelete(selectedId)}
          >
            <Ionicons name="trash-outline" size={18} color={palette.danger} />
            <Text style={[styles.actionText, { color: palette.danger }]}>Удалить</Text>
          </AnimatedPressable>
        </View>
      ) : null}

      {items.length > 0 ? (
        <View style={styles.actionBar}>
          <AnimatedPressable style={[styles.actionBtn, localStyles.actionBulkDelete, { backgroundColor: palette.dangerSoft, borderColor: palette.borderSoft }]} onPress={onDeleteAll}>
            <Ionicons name="trash-bin-outline" size={18} color={palette.danger} />
            <Text style={[styles.actionText, { color: palette.danger }]}>Удалить все в категории</Text>
          </AnimatedPressable>
        </View>
      ) : null}
    </AnimatedSurface>
  );
}

type LocalStyleTheme = ThemePalette | typeof colors;

const createLocalStyles = (theme: LocalStyleTheme) => StyleSheet.create({
  actionDuplicate: {
    backgroundColor: theme.primarySoft,
    borderColor: theme.primary,
  },
  actionMove: {
    backgroundColor: theme.primarySoft,
    borderColor: theme.primary,
  },
  actionBulkDelete: {
    backgroundColor: theme.dangerSoft,
    borderColor: theme.danger,
  },
  nameCell: { flex: 3, minWidth: 140 },
  qtyCell: { flex: 1, minWidth: 56 },
  priceCell: { flex: 1, minWidth: 92 },
  totalText: {
    marginTop: -2,
    marginBottom: 10,
    paddingHorizontal: 4,
    fontSize: 13,
    fontWeight: '800',
    color: theme.textMuted,
  },
  emptyRow: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: theme.borderSoft,
    backgroundColor: theme.surface,
  },
  emptyText: {
    color: theme.textMuted,
    fontSize: 14,
  },
});

const localStyles = createLocalStyles(colors);

function useLocalStyles() {
  const palette = useThemePalette();

  return useMemo(() => (palette.isDark ? createLocalStyles(palette) : localStyles), [palette]);
}
