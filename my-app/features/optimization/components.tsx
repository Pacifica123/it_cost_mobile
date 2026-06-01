import React from 'react';
import { Text, TextInput, View } from 'react-native';

import { optimizationStyles as styles } from './styles';
import { AnimatedPressable, AnimatedSurface } from '../../shared/ui';

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
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType="numeric"
      />
    </View>
  );
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <AnimatedSurface style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </AnimatedSurface>
  );
}

export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <AnimatedPressable onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{label}</Text>
    </AnimatedPressable>
  );
}
