import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

import { buildFinancialChartData } from '../../features/charts/logic/buildFinancialCharts';
import { projectStyles as styles } from '../../features/project/styles';
import { formatCurrencyRU } from '../../shared/utils/currency';
import { useData } from '../../store/data/DataContext';
import { AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing } from '../../shared/theme';

export const title = 'Финансовые графики';

const screenWidth = Dimensions.get('window').width;
const palette = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: () => '#334155',
  propsForDots: {
    r: '3',
    strokeWidth: '1.5',
    stroke: '#3B82F6',
  },
};

export default function FinancialChartsScreen() {
  const data = useData();
  const charts = buildFinancialChartData(data);
  const chartWidth = Math.max(screenWidth - 42, 360);
  const hasStructure = charts.structure.length > 0;

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText} maxFontSizeMultiplier={1.1}>Аналитика</Text>
        </View>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.08}>Финансовые графики</Text>
        <Text style={styles.heroText} maxFontSizeMultiplier={1.12}>
          Визуальная структура затрат, годовой профиль расходов и накопленная стоимость владения по годам.
        </Text>
      </View>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Структура затрат</Text>
        {hasStructure ? (
          <PieChart
            data={charts.structure.map((item, index) => ({
              name: item.title,
              population: item.value,
              color: palette[index % palette.length],
              legendFontColor: '#334155',
              legendFontSize: 12,
            }))}
            width={chartWidth}
            height={210}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="8"
            absolute
            chartConfig={chartConfig}
          />
        ) : (
          <Text style={styles.cardText} maxFontSizeMultiplier={1.12}>Нет затрат для построения структуры.</Text>
        )}
      </AppCard>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Профиль расходов</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarChart
            data={{
              labels: charts.annualBars.map((item) => item.title),
              datasets: [{ data: charts.annualBars.map((item) => item.value) }],
            }}
            width={chartWidth}
            height={230}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={local.chart}
            fromZero
            showValuesOnTopOfBars
          />
        </ScrollView>
        <View style={local.legendList}>
          {charts.annualBars.map((item) => (
            <View key={item.id} style={local.legendRow}>
              <Text style={local.legendTitle} maxFontSizeMultiplier={1.1}>{item.title}</Text>
              <Text style={local.legendValue} maxFontSizeMultiplier={1.1}>{formatCurrencyRU(item.value)}</Text>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard style={local.cardGap}>
        <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Накопленная стоимость владения</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={{
              labels: charts.cumulativeTco.map((_, index) => `${index}`),
              datasets: [
                { data: charts.cumulativeTco },
                { data: charts.discountedTco },
              ],
              legend: ['TCO', 'Дисконт. TCO'],
            }}
            width={Math.max(chartWidth, charts.cumulativeTco.length * 72)}
            height={240}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            bezier
            style={local.chart}
          />
        </ScrollView>
        <Text style={local.note} maxFontSizeMultiplier={1.12}>
          Дисконтированная линия использует условную ставку 12% годовых и нужна для ориентировочного сравнения горизонта владения.
        </Text>
      </AppCard>
    </AnimatedScreenScroll>
  );
}

const local = StyleSheet.create({
  cardGap: {
    gap: spacing.md,
  },
  chart: {
    borderRadius: radius.lg,
  },
  legendList: {
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  legendTitle: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  legendValue: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
  },
  note: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
});
