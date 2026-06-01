import { Text, View } from 'react-native';

import { styles } from '../styles';
import type { ElectricityItem } from '../types';
import { AnimatedPressable, AnimatedSurface } from '../../../shared/ui';

export function EquipmentCard(props: {
  item: ElectricityItem;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  const { item, onEdit, onRemove, onRestore } = props;

  return (
    <AnimatedSurface>
      <AnimatedPressable
        onPress={() => {
          if (!item.isDeleted) onEdit(item.id);
        }}
        onLongPress={() => {
          if (!item.isDeleted) onRemove(item.id);
        }}
        style={[styles.card, item.isDeleted && styles.cardDeleted]}
        disabled={item.isDeleted}
      >
        <View style={styles.cardTop}>
          <Text style={[styles.name, item.isDeleted && styles.deletedText]} numberOfLines={1}>{item.name}</Text>

          <View style={styles.row2}>
            <View style={styles.fieldInline}>
              <Text style={styles.inlineLabel}>Кол-во</Text>
              <Text style={styles.inlineValue}>{item.quantity}</Text>
            </View>

            <View style={styles.fieldInline}>
              <Text style={styles.inlineLabel}>Макс, Вт</Text>
              <Text style={styles.inlineValue}>{item.powerW}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBottom}>
          {!item.isDeleted ? (
            <Text style={styles.hint}>Нажми — изменить мощность • Долгое нажатие — исключить</Text>
          ) : (
            <AnimatedPressable onPress={() => onRestore(item.id)} hitSlop={10} disabled={false}>
              <Text style={styles.restore}>Вернуть в расчёт</Text>
            </AnimatedPressable>
          )}
        </View>
      </AnimatedPressable>
    </AnimatedSurface>
  );
}
