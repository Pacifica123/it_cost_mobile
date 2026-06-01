import { Text, View } from 'react-native';

import { NpvChartCard } from '../../features/npv/components/NpvChartCard';
import { NpvFormCard } from '../../features/npv/components/NpvFormCard';
import { NpvResultsTable } from '../../features/npv/components/NpvResultsTable';
import { NpvSummaryRow } from '../../features/npv/components/NpvSummaryRow';
import { useNpvCalculator } from '../../features/npv/hooks/useNpvCalculator';
import { styles } from '../../features/npv/styles';
import { AnimatedScreenScroll } from '../../shared/ui';

export const title = 'NPV-анализ';

export default function NPVScreen() {
  const { form, results, chartValues, error, finalNpv, paybackPeriod, setForm, calculate, reset } = useNpvCalculator();

  return (
    <AnimatedScreenScroll
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Расчёт NPV</Text>
        <Text style={styles.heroSubtitle}>
          Оцени эффективность проекта по денежным потокам и ставке дисконтирования
        </Text>
      </View>

      <NpvFormCard
        form={form}
        error={error}
        onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
        onCalculate={calculate}
        onReset={reset}
      />

      {finalNpv !== null ? <NpvSummaryRow finalNpv={finalNpv} paybackPeriod={paybackPeriod} /> : null}

      <NpvChartCard values={chartValues} />
      <NpvResultsTable rows={results} />
    </AnimatedScreenScroll>
  );
}
