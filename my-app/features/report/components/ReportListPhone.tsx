import { Text, View } from 'react-native';

import { formatCurrencyRU } from '../../../shared/utils/currency';
import { useThemePalette } from '../../../shared/theme';
import { useReportStyles } from '../styles';
import { AnimatedPressable } from '../../../shared/ui';

export function ReportListPhone<T extends { id: string; name: string }>(props: {
  grouped: Record<string, T[]>;
  getQty: (item: T) => number;
  getCost: (item: T) => number;
  subtotalLabel: string;
  subtotalValue: number;
}) {
  const styles = useReportStyles();

  const palette = useThemePalette();
  const { grouped, getQty, getCost, subtotalLabel, subtotalValue } = props;

  return (
    <View style={[styles.mobileList, { backgroundColor: palette.surface, borderColor: palette.borderSoft }]}> 
      {Object.entries(grouped).map(([category, items]) => (
        <View key={category} style={styles.group}>
          <Text style={[styles.groupTitle, { color: palette.text }]} numberOfLines={1}>{category}</Text>

          {items.map((item) => (
            <AnimatedPressable key={item.id} style={[styles.mRow, { backgroundColor: palette.surface, borderBottomColor: palette.borderSoft }]}> 
              <Text style={[styles.mName, { color: palette.text }]} numberOfLines={2} ellipsizeMode="tail">{item.name}</Text>
              <View style={styles.mBottom}>
                <Text style={[styles.mMeta, { color: palette.textMuted }]} numberOfLines={1}>Кол-во: <Text style={[styles.mMetaVal, { color: palette.text }]}>{getQty(item)}</Text></Text>
                <Text style={[styles.mCost, { color: palette.text }]} numberOfLines={1}>{formatCurrencyRU(getCost(item))}</Text>
              </View>
            </AnimatedPressable>
          ))}
        </View>
      ))}

      <View style={[styles.subtotal, { backgroundColor: palette.primary }]}> 
        <Text style={[styles.subtotalText, { color: palette.textOnDark }]}>{subtotalLabel}</Text>
        <Text style={[styles.subtotalValue, { color: palette.textOnDark }]}>{formatCurrencyRU(subtotalValue)}</Text>
      </View>
    </View>
  );
}
