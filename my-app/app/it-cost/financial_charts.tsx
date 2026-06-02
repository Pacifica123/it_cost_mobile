import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

import { buildFinancialChartData } from '../../features/charts/logic/buildFinancialCharts';
import { projectStyles as styles } from '../../features/project/styles';
import { formatCurrencyRU } from '../../shared/utils/currency';
import { useData } from '../../store/data/DataContext';
import { AnimatedScreenScroll, AppCard } from '../../shared/ui';
import { colors, radius, spacing } from '../../shared/theme';

export const title = 'Финансовые графики';

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
  const { width } = useWindowDimensions();
  const contentWidth = Math.max(width - spacing.lg * 4, 240);
  const pieWidth = Math.max(contentWidth, 260);
  const barWidth = Math.max(contentWidth + 28, charts.annualBars.length * 108);
  const lineWidth = Math.max(contentWidth + 28, charts.cumulativeTco.length * 72);
  const hasStructure = charts.structure.length > 0;
  const structureTotal = charts.structure.reduce((sum, item) => sum + item.value, 0);

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
          <>
            <View style={local.pieWrap}>
              <PieChart
                data={charts.structure.map((item, index) => ({
                  name: item.title,
                  population: item.value,
                  color: palette[index % palette.length],
                  legendFontColor: '#334155',
                  legendFontSize: 12,
                }))}
                width={pieWidth}
                height={200}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="24"
                hasLegend={false}
                chartConfig={chartConfig}
              />
            </View>
            <View style={local.legendList}>
              {charts.structure.map((item, index) => {
                const percent = structureTotal > 0 ? Math.round((item.value / structureTotal) * 100) : 0;
                return (
                  <View key={item.id} style={local.structureLegendRow}>
                    <View style={local.structureLegendLabelWrap}>
                      <View style={[local.legendDot, { backgroundColor: palette[index % palette.length] }]} />
                      <Text style={local.structureLegendTitle} maxFontSizeMultiplier={1.1}>
                        {item.title}
                      </Text>
                    </View>
                    <Text style={local.structureLegendValue} maxFontSizeMultiplier={1.1}>
                      {formatCurrencyRU(item.value)} · {percent}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
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
            width={barWidth}
            height={230}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={local.chart}
            fromZero
            showValuesOnTopOfBars
            yLabelsOffset={8}
            xLabelsOffset={2}
            verticalLabelRotation={0}
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
                {
                  data: charts.cumulativeTco,
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  strokeWidth: 2.25,
                },
                {
                  data: charts.discountedTco,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  strokeWidth: 2.25,
                },
              ],
            }}
            width={lineWidth}
            height={240}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            bezier
            withShadow={false}
            withDots
            yLabelsOffset={8}
            style={local.chart}
          />
        </ScrollView>
        <View style={local.lineLegendRow}>
          <View style={local.lineLegendItem}>
            <View style={[local.legendDot, { backgroundColor: palette[0] }]} />
            <Text style={local.lineLegendText} maxFontSizeMultiplier={1.1}>TCO</Text>
          </View>
          <View style={local.lineLegendItem}>
            <View style={[local.legendDot, { backgroundColor: palette[1] }]} />
            <Text style={local.lineLegendText} maxFontSizeMultiplier={1.1}>Дисконт. TCO</Text>
          </View>
        </View>
        <Text style={local.note} maxFontSizeMultiplier={1.12}>
          Дисконтированная линия использует ставку из настроек приложения и нужна для ориентировочного сравнения горизонта владения.
        </Text>
      </AppCard>
    </AnimatedScreenScroll>
  );
}

const local = StyleSheet.create({
  cardGap: {
    gap: spacing.md,
  },
  pieWrap: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: radius.lg,
    paddingRight: spacing.sm,
  },
  legendList: {
    gap: 8,
  },
  structureLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  structureLegendLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: radius.pill,
    flexShrink: 0,
  },
  structureLegendTitle: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    flexShrink: 1,
  },
  structureLegendValue: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'right',
    flexShrink: 1,
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
    flex: 1,
  },
  legendValue: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    textAlign: 'right',
    flexShrink: 1,
  },
  lineLegendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: 4,
  },
  lineLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  lineLegendText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  note: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
});
