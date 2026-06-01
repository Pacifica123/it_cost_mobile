import { Text, View } from 'react-native';

import type { ElectricityItem } from '../types';
import { styles } from '../styles';

export function ElectricityHeader({
  items,
}: {
  items: ElectricityItem[];
}) {
  const activeItems = items.filter((item) => !item.isDeleted);
  const hiddenCount = items.length - activeItems.length;
  const totalUnits = activeItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPowerW = activeItems.reduce((sum, item) => sum + item.quantity * item.powerW, 0);

  return (
    <>
      <View>
        <Text style={styles.sectionTitle1}>Электропотребление</Text>
      </View>
      <Text style={styles.formSubtitle}>
        Список оборудования автоматически собирается из капитальных затрат без программного обеспечения.
      </Text>
      <View style={{ marginTop: 10 }}>
        <Text style={styles.sectionTitle1}>Оборудование</Text>
      </View>
      <View>
        <Text style={styles.collapseSummary}>
          {activeItems.length} поз. • {totalUnits} ед. • {totalPowerW.toFixed(0)} Вт
          {hiddenCount ? ` • скрыто ${hiddenCount}` : ''}
        </Text>
      </View>
    </>
  );
}
