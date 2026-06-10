import { Text, View } from 'react-native';

import { colors, useThemePalette } from '../../../shared/theme';
import { AppCard } from '../../../shared/ui';
import { formatCurrencyRU } from '../../../shared/utils/currency';
import { useProjectStyles } from '../styles';

type CostSlice = {
  id: string;
  label: string;
  value: number;
  color: string;
};

export function CostStructureCard({
  hardwareTotal,
  softwareTotal,
  opexAnnual,
  electricityAnnual,
}: {
  hardwareTotal: number;
  softwareTotal: number;
  opexAnnual: number;
  electricityAnnual: number;
}) {
  const styles = useProjectStyles();

  const palette = useThemePalette();
  const slices: CostSlice[] = [
    { id: 'hardware', label: 'ТО', value: hardwareTotal, color: colors.primary },
    { id: 'software', label: 'ПО', value: softwareTotal, color: colors.success },
    { id: 'opex', label: 'OPEX/год', value: opexAnnual, color: colors.warning },
    { id: 'electricity', label: 'Электроэнергия/год', value: electricityAnnual, color: colors.danger },
  ];
  const max = Math.max(...slices.map((slice) => slice.value), 1);
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <AppCard delay={120} style={styles.chartCard}>
      <Text style={[styles.cardTitle, { color: palette.text }]} maxFontSizeMultiplier={1.12}>Структура затрат</Text>
      <Text style={[styles.cardText, { color: palette.textSoft }]} maxFontSizeMultiplier={1.12}>
        Быстрый график показывает, какая часть расчёта сильнее всего влияет на итог.
      </Text>

      <View style={styles.barList}>
        {slices.map((slice) => {
          const percentOfMax = Math.max(4, Math.round((slice.value / max) * 100));
          const percentOfTotal = total > 0 ? Math.round((slice.value / total) * 100) : 0;
          return (
            <View key={slice.id} style={styles.barRow}>
              <View style={styles.barLabelRow}>
                <Text style={[styles.barLabel, { color: palette.textSoft }]} maxFontSizeMultiplier={1.1}>{slice.label}</Text>
                <Text style={[styles.barValue, { color: palette.text }]} maxFontSizeMultiplier={1.1}>
                  {formatCurrencyRU(slice.value)} · {percentOfTotal}%
                </Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: palette.surfaceMuted }]}> 
                <View style={[styles.barFill, { width: `${percentOfMax}%`, backgroundColor: slice.color }]} />
              </View>
            </View>
          );
        })}
      </View>
    </AppCard>
  );
}
