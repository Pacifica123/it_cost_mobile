import { Text, View } from 'react-native';

import { formatCurrencyRU } from '../../../shared/utils/currency';
import { AppCard } from '../../../shared/ui/AppCard';
import { MetricRow } from '../../../shared/ui/MetricRow';
import { useThemePalette } from '../../../shared/theme';
import { useReportStyles } from '../styles';

export function SummaryCard(props: {
  totalOneTimeExpenses: number;
  periodicTotalMonthly: number;
  periodicTotalAnnual: number;
  electricityTotalMonthly: number;
  electricityTotalAnnual: number;
  grandTotalAnnual: number;
}) {
  const styles = useReportStyles();

  const palette = useThemePalette();
  const {
    totalOneTimeExpenses,
    periodicTotalMonthly,
    periodicTotalAnnual,
    electricityTotalMonthly,
    electricityTotalAnnual,
    grandTotalAnnual,
  } = props;

  return (
    <AppCard style={styles.card}>
      <Text style={[styles.cardTitle, { color: palette.text }]}>Итоги</Text>

      <MetricRow label="Разовые затраты" value={formatCurrencyRU(totalOneTimeExpenses)} />
      <MetricRow label="Периодические затраты в месяц" value={formatCurrencyRU(periodicTotalMonthly)} />
      <MetricRow label="Периодические затраты в год" value={formatCurrencyRU(periodicTotalAnnual)} />
      <MetricRow label="Электроэнергия в месяц" value={formatCurrencyRU(electricityTotalMonthly)} />
      <MetricRow label="Электроэнергия в год" value={formatCurrencyRU(electricityTotalAnnual)} />

      <View style={[styles.totalBox, { backgroundColor: palette.surfaceMuted, borderColor: palette.borderSoft }]}> 
        <Text style={[styles.totalLabel, { color: palette.text }]}>ОБЩИЙ ИТОГ ЗА ГОД</Text>
        <Text style={[styles.totalValue, { color: palette.text }]}>{formatCurrencyRU(grandTotalAnnual)}</Text>
      </View>
    </AppCard>
  );
}
