import { Text, View } from 'react-native';

import { formatNpvNumber } from '../logic/npv';
import { styles } from '../styles';
import { AnimatedSurface } from '../../../shared/ui';

export function NpvSummaryRow({
  finalNpv,
  paybackPeriod,
}: {
  finalNpv: number;
  paybackPeriod: number | null;
}) {
  return (
    <AnimatedSurface style={styles.summaryRow}>
      <View style={[styles.summaryCard, finalNpv >= 0 ? styles.goodCard : styles.badCard]}>
        <Text style={styles.summaryLabel}>Итоговый NPV</Text>
        <Text style={[styles.summaryValue, finalNpv >= 0 ? styles.positive : styles.negative]}>
          {formatNpvNumber(finalNpv)}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Окупаемость</Text>
        <Text style={styles.summaryValueSmall}>
          {paybackPeriod !== null ? `${paybackPeriod} период` : 'Не достигнута'}
        </Text>
      </View>
    </AnimatedSurface>
  );
}
