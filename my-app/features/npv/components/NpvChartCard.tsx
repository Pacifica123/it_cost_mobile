import { Dimensions, ScrollView, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { styles } from '../styles';
import { AnimatedSurface } from '../../../shared/ui';

const screenWidth = Dimensions.get('window').width;

export function NpvChartCard({ values }: { values: number[] }) {
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
          width={Math.max(screenWidth - 42, values.length * 58)}
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
    </AnimatedSurface>
  );
}
