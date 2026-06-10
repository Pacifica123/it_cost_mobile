import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useCatalogStyles } from '../styles';
import { AnimatedPressable } from '../../../shared/ui';
import { useThemePalette } from '../../../shared/theme';

export function SwipeEditAction({ onPress }: { onPress: () => void }) {
  const styles = useCatalogStyles();

  const palette = useThemePalette();
  return (
    <View style={styles.swipeActions}>
      <AnimatedPressable style={[styles.swipeBtn, styles.swipeEdit, { backgroundColor: palette.warningSoft, borderColor: palette.borderSoft }]} onPress={onPress}>
        <Ionicons name="create-outline" size={20} color={palette.text} />
      </AnimatedPressable>
    </View>
  );
}

export function SwipeDeleteAction({ onPress }: { onPress: () => void }) {
  const styles = useCatalogStyles();

  const palette = useThemePalette();
  return (
    <View style={styles.swipeActions}>
      <AnimatedPressable style={[styles.swipeBtn, styles.swipeDelete, { backgroundColor: palette.dangerSoft, borderColor: palette.borderSoft }]} onPress={onPress}>
        <Ionicons name="trash-outline" size={20} color={palette.danger} />
      </AnimatedPressable>
    </View>
  );
}
