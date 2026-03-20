import { useMemo, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export const title = 'NPV-анализ';

type ResultRow = {
  year: number;
  cft: number;
  pv: number;
  npv: number;
};

function toNumber(value: string) {
  return Number(value.trim().replace(',', '.'));
}

function parseRate(value: string) {
  const num = toNumber(value);
  if (Number.isNaN(num)) return null;
  return num > 1 ? num / 100 : num;
}

function formatNum(value: number) {
  return value.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function NPVScreen() {
  const [investment, setInvestment] = useState('1000');
  const [cashflows, setCashflows] = useState('10,20,30,40,100,500,1000');
  const [rate, setRate] = useState('10');
  const [results, setResults] = useState<ResultRow[]>([]);
  const [npvValues, setNpvValues] = useState<number[]>([]);
  const [error, setError] = useState('');

  const finalNpv = useMemo(() => {
    if (!results.length) return null;
    return results[results.length - 1].npv;
  }, [results]);

  const paybackPeriod = useMemo(() => {
    const found = results.find((row) => row.npv >= 0);
    return found ? found.year : null;
  }, [results]);

  const calculateNPV = () => {
    setError('');

    const I = toNumber(investment);
    const r = parseRate(rate);

    const flows = cashflows
      .split(',')
      .map((item) => toNumber(item))
      .filter((item) => !Number.isNaN(item));

    if (Number.isNaN(I) || I <= 0) {
      setError('Введите корректные начальные инвестиции');
      return;
    }

    if (r === null || r < 0) {
      setError('Введите корректную ставку дисконтирования');
      return;
    }

    if (!flows.length) {
      setError('Введите денежные потоки через запятую');
      return;
    }

    let cumulative = -I;
    const table: ResultRow[] = [];
    const graphData: number[] = [];

    table.push({
      year: 0,
      cft: -I,
      pv: -I,
      npv: Number(cumulative.toFixed(2)),
    });

    graphData.push(Number(cumulative.toFixed(2)));

    flows.forEach((cf, index) => {
      const year = index + 1;
      const pv = cf / Math.pow(1 + r, year);
      cumulative += pv;

      table.push({
        year,
        cft: cf,
        pv: Number(pv.toFixed(2)),
        npv: Number(cumulative.toFixed(2)),
      });

      graphData.push(Number(cumulative.toFixed(2)));
    });

    setResults(table);
    setNpvValues(graphData);
  };

  const resetForm = () => {
    setInvestment('1000');
    setCashflows('10,20,30,40,100,500,1000');
    setRate('10');
    setResults([]);
    setNpvValues([]);
    setError('');
  };

  return (
    <ScrollView
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

      <View style={styles.card}>
        <Text style={styles.label}>Начальные инвестиции</Text>
        <TextInput
          style={styles.input}
          value={investment}
          onChangeText={setInvestment}
          keyboardType="numeric"
          placeholder="Например: 1000"
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>Денежные потоки</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={cashflows}
          onChangeText={setCashflows}
          multiline
          placeholder="Например: 100, 200, 300"
          placeholderTextColor="#94a3b8"
        />
        <Text style={styles.hint}>Ввод через запятую, каждый элемент — отдельный период</Text>

        <Text style={styles.label}>Ставка дисконтирования</Text>
        <TextInput
          style={styles.input}
          value={rate}
          onChangeText={setRate}
          keyboardType="numeric"
          placeholder="10 или 0.1"
          placeholderTextColor="#94a3b8"
        />
        <Text style={styles.hint}>Можно вводить 10 или 0.1</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.buttonPrimary} onPress={calculateNPV}>
            <Text style={styles.buttonPrimaryText}>Рассчитать</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonSecondary} onPress={resetForm}>
            <Text style={styles.buttonSecondaryText}>Сброс</Text>
          </TouchableOpacity>
        </View>
      </View>

      {finalNpv !== null && (
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, finalNpv >= 0 ? styles.goodCard : styles.badCard]}>
            <Text style={styles.summaryLabel}>Итоговый NPV</Text>
            <Text style={[styles.summaryValue, finalNpv >= 0 ? styles.positive : styles.negative]}>
              {formatNum(finalNpv)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Окупаемость</Text>
            <Text style={styles.summaryValueSmall}>
              {paybackPeriod !== null ? `${paybackPeriod} период` : 'Не достигнута'}
            </Text>
          </View>
        </View>
      )}

      {npvValues.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>График NPV</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={{
                labels: npvValues.map((_, i) => `${i}`),
                datasets: [{ data: npvValues }],
              }}
              width={Math.max(screenWidth - 42, npvValues.length * 58)}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
                labelColor: () => '#334155',
                propsForDots: {
                  r: '3',
                  strokeWidth: '1.5',
                  stroke: '#16a34a',
                },
              }}
              bezier
              style={styles.chart}
            />
          </ScrollView>
        </View>
      )}

      {results.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Таблица расчёта</Text>

          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, styles.headerCell]}>Год</Text>
              <Text style={[styles.cell, styles.headerCell]}>CF</Text>
              <Text style={[styles.cell, styles.headerCell]}>PV</Text>
              <Text style={[styles.cell, styles.headerCell]}>NPV</Text>
            </View>

            {results.map((row, index) => (
              <View
                key={index}
                style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}
              >
                <Text style={styles.cell}>{row.year}</Text>
                <Text style={styles.cell}>{formatNum(row.cft)}</Text>
                <Text style={styles.cell}>{formatNum(row.pv)}</Text>
                <Text style={[styles.cell, row.npv >= 0 ? styles.positive : styles.negative]}>
                  {formatNum(row.npv)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f6fb',
  },
  content: {
    padding: 12,
    paddingBottom: 20,
  },

  heroCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: '#cbd5e1',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  label: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 8,
  },
  inputMultiline: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 11,
    color: '#64748b',
    marginTop: -2,
    marginBottom: 8,
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 12,
  },
  buttonPrimaryText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 12,
  },
  buttonSecondaryText: {
    color: '#0f172a',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  goodCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  badCard: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  summaryValueSmall: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 12,
  },

  table: {
    borderWidth: 1,
    borderColor: '#dbe2ea',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerRow: {
    backgroundColor: '#16a34a',
  },
  evenRow: {
    backgroundColor: '#ffffff',
  },
  oddRow: {
    backgroundColor: '#f8fafc',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
    fontSize: 11,
    color: '#0f172a',
  },
  headerCell: {
    color: '#ffffff',
    fontWeight: '700',
  },

  positive: {
    color: '#15803d',
  },
  negative: {
    color: '#dc2626',
  },
});