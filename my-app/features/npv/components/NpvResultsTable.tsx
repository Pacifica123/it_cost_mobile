import { Text, View } from 'react-native';

import { formatNpvNumber } from '../logic/npv';
import { useNpvStyles } from '../styles';
import { AnimatedSurface } from '../../../shared/ui';
import type { ResultRow } from '../types';

export function NpvResultsTable({ rows }: { rows: ResultRow[] }) {
  const styles = useNpvStyles();

  if (!rows.length) {
    return null;
  }

  return (
    <AnimatedSurface style={styles.card}>
      <Text style={styles.sectionTitle}>Таблица расчёта</Text>

      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.headerCell]}>Год</Text>
          <Text style={[styles.cell, styles.headerCell]}>CF</Text>
          <Text style={[styles.cell, styles.headerCell]}>PV</Text>
          <Text style={[styles.cell, styles.headerCell]}>NPV</Text>
        </View>

        {rows.map((row, index) => (
          <View key={`${row.year}-${index}`} style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
            <Text style={styles.cell}>{row.year}</Text>
            <Text style={styles.cell}>{formatNpvNumber(row.cft)}</Text>
            <Text style={styles.cell}>{formatNpvNumber(row.pv)}</Text>
            <Text style={[styles.cell, row.npv >= 0 ? styles.positive : styles.negative]}>
              {formatNpvNumber(row.npv)}
            </Text>
          </View>
        ))}
      </View>
    </AnimatedSurface>
  );
}
