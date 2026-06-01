import { ScrollView, Text, View } from 'react-native';

import { formatCurrencyRU } from '../../../shared/utils/currency';
import { styles } from '../styles';
import { AnimatedPressable } from '../../../shared/ui';

export function ReportTableWide<T extends { id: string; name: string }>(props: {
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
          <Text style={[styles.th, { width: colNameWidth }]} numberOfLines={1}>Наименование</Text>
          <Text style={[styles.th, styles.thRight, { width: colQtyWidth }]} numberOfLines={1}>Кол-во</Text>
          <Text style={[styles.th, styles.thRight, { width: colCostWidth }]} numberOfLines={1}>Затраты</Text>
        </View>

        {Object.entries(grouped).map(([category, items]) => (
          <View key={category} style={styles.group}>
            <Text style={styles.groupTitle} numberOfLines={1}>{category}</Text>

            {items.map((item) => (
              <AnimatedPressable key={item.id} style={styles.tr}>
                <Text style={[styles.td, { width: colNameWidth }]} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                <Text style={[styles.td, styles.tdRight, { width: colQtyWidth }]} numberOfLines={1}>{getQty(item)}</Text>
                <Text style={[styles.td, styles.tdRight, { width: colCostWidth }]} numberOfLines={1}>{formatCurrencyRU(getCost(item))}</Text>
              </AnimatedPressable>
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
