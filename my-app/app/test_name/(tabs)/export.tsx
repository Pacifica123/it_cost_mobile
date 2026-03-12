import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { useData } from '../../data/DataContext';

type CapitalEquipment = {
  id: string;
  category: string;
  name: string;
  quantity: number;
  price: number;
};

type OperatingEquipment = {
  id: string;
  category: string;
  name: string;
  price: number;
};

function formatCurrencyRU(amount: number) {
  try {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
  } catch {
    return `${Math.round(amount)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽`;
  }
}

function groupByCategory<T extends { category: string }>(items: T[]) {
  const grouped: Record<string, T[]> = {};
  for (const item of items) {
    (grouped[item.category] ||= []).push(item);
  }
  return grouped;
}

function TableWide<T extends { id: string; name: string }>(props: {
  title?: string;
  grouped: Record<string, T[]>;
  getQty: (item: T) => number;
  getCost: (item: T) => number;
  subtotalLabel: string;
  subtotalValue: number;
  colNameWidth: number;
  colQtyWidth: number;
  colCostWidth: number;
  tableMinWidth: number;
}) {
  const {
    grouped,
    getQty,
    getCost,
    subtotalLabel,
    subtotalValue,
    colNameWidth,
    colQtyWidth,
    colCostWidth,
    tableMinWidth,
  } = props;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.table, { minWidth: tableMinWidth }]}>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { width: colNameWidth }]} numberOfLines={1}>
            Наименование
          </Text>
          <Text style={[styles.th, styles.thRight, { width: colQtyWidth }]} numberOfLines={1}>
            Кол-во
          </Text>
          <Text style={[styles.th, styles.thRight, { width: colCostWidth }]} numberOfLines={1}>
            Затраты
          </Text>
        </View>

        {Object.entries(grouped).map(([category, items]) => (
          <View key={category} style={styles.group}>
            <Text style={styles.groupTitle} numberOfLines={1}>
              {category}
            </Text>

            {items.map((item) => (
              <Pressable key={item.id} style={({ pressed }) => [styles.tr, pressed && styles.trPressed]}>
                <Text
                  style={[styles.td, { width: colNameWidth }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.name}
                </Text>

                <Text style={[styles.td, styles.tdRight, { width: colQtyWidth }]} numberOfLines={1}>
                  {getQty(item)}
                </Text>

                <Text style={[styles.td, styles.tdRight, { width: colCostWidth }]} numberOfLines={1}>
                  {formatCurrencyRU(getCost(item))}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}

        <View style={styles.subtotal}>
          <Text style={styles.subtotalText}>{subtotalLabel}</Text>
          <Text style={styles.subtotalValue}>{formatCurrencyRU(subtotalValue)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function ListPhone<T extends { id: string; name: string }>(props: {
  grouped: Record<string, T[]>;
  getQty: (item: T) => number;
  getCost: (item: T) => number;
  subtotalLabel: string;
  subtotalValue: number;
}) {
  const { grouped, getQty, getCost, subtotalLabel, subtotalValue } = props;

  return (
    <View style={styles.mobileList}>
      {Object.entries(grouped).map(([category, items]) => (
        <View key={category} style={styles.group}>
          <Text style={styles.groupTitle} numberOfLines={1}>
            {category}
          </Text>

          {items.map((item) => (
            <Pressable key={item.id} style={({ pressed }) => [styles.mRow, pressed && styles.trPressed]}>
              <Text style={styles.mName} numberOfLines={2} ellipsizeMode="tail">
                {item.name}
              </Text>

              <View style={styles.mBottom}
              >
                <Text style={styles.mMeta} numberOfLines={1}>
                  Кол-во: <Text style={styles.mMetaVal}>{getQty(item)}</Text>
                </Text>
                <Text style={styles.mCost} numberOfLines={1}>
                  {formatCurrencyRU(getCost(item))}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ))}

      <View style={styles.subtotal}>
        <Text style={styles.subtotalText}>{subtotalLabel}</Text>
        <Text style={styles.subtotalValue}>{formatCurrencyRU(subtotalValue)}</Text>
      </View>
    </View>
  );
}

export default function SummaryScreen() {
  const [showDetails, setShowDetails] = useState(false);
  const { capitalData, operatingData } = useData();
  const { width } = useWindowDimensions();

  const isPhone = width < 420;

  const oneTimeCategories = useMemo(() => ['Миграция', 'Тестирование'], []);
  const periodicCategories = useMemo(
    () => [
      'Лицензии по подписке',
      'Аренда серверов',
      'Резервирование',
      'Оплата труда',
      'Администрирование серверов',
    ],
    []
  );

  const oneTimeOperating = useMemo(
    () => operatingData.filter((item) => oneTimeCategories.includes(item.category)),
    [operatingData, oneTimeCategories]
  );

  const periodicOperating = useMemo(
    () => operatingData.filter((item) => periodicCategories.includes(item.category)),
    [operatingData, periodicCategories]
  );

  const capitalTotal = useMemo(
    () => capitalData.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [capitalData]
  );

  const oneTimeOperatingTotal = useMemo(
    () => oneTimeOperating.reduce((sum, item) => sum + item.price, 0),
    [oneTimeOperating]
  );

  const periodicTotal = useMemo(
    () => periodicOperating.reduce((sum, item) => sum + item.price, 0),
    [periodicOperating]
  );

  const electricityTotal = 0;
  const totalOneTimeExpenses = capitalTotal + oneTimeOperatingTotal;
  const grandTotal = totalOneTimeExpenses + periodicTotal + electricityTotal;

  const groupedCapital = useMemo(() => groupByCategory<CapitalEquipment>(capitalData), [capitalData]);
  const groupedOneTimeOp = useMemo(
    () => groupByCategory<OperatingEquipment>(oneTimeOperating),
    [oneTimeOperating]
  );
  const groupedPeriodicOp = useMemo(
    () => groupByCategory<OperatingEquipment>(periodicOperating),
    [periodicOperating]
  );

  // Фикс-ширины колонок для широкого режима (чтобы ничего не "ехало")
  const COL_NAME = isPhone ? 260 : 360;
  const COL_QTY = 90;
  const COL_COST = 130;
  const TABLE_MIN_WIDTH = COL_NAME + COL_QTY + COL_COST;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Сводная таблица затрат</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Итоги</Text>

        <View style={styles.kvRow}>
          <Text style={styles.kvLabel} numberOfLines={2}>
            Итого все разовые затраты
          </Text>
          <Text style={styles.kvValue}>{formatCurrencyRU(totalOneTimeExpenses)}</Text>
        </View>

        <View style={styles.kvRow}>
          <Text style={styles.kvLabel} numberOfLines={2}>
            Итого все периодические затраты
          </Text>
          <Text style={styles.kvValue}>{formatCurrencyRU(periodicTotal)}</Text>
        </View>

        <View style={styles.kvRow}>
          <Text style={styles.kvLabel} numberOfLines={2}>
            Затраты на электроэнергию
          </Text>
          <Text style={styles.kvValue}>{formatCurrencyRU(electricityTotal)}</Text>
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>ОБЩИЙ ИТОГ</Text>
          <Text style={styles.totalValue}>{formatCurrencyRU(grandTotal)}</Text>
        </View>
      </View>

      <Pressable
        onPress={() => setShowDetails((v) => !v)}
        style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
      >
        <Text style={styles.toggleText}>
          {showDetails ? 'Скрыть детали' : 'Показать детали'}{' '}
          <Text style={styles.toggleArrow}>{showDetails ? '▲' : '▼'}</Text>
        </Text>
      </Pressable>

      {showDetails && (
        <View style={{ gap: 12 }}>
          {/* КАПИТАЛЬНЫЕ */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Капитальные затраты</Text>

            {isPhone ? (
              <ListPhone
                grouped={groupedCapital}
                getQty={(item) => (item as CapitalEquipment).quantity}
                getCost={(item) => (item as CapitalEquipment).quantity * (item as CapitalEquipment).price}
                subtotalLabel="ИТОГО КАПИТАЛЬНЫХ"
                subtotalValue={capitalTotal}
              />
            ) : (
              <TableWide
                grouped={groupedCapital}
                getQty={(item) => (item as CapitalEquipment).quantity}
                getCost={(item) => (item as CapitalEquipment).quantity * (item as CapitalEquipment).price}
                subtotalLabel="ИТОГО КАПИТАЛЬНЫХ"
                subtotalValue={capitalTotal}
                colNameWidth={COL_NAME}
                colQtyWidth={COL_QTY}
                colCostWidth={COL_COST}
                tableMinWidth={TABLE_MIN_WIDTH}
              />
            )}
          </View>

          {/* ОПЕРАЦИОННЫЕ */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Операционные затраты</Text>

            <Text style={styles.sectionLabel}>Разовые</Text>
            {oneTimeOperating.length > 0 ? (
              isPhone ? (
                <ListPhone
                  grouped={groupedOneTimeOp}
                  getQty={() => 1}
                  getCost={(item) => (item as OperatingEquipment).price}
                  subtotalLabel="ИТОГО РАЗОВЫХ"
                  subtotalValue={oneTimeOperatingTotal}
                />
              ) : (
                <TableWide
                  grouped={groupedOneTimeOp}
                  getQty={() => 1}
                  getCost={(item) => (item as OperatingEquipment).price}
                  subtotalLabel="ИТОГО РАЗОВЫХ"
                  subtotalValue={oneTimeOperatingTotal}
                  colNameWidth={COL_NAME}
                  colQtyWidth={COL_QTY}
                  colCostWidth={COL_COST}
                  tableMinWidth={TABLE_MIN_WIDTH}
                />
              )
            ) : (
              <Text style={styles.empty}>Нет данных</Text>
            )}

            <Text style={[styles.sectionLabel, { marginTop: 14 }]}>Периодические</Text>
            {periodicOperating.length > 0 ? (
              isPhone ? (
                <ListPhone
                  grouped={groupedPeriodicOp}
                  getQty={() => 1}
                  getCost={(item) => (item as OperatingEquipment).price}
                  subtotalLabel="ИТОГО ПЕРИОДИЧЕСКИХ"
                  subtotalValue={periodicTotal}
                />
              ) : (
                <TableWide
                  grouped={groupedPeriodicOp}
                  getQty={() => 1}
                  getCost={(item) => (item as OperatingEquipment).price}
                  subtotalLabel="ИТОГО ПЕРИОДИЧЕСКИХ"
                  subtotalValue={periodicTotal}
                  colNameWidth={COL_NAME}
                  colQtyWidth={COL_QTY}
                  colCostWidth={COL_COST}
                  tableMinWidth={TABLE_MIN_WIDTH}
                />
              )
            ) : (
              <Text style={styles.empty}>Нет данных</Text>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { padding: 16, paddingBottom: 28 },

  hero: {
    backgroundColor: '#111827',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  heroTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  heroSubtitle: { color: '#D1D5DB', marginTop: 4, fontSize: 13, fontWeight: '600' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAECEF',
    marginBottom: 12,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 10 },

  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEF1F5',
  },
  kvLabel: { flex: 1, color: '#374151', fontSize: 14, fontWeight: '600' },
  kvValue: { color: '#111827', fontSize: 14, fontWeight: '800' },

  totalBox: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  totalLabel: { color: '#111827', fontSize: 13, fontWeight: '900', letterSpacing: 0.6 },
  totalValue: { color: '#111827', fontSize: 16, fontWeight: '900' },

  toggle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#EAECEF',
    alignItems: 'center',
    marginBottom: 12,
  },
  pressed: { opacity: 0.75 },
  toggleText: { color: '#111827', fontSize: 14, fontWeight: '800' },
  toggleArrow: { color: '#6B7280', fontWeight: '900' },

  sectionLabel: { marginTop: 2, marginBottom: 8, color: '#374151', fontSize: 13, fontWeight: '800' },

  /* WIDE TABLE */
  table: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF1F5',
    backgroundColor: '#FFFFFF',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F7F8FA',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
  },
  th: { paddingVertical: 10, paddingHorizontal: 12, fontSize: 12, fontWeight: '900', color: '#374151' },
  thRight: { textAlign: 'right' },

  group: { paddingBottom: 8 },
  groupTitle: {
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 12,
    color: '#111827',
    fontSize: 13,
    fontWeight: '900',
  },

  tr: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F6',
  },
  trPressed: { backgroundColor: '#F3F4F6' },
  td: { paddingVertical: 12, paddingHorizontal: 12, fontSize: 14, fontWeight: '700', color: '#111827' },
  tdRight: { textAlign: 'right' },

  subtotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#111827',
  },
  subtotalText: { color: '#E5E7EB', fontSize: 12, fontWeight: '900', letterSpacing: 0.6 },
  subtotalValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },

  /* PHONE LIST */
  mobileList: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF1F5',
    backgroundColor: '#FFFFFF',
  },
  mRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F6',
    backgroundColor: '#FFFFFF',
  },
  mName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  mBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  mMeta: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    flex: 1,
  },
  mMetaVal: {
    color: '#111827',
    fontWeight: '900',
  },
  mCost: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },

  empty: { textAlign: 'center', color: '#6B7280', fontStyle: 'italic', paddingVertical: 10 },
});
