import React, { useMemo, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';

import { CostStructureCard } from '../../../features/project/components/CostStructureCard';
import { ReadinessCard } from '../../../features/project/components/ReadinessCard';
import { buildProjectReadiness } from '../../../features/project/logic/readiness';
import { ReportAssumptionsCard } from '../../../features/report/components/ReportAssumptionsCard';
import { ReportInsightsCard } from '../../../features/report/components/ReportInsightsCard';
import { ReportListPhone } from '../../../features/report/components/ReportListPhone';
import { ReportMarkdownCard } from '../../../features/report/components/ReportMarkdownCard';
import { ReportTableWide } from '../../../features/report/components/ReportTableWide';
import { SummaryCard } from '../../../features/report/components/SummaryCard';
import { buildReport } from '../../../features/report/logic/buildReport';
import { buildReportMarkdown } from '../../../features/report/logic/buildReportMarkdown';
import { buildReportHtml } from '../../../features/report/logic/buildReportHtml';
import { styles } from '../../../features/report/styles';
import { useData } from '../../../store/data/DataContext';
import type { CapitalEquipment, OperatingEquipment } from '../../../store/data/types';
import { AnimatedPressable, AnimatedScreenScroll, AnimatedSurface } from '../../../shared/ui';

export const tab = true;
export const title = 'Отчёт';

const getCapitalQuantity = (item: CapitalEquipment) => item.quantity;
const getCapitalCost = (item: CapitalEquipment) => item.quantity * item.price;
const getOperatingQuantity = () => 1;
const getOperatingCost = (item: OperatingEquipment) => item.price;

export default function SummaryScreen() {
  const [showDetails, setShowDetails] = useState(false);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const data = useData();
  const { width } = useWindowDimensions();

  const isPhone = width < 420;
  const report = useMemo(
    () =>
      buildReport({
        capitalData: data.capitalData,
        operatingData: data.operatingData,
        categories: data.categories,
        electricityTotal: data.electricityTotal,
      }),
    [data.capitalData, data.categories, data.electricityTotal, data.operatingData]
  );
  const readiness = useMemo(() => buildProjectReadiness(data), [data]);
  const markdown = useMemo(() => buildReportMarkdown(report, readiness, data.projectMeta), [data.projectMeta, readiness, report]);
  const html = useMemo(() => buildReportHtml(report, readiness, data.projectMeta), [data.projectMeta, readiness, report]);

  const COL_NAME = isPhone ? 260 : 360;
  const COL_QTY = 90;
  const COL_COST = 130;
  const TABLE_MIN_WIDTH = COL_NAME + COL_QTY + COL_COST;

  return (
    <AnimatedScreenScroll style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle} maxFontSizeMultiplier={1.08}>Сводная таблица затрат</Text>
        <Text style={styles.heroSubtitle} maxFontSizeMultiplier={1.12}>Разовые суммы показаны отдельно, а периодические и электричество нормализованы до годового горизонта.</Text>
      </View>

      <SummaryCard
        totalOneTimeExpenses={report.totalOneTimeExpenses}
        periodicTotalMonthly={report.periodicTotalMonthly}
        periodicTotalAnnual={report.periodicTotalAnnual}
        electricityTotalMonthly={report.electricityTotalMonthly}
        electricityTotalAnnual={report.electricityTotalAnnual}
        grandTotalAnnual={report.grandTotalAnnual}
      />

      <ReadinessCard readiness={readiness} compact />

      <CostStructureCard
        hardwareTotal={report.hardwareTotal}
        softwareTotal={report.softwareTotal}
        opexAnnual={report.periodicTotalAnnual + report.oneTimeOperatingTotal}
        electricityAnnual={report.electricityTotalAnnual}
      />

      <ReportInsightsCard insights={report.insights} />

      <ReportAssumptionsCard
        periodicMultiplier={report.assumptions.periodicMultiplier}
        electricityMultiplier={report.assumptions.electricityMultiplier}
      />

      <AnimatedPressable
        onPress={() => setShowMarkdown((value) => !value)}
        style={styles.toggle}
      >
        <Text style={styles.toggleText} maxFontSizeMultiplier={1.12}>
          {showMarkdown ? 'Скрыть текст отчёта' : 'Сформировать текст отчёта'}{' '}
          <Text style={styles.toggleArrow}>{showMarkdown ? '▲' : '▼'}</Text>
        </Text>
      </AnimatedPressable>

      {showMarkdown ? <ReportMarkdownCard markdown={markdown} html={html} /> : null}

      <AnimatedPressable
        onPress={() => setShowDetails((value) => !value)}
        style={styles.toggle}
      >
        <Text style={styles.toggleText} maxFontSizeMultiplier={1.12}>
          {showDetails ? 'Скрыть детали' : 'Показать детали'}{' '}
          <Text style={styles.toggleArrow}>{showDetails ? '▲' : '▼'}</Text>
        </Text>
      </AnimatedPressable>

      {showDetails ? (
        <AnimatedSurface style={{ gap: 12 }}>
          <View style={styles.card}>
            <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Капитальные затраты</Text>

            {isPhone ? (
              <ReportListPhone
                grouped={report.groupedCapital}
                getQty={getCapitalQuantity}
                getCost={getCapitalCost}
                subtotalLabel="ИТОГО КАПИТАЛЬНЫХ"
                subtotalValue={report.capitalTotal}
              />
            ) : (
              <ReportTableWide
                grouped={report.groupedCapital}
                getQty={getCapitalQuantity}
                getCost={getCapitalCost}
                subtotalLabel="ИТОГО КАПИТАЛЬНЫХ"
                subtotalValue={report.capitalTotal}
                colNameWidth={COL_NAME}
                colQtyWidth={COL_QTY}
                colCostWidth={COL_COST}
                tableMinWidth={TABLE_MIN_WIDTH}
              />
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle} maxFontSizeMultiplier={1.12}>Операционные затраты</Text>

            <Text style={styles.sectionLabel} maxFontSizeMultiplier={1.12}>Разовые</Text>
            {report.oneTimeOperating.length > 0 ? (
              isPhone ? (
                <ReportListPhone
                  grouped={report.groupedOneTimeOperating}
                  getQty={getOperatingQuantity}
                  getCost={getOperatingCost}
                  subtotalLabel="ИТОГО РАЗОВЫХ"
                  subtotalValue={report.oneTimeOperatingTotal}
                />
              ) : (
                <ReportTableWide
                  grouped={report.groupedOneTimeOperating}
                  getQty={getOperatingQuantity}
                  getCost={getOperatingCost}
                  subtotalLabel="ИТОГО РАЗОВЫХ"
                  subtotalValue={report.oneTimeOperatingTotal}
                  colNameWidth={COL_NAME}
                  colQtyWidth={COL_QTY}
                  colCostWidth={COL_COST}
                  tableMinWidth={TABLE_MIN_WIDTH}
                />
              )
            ) : (
              <Text style={styles.empty}>Нет данных</Text>
            )}

            <Text style={[styles.sectionLabel, { marginTop: 14 }]} maxFontSizeMultiplier={1.12}>Периодические в месяц</Text>
            {report.periodicOperating.length > 0 ? (
              isPhone ? (
                <ReportListPhone
                  grouped={report.groupedPeriodicOperating}
                  getQty={getOperatingQuantity}
                  getCost={getOperatingCost}
                  subtotalLabel="ИТОГО ПЕРИОДИЧЕСКИХ В МЕСЯЦ"
                  subtotalValue={report.periodicTotalMonthly}
                />
              ) : (
                <ReportTableWide
                  grouped={report.groupedPeriodicOperating}
                  getQty={getOperatingQuantity}
                  getCost={getOperatingCost}
                  subtotalLabel="ИТОГО ПЕРИОДИЧЕСКИХ В МЕСЯЦ"
                  subtotalValue={report.periodicTotalMonthly}
                  colNameWidth={COL_NAME}
                  colQtyWidth={COL_QTY}
                  colCostWidth={COL_COST}
                  tableMinWidth={TABLE_MIN_WIDTH}
                />
              )
            ) : (
              <Text style={styles.empty}>Нет данных</Text>
            )}
          </View>
        </AnimatedSurface>
      ) : null}
    </AnimatedScreenScroll>
  );
}
