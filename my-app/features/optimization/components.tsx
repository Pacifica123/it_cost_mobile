import React from 'react';
import { Text, TextInput, View } from 'react-native';

import { useOptimizationStyles } from './styles';
import { AnimatedPressable, AnimatedSurface } from '../../shared/ui';
import { useThemePalette } from '../../shared/theme';

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}) {
  const styles = useOptimizationStyles();
  const palette = useThemePalette();

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.textMuted}
        keyboardType="numeric"
      />
    </View>
  );
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  const styles = useOptimizationStyles();

  return (
    <AnimatedSurface style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </AnimatedSurface>
  );
}

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  const styles = useOptimizationStyles();

  return (
    <AnimatedPressable onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{label}</Text>
    </AnimatedPressable>
  );
}
