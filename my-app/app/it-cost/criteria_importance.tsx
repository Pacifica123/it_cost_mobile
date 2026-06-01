import React from 'react';
import { Text, View } from 'react-native';

import { useImportanceState } from '../../features/criteriaImportance/hooks/useImportanceState';
import { importanceStyles as styles } from '../../features/criteriaImportance/styles';
import { formatNumber } from '../../shared/utils/number';
import { AnimatedPressable, AnimatedScreenScroll, AnimatedSurface } from '../../shared/ui';

export const title = 'Обоснование выбора ИТ-решения';

export default function CriteriaImportanceScreen() {
  const state = useImportanceState();

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.badge}><Text style={styles.badgeText}>N-кратная модель</Text></View>
        <Text style={styles.title}>Обоснование выбора ИТ‑решения</Text>
        <Text style={styles.subtitle}>
          Перенос десктопной вкладки анализа важности критериев: отношения «важнее» и «равно» превращаются в кратности критериев, затем сравниваются альтернативы.
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Кейс</Text>
        <Text style={styles.sectionText}>{state.caseData.name}</Text>
        <View style={styles.chipWrap}>
          <View style={styles.chip}><Text style={styles.chipText}>Критериев: {state.summary?.criteriaCount}</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}>Альтернатив: {state.summary?.alternativesCount}</Text></View>
          <View style={styles.chip}><Text style={styles.chipText}>Связей: {state.summary?.relationsCount}</Text></View>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Запуск анализа</Text>
        <Text style={styles.sectionText}>Используется тот же демонстрационный пример, который лежит в десктопном проекте.</Text>
        <AnimatedPressable onPress={state.run} style={styles.button}>
          <Text style={styles.buttonText}>Пересчитать важность критериев</Text>
        </AnimatedPressable>
        {state.error ? <Text style={[styles.sectionText, { color: '#991b1b', marginTop: 10 }]}>{state.error}</Text> : null}
      </View>

      {state.report ? (
        <AnimatedSurface style={{ gap: 14 }}>
          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>Рейтинг альтернатив</Text>
            {state.report.ranking.map((row, index) => (
              <View key={row.id} style={[styles.rankRow, index === 0 && styles.winner]}>
                <Text style={styles.rankTitle}>#{index + 1} • {row.name}</Text>
                <Text style={styles.rankMeta}>
                  Взвешенная сумма: {formatNumber(row.weightedSum.toFixed(2))} • {row.nondominated ? 'недоминируемая' : 'доминируемая'}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>Объяснение</Text>
            <Text style={styles.explanation}>{state.report.explanation}</Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>Кратности критериев</Text>
            <View style={styles.chipWrap}>
              {Object.entries(state.report.analysisModel.criterionMultiplicity)
                .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
                .map(([criterionId, multiplicity]) => (
                  <View key={criterionId} style={styles.chip}>
                    <Text style={styles.chipText}>{criterionId}: ×{multiplicity}</Text>
                  </View>
                ))}
            </View>
          </View>

          <View style={styles.panel}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>JSON-отчёт</Text>
                <Text style={styles.sectionText}>Для проверки и экспорта можно раскрыть полный результат.</Text>
              </View>
              <AnimatedPressable onPress={() => state.setShowJson((prev) => !prev)} style={styles.chip}>
                <Text style={styles.chipText}>{state.showJson ? 'Скрыть' : 'Показать'}</Text>
              </AnimatedPressable>
            </View>
            {state.showJson ? (
              <View style={styles.jsonBox}>
                <Text style={styles.jsonText}>{JSON.stringify(state.report, null, 2)}</Text>
              </View>
            ) : null}
          </View>
        </AnimatedSurface>
      ) : null}
    </AnimatedScreenScroll>
  );
}
