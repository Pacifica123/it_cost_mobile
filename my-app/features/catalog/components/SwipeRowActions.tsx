import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { exploreStyles as styles } from '../styles';
import { AnimatedPressable } from '../../../shared/ui';

export function SwipeEditAction({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.swipeActions}>
      <AnimatedPressable style={[styles.swipeBtn, styles.swipeEdit]} onPress={onPress}>
        <Ionicons name="create-outline" size={20} color="#111827" />
      </AnimatedPressable>
    </View>
  );
}

export function SwipeDeleteAction({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.swipeActions}>
      <AnimatedPressable style={[styles.swipeBtn, styles.swipeDelete]} onPress={onPress}>
        <Ionicons name="trash-outline" size={20} color="#7F1D1D" />
      </AnimatedPressable>
    </View>
  );
}
