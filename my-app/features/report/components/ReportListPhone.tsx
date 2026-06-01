import { Text, View } from 'react-native';

import { formatCurrencyRU } from '../../../shared/utils/currency';
import { styles } from '../styles';
import { AnimatedPressable } from '../../../shared/ui';

export function ReportListPhone<T extends { id: string; name: string }>(props: {
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
          <Text style={styles.groupTitle} numberOfLines={1}>{category}</Text>

          {items.map((item) => (
            <AnimatedPressable key={item.id} style={styles.mRow}>
              <Text style={styles.mName} numberOfLines={2} ellipsizeMode="tail">{item.name}</Text>
              <View style={styles.mBottom}>
                <Text style={styles.mMeta} numberOfLines={1}>Кол-во: <Text style={styles.mMetaVal}>{getQty(item)}</Text></Text>
                <Text style={styles.mCost} numberOfLines={1}>{formatCurrencyRU(getCost(item))}</Text>
              </View>
            </AnimatedPressable>
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
