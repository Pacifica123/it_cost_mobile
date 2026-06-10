import { Text, TextInput, View } from 'react-native';

import { useNpvStyles } from '../styles';
import type { NpvFormState } from '../types';
import { AnimatedPressable, AnimatedSurface } from '../../../shared/ui';
import { useThemePalette } from '../../../shared/theme';

export function NpvFormCard({
  form,
  error,
  onChange,
  onCalculate,
  onReset,
}: {
  form: NpvFormState;
  error: string;
  onChange: (patch: Partial<NpvFormState>) => void;
  onCalculate: () => void;
  onReset: () => void;
}) {
  const styles = useNpvStyles();
  const palette = useThemePalette();

  return (
    <AnimatedSurface style={styles.card}>
      <Text style={styles.label}>Начальные инвестиции</Text>
      <TextInput
        style={styles.input}
        value={form.investment}
        onChangeText={(investment) => onChange({ investment })}
        keyboardType="numeric"
        placeholder="Например: 1000"
        placeholderTextColor={palette.textMuted}
      />

      <Text style={styles.label}>Денежные потоки</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        value={form.cashflows}
        onChangeText={(cashflows) => onChange({ cashflows })}
        multiline
        placeholder="Например: 100, 200, 300"
        placeholderTextColor={palette.textMuted}
      />
      <Text style={styles.hint}>Ввод через запятую, каждый элемент — отдельный период</Text>

      <Text style={styles.label}>Ставка дисконтирования</Text>
      <TextInput
        style={styles.input}
        value={form.rate}
        onChangeText={(rate) => onChange({ rate })}
        keyboardType="numeric"
        placeholder="10 или 0.1"
        placeholderTextColor={palette.textMuted}
      />
      <Text style={styles.hint}>Можно вводить 10 или 0.1</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <AnimatedPressable style={styles.buttonPrimary} onPress={onCalculate}>
          <Text style={styles.buttonPrimaryText}>Рассчитать</Text>
        </AnimatedPressable>

        <AnimatedPressable style={styles.buttonSecondary} onPress={onReset}>
          <Text style={styles.buttonSecondaryText}>Сброс</Text>
        </AnimatedPressable>
      </View>
    </AnimatedSurface>
  );
}
