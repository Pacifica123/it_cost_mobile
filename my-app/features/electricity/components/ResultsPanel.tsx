import { Text, View } from 'react-native';

import { useElectricityStyles } from '../styles';
import { AnimatedPressable, AnimatedSurface } from '../../../shared/ui';

export function ResultsPanel(props: {
  resultsOpen: boolean;
  setResultsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  result: {
    totalKwh: number;
    totalRub: number;
    activeCount: number;
    totalUnits: number;
    installedPowerW: number;
    dayKwh: number;
    dayRub: number;
  };
}) {
  const styles = useElectricityStyles();
  const { resultsOpen, setResultsOpen, result } = props;

  return (
    <>
      <AnimatedPressable onPress={() => setResultsOpen((prev) => !prev)} style={styles.resultCollapseHeader}>
        <View style={styles.collapseHeaderMain}>
          <View style={styles.resultCollapseTitleRow}>
            <Text style={styles.resultTitle}>Результаты расчёта</Text>
            <View style={styles.resultBadge}><Text style={styles.resultBadgeText}>в месяц</Text></View>
          </View>
          <Text style={styles.collapseSummary}>{result.totalKwh.toFixed(2)} кВт⋅ч • {result.totalRub.toFixed(2)} руб. • {result.activeCount} поз.</Text>
        </View>
        <View style={styles.collapseToggle}>
          <Text style={styles.collapseToggleText}>{resultsOpen ? 'Скрыть' : 'Открыть'}</Text>
          <Text style={styles.collapseChevron}>{resultsOpen ? '▴' : '▾'}</Text>
        </View>
      </AnimatedPressable>

      {resultsOpen ? (
        <AnimatedSurface style={styles.resultBox}>
          <View style={styles.resultGrid}>
            <View style={[styles.resultMetricCard, styles.resultMetricCardPrimary]}>
              <Text style={styles.resultMetricLabel}>Потребление</Text>
              <Text style={styles.resultMetricValue}>{result.totalKwh.toFixed(2)}</Text>
              <Text style={styles.resultMetricUnit}>кВт⋅ч</Text>
            </View>

            <View style={styles.resultMetricCard}>
              <Text style={styles.resultMetricLabel}>Стоимость</Text>
              <Text style={styles.resultMetricValue}>{result.totalRub.toFixed(2)}</Text>
              <Text style={styles.resultMetricUnit}>руб.</Text>
            </View>
          </View>

          <View style={styles.resultStatsRow}>
            <View style={styles.resultStatChip}><Text style={styles.resultStatLabel}>Позиций</Text><Text style={styles.resultStatValue}>{result.activeCount}</Text></View>
            <View style={styles.resultStatChip}><Text style={styles.resultStatLabel}>Единиц</Text><Text style={styles.resultStatValue}>{result.totalUnits}</Text></View>
            <View style={styles.resultStatChip}><Text style={styles.resultStatLabel}>Мощность</Text><Text style={styles.resultStatValue}>{result.installedPowerW.toFixed(0)} Вт</Text></View>
          </View>

          <View style={styles.resultSubcard}>
            <Text style={styles.resultSubcardTitle}>Среднее за рабочий день</Text>
            <Text style={styles.resultSubcardText}>{result.dayKwh.toFixed(2)} кВт⋅ч • {result.dayRub.toFixed(2)} руб.</Text>
          </View>

          <Text style={styles.resultHint}>Расчёт: мощность × количество × часы работы × рабочие дни.</Text>
        </AnimatedSurface>
      ) : null}
    </>
  );
}
