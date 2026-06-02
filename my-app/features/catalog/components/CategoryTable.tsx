import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import { exploreStyles as styles } from '../styles';
import { formatNumber } from '../../../shared/utils/number';
import { formatRub } from '../../../shared/utils/currency';
import type { CapitalEquipment, OperatingEquipment } from '../../../store/data/types';
import type { CatalogMode } from '../types';
import { SwipeDeleteAction, SwipeEditAction } from './SwipeRowActions';
import { AnimatedPressable, AnimatedSurface } from '../../../shared/ui';

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
  const { mode, categoryName, items, total, selectedId, onToggleSelect, onEdit, onDelete, onDuplicate, onMove, onDeleteAll } = props;
  const showQuantity = mode === 'capital';

  return (
    <AnimatedSurface style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle} numberOfLines={2}>{categoryName}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{formatNumber(items.length)}</Text>
        </View>
      </View>

      <Text style={localStyles.totalText}>Итого: {formatRub(total)}</Text>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, styles.cellHeader, localStyles.nameCell]}>Наименование</Text>
          {showQuantity ? (
            <Text style={[styles.cell, styles.cellHeader, localStyles.qtyCell, styles.cellCenter]}>Кол-во</Text>
          ) : null}
          <Text style={[styles.cell, styles.cellHeader, localStyles.priceCell, showQuantity ? styles.cellCenter : styles.cellRight]}>
            Цена{showQuantity ? '' : ', ₽'}
          </Text>
        </View>

        {items.length === 0 ? (
          <View style={localStyles.emptyRow}>
            <Text style={localStyles.emptyText}>Пока нет записей в этой категории.</Text>
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
                style={[styles.row, idx % 2 === 1 && styles.rowAlt, isSelected && styles.rowSelected]}
                activeOpacity={0.85}
                onPress={() => onToggleSelect(item.id)}
              >
                <Text style={[styles.cell, localStyles.nameCell]} numberOfLines={2}>{item.name}</Text>
                {showQuantity ? (
                  <Text style={[styles.cell, localStyles.qtyCell, styles.cellCenter]} numberOfLines={1}>
                    {formatNumber((item as CapitalEquipment).quantity)}
                  </Text>
                ) : null}
                <Text style={[styles.cell, localStyles.priceCell, showQuantity ? styles.cellCenter : styles.cellRight]} numberOfLines={1}>
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
            style={[styles.actionBtn, localStyles.actionDuplicate]}
            onPress={() => {
              const selectedItem = items.find((item) => item.id === selectedId);
              if (selectedItem) onDuplicate(selectedItem);
            }}
          >
            <Ionicons name="copy-outline" size={18} color="#111827" />
            <Text style={styles.actionText}>Дублировать</Text>
          </AnimatedPressable>

          {(() => {
            const selectedItem = items.find((item) => item.id === selectedId);
            if (!selectedItem) return null;
            const isCapital = mode === 'capital';
            const currentKind = isCapital && 'kind' in selectedItem ? selectedItem.kind : undefined;
            return (
              <>
                {(!isCapital || currentKind !== 'hardware') ? (
                  <AnimatedPressable style={[styles.actionBtn, localStyles.actionMove]} onPress={() => onMove(selectedItem, 'hardware')}>
                    <Ionicons name="hardware-chip-outline" size={18} color="#111827" />
                    <Text style={styles.actionText}>В ТО</Text>
                  </AnimatedPressable>
                ) : null}
                {(!isCapital || currentKind !== 'software') ? (
                  <AnimatedPressable style={[styles.actionBtn, localStyles.actionMove]} onPress={() => onMove(selectedItem, 'software')}>
                    <Ionicons name="code-slash-outline" size={18} color="#111827" />
                    <Text style={styles.actionText}>В ПО</Text>
                  </AnimatedPressable>
                ) : null}
                {isCapital ? (
                  <AnimatedPressable style={[styles.actionBtn, localStyles.actionMove]} onPress={() => onMove(selectedItem, 'operating')}>
                    <Ionicons name="wallet-outline" size={18} color="#111827" />
                    <Text style={styles.actionText}>В OPEX</Text>
                  </AnimatedPressable>
                ) : null}
              </>
            );
          })()}

          <AnimatedPressable
            style={[styles.actionBtn, styles.actionEdit]}
            onPress={() => {
              const selectedItem = items.find((item) => item.id === selectedId);
              if (selectedItem) onEdit(selectedItem);
            }}
          >
            <Ionicons name="create-outline" size={18} color="#111827" />
            <Text style={styles.actionText}>Редактировать</Text>
          </AnimatedPressable>

          <AnimatedPressable
            style={[styles.actionBtn, styles.actionDelete]}
            onPress={() => onDelete(selectedId)}
          >
            <Ionicons name="trash-outline" size={18} color="#7F1D1D" />
            <Text style={[styles.actionText, { color: '#7F1D1D' }]}>Удалить</Text>
          </AnimatedPressable>
        </View>
      ) : null}

      {items.length > 0 ? (
        <View style={styles.actionBar}>
          <AnimatedPressable style={[styles.actionBtn, localStyles.actionBulkDelete]} onPress={onDeleteAll}>
            <Ionicons name="trash-bin-outline" size={18} color="#7F1D1D" />
            <Text style={[styles.actionText, { color: '#7F1D1D' }]}>Удалить все в категории</Text>
          </AnimatedPressable>
        </View>
      ) : null}
    </AnimatedSurface>
  );
}

const localStyles = StyleSheet.create({
  actionDuplicate: {
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderColor: 'rgba(99,102,241,0.2)',
  },
  actionMove: {
    backgroundColor: 'rgba(59,130,246,0.10)',
    borderColor: 'rgba(59,130,246,0.20)',
  },
  actionBulkDelete: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderColor: 'rgba(239,68,68,0.18)',
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
    color: 'rgba(17,24,39,0.65)',
  },
  emptyRow: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(17,24,39,0.06)',
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    color: 'rgba(17,24,39,0.55)',
    fontSize: 14,
  },
});
