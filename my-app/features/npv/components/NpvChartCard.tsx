import { ScrollView, Text, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { useNpvStyles } from '../styles';
import { AnimatedSurface } from '../../../shared/ui';
import { useThemePalette } from '../../../shared/theme';

export function NpvChartCard({ values }: { values: number[] }) {
  const styles = useNpvStyles();
  const palette = useThemePalette();

  const { width } = useWindowDimensions();
  const chartWidth = Math.max(width - 64 + 24, values.length * 58);

  if (!values.length) {
    return null;
  }

  return (
    <AnimatedSurface style={styles.card}>
      <Text style={styles.sectionTitle}>График NPV</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={{
            labels: values.map((_, index) => `${index}`),
            datasets: [{ data: values }],
          }}
          width={chartWidth}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: palette.surface,
            backgroundGradientFrom: palette.surface,
            backgroundGradientTo: palette.surface,
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(${palette.isDark ? '34, 197, 94' : '22, 163, 74'}, ${opacity})`,
            labelColor: () => palette.textSoft,
            propsForDots: {
              r: '3',
              strokeWidth: '1.5',
              stroke: palette.success,
            },
          }}
          bezier
          style={styles.chart}
        />
      </ScrollView>
    </AnimatedSurface>
  );
}
