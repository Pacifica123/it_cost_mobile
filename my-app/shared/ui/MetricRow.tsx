import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';

export function MetricRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
      <Text style={[styles.value, emphasized && styles.valueEmphasized]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md - 2,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  label: {
    flex: 1,
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  valueEmphasized: {
    color: colors.primary,
  },
});
