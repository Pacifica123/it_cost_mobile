import { ScrollView, Text, View } from 'react-native';

import { formatCurrencyRU } from '../../../shared/utils/currency';
import { useThemePalette } from '../../../shared/theme';
import { useReportStyles } from '../styles';
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
  const styles = useReportStyles();

  const palette = useThemePalette();
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
      <View style={[styles.table, { minWidth: tableMinWidth, backgroundColor: palette.surface, borderColor: palette.borderSoft }]}> 
        <View style={[styles.tableHeader, { backgroundColor: palette.surfaceMuted, borderBottomColor: palette.borderSoft }]}> 
          <Text style={[styles.th, { width: colNameWidth, color: palette.textSoft }]} numberOfLines={1}>Наименование</Text>
          <Text style={[styles.th, styles.thRight, { width: colQtyWidth, color: palette.textSoft }]} numberOfLines={1}>Кол-во</Text>
          <Text style={[styles.th, styles.thRight, { width: colCostWidth, color: palette.textSoft }]} numberOfLines={1}>Затраты</Text>
        </View>

        {Object.entries(grouped).map(([category, items]) => (
          <View key={category} style={styles.group}>
            <Text style={[styles.groupTitle, { color: palette.text }]} numberOfLines={1}>{category}</Text>

            {items.map((item) => (
              <AnimatedPressable key={item.id} style={[styles.tr, { backgroundColor: palette.surface, borderBottomColor: palette.borderSoft }]}> 
                <Text style={[styles.td, { width: colNameWidth, color: palette.text }]} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                <Text style={[styles.td, styles.tdRight, { width: colQtyWidth, color: palette.text }]} numberOfLines={1}>{getQty(item)}</Text>
                <Text style={[styles.td, styles.tdRight, { width: colCostWidth, color: palette.text }]} numberOfLines={1}>{formatCurrencyRU(getCost(item))}</Text>
              </AnimatedPressable>
            ))}
          </View>
        ))}

        <View style={[styles.subtotal, { backgroundColor: palette.primary }]}> 
          <Text style={[styles.subtotalText, { color: palette.textOnDark }]}>{subtotalLabel}</Text>
          <Text style={[styles.subtotalValue, { color: palette.textOnDark }]}>{formatCurrencyRU(subtotalValue)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
