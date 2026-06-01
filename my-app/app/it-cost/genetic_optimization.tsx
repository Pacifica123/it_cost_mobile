import React from 'react';
import { Text, View } from 'react-native';

import { Field, PrimaryButton, StatCard } from '../../features/optimization/components';
import { useOptimizationState } from '../../features/optimization/hooks/useOptimizationState';
import { explainOptimizationReport } from '../../features/optimization/logic/explainOptimization';
import { optimizationStyles as styles } from '../../features/optimization/styles';
import type { OptimizationScope, OptimizationSolution } from '../../features/optimization/types';
import { formatRub } from '../../shared/utils/currency';
import { formatNumber } from '../../shared/utils/number';
import { AnimatedPressable, AnimatedScreenScroll, AnimatedSurface } from '../../shared/ui';
import { useData } from '../../store/data/DataContext';

export const title = 'Генетический подбор';

type ScopeOption = { key: OptimizationScope; label: string };
const SCOPE_OPTIONS: ScopeOption[] = [
  { key: 'all', label: 'Всё' },
  { key: 'technical', label: 'ТО' },
  { key: 'software', label: 'ПО' },
];

function ExplanationBlock({ lines }: { lines: string[] }) {
  if (!lines.length) return null;

  return (
    <View style={styles.explanationBox}>
      <Text style={styles.explanationTitle} maxFontSizeMultiplier={1.12}>Почему выбран этот вариант</Text>
      {lines.map((line) => (
        <Text key={line} style={styles.explanationText} maxFontSizeMultiplier={1.12}>• {line}</Text>
      ))}
    </View>
  );
}

function SolutionCard({ solution, mode }: { solution: OptimizationSolution; mode: 'ga' | 'ahp' }) {
  const score = mode === 'ahp' ? solution.ahpScore ?? solution.score : solution.score;
  return (
    <View style={styles.solutionCard}>
      <View style={styles.solutionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.solutionTitle}>#{solution.rank} • {formatRub(solution.totalCost)}</Text>
          <Text style={styles.solutionMeta}>
            Категорий: {formatNumber(solution.selectedCategoryIds.length)} • рабочих мест: {formatNumber(solution.clientSeats)}
          </Text>
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scorePillText}>{score.toFixed(3)}</Text>
        </View>
      </View>

      {solution.selectedItems.slice(0, 5).map((item) => (
        <Text key={item.id} style={styles.itemText}>• {item.name} × {formatNumber(item.quantity)} — {formatRub(item.totalCost)}</Text>
      ))}
      {solution.selectedItems.length > 5 ? (
        <Text style={styles.muted}>+ ещё {solution.selectedItems.length - 5} поз.</Text>
      ) : null}
      {solution.hybridScore !== undefined ? (
        <Text style={[styles.solutionMeta, { marginTop: 6 }]}>Гибрид GA+AHP: {solution.hybridScore.toFixed(3)}</Text>
      ) : null}
    </View>
  );
}

export default function GeneticOptimizationScreen() {
  const data = useData();
  const state = useOptimizationState(data.capitalData, data.categories, data.projectMeta);

  return (
    <AnimatedScreenScroll style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <View style={styles.badge}><Text style={styles.badgeText}>GA + AHP</Text></View>
        <Text style={styles.title}>Генетический подбор</Text>
        <Text style={styles.subtitle}>
          Подбирает допустимый набор из CAPEX-записей по бюджету, обязательным категориям и весам критериев. Затем топ GA-кандидатов дополнительно ранжируется AHP-подобной оценкой.
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Область анализа</Text>
        <Text style={styles.sectionText}>Как в десктопе: можно анализировать всё вместе или отдельно техническое оборудование и ПО.</Text>
        <View style={styles.segmentRow}>
          {SCOPE_OPTIONS.map((option) => {
            const active = state.scope === option.key;
            return (
              <AnimatedPressable
                key={option.key}
                onPress={() => state.setScope(option.key)}
                style={[styles.segment, active && styles.segmentActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Ограничения</Text>
        <Text style={styles.sectionText}>Бюджет — жёсткое ограничение. Обязательные категории должны попасть в итоговый набор.</Text>
        <Field label="Максимальный бюджет" value={state.budget} onChangeText={state.setBudget} placeholder="150000" />
        <Field label="Целевые клиентские места" value={state.targetSeats} onChangeText={state.setTargetSeats} placeholder="10" />

        <Text style={styles.label}>Обязательные категории</Text>
        <View style={styles.segmentRow}>
          {state.capitalCategories.map((category) => {
            const active = state.requiredCategoryIds.includes(category.id);
            return (
              <AnimatedPressable
                key={category.id}
                onPress={() => state.toggleRequiredCategory(category.id)}
                style={[styles.segment, active && styles.segmentActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{category.name}</Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Веса критериев</Text>
        <Text style={styles.sectionText}>Как в десктопной версии: стоимость, покрытие категорий и клиентские места влияют на итоговый score.</Text>
        <View style={styles.doubleRow}>
          <View style={styles.half}><Field label="Стоимость" value={state.costWeight} onChangeText={state.setCostWeight} /></View>
          <View style={styles.half}><Field label="Покрытие" value={state.coverageWeight} onChangeText={state.setCoverageWeight} /></View>
        </View>
        <View style={styles.doubleRow}>
          <View style={styles.half}><Field label="Клиентские места" value={state.clientWeight} onChangeText={state.setClientWeight} /></View>
          <View style={styles.half}><Field label="Размер набора" value={state.countWeight} onChangeText={state.setCountWeight} /></View>
        </View>
        <PrimaryButton label="Запустить подбор" onPress={state.run} />
      </View>

      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Текущее состояние данных</Text>
        <View style={styles.statGrid}>
          <StatCard label="CAPEX-записей" value={data.capitalData.length} />
          <StatCard label="CAPEX всего" value={formatRub(state.capitalTotal)} />
          <StatCard label="Категорий" value={state.capitalCategories.length} />
          <StatCard label="Обязательных" value={state.requiredCategoryIds.length} />
        </View>
      </View>

      {state.report ? (
        <AnimatedSurface style={styles.panel}>
          <Text style={styles.sectionTitle}>Результат GA</Text>
          {state.report.warning ? <Text style={styles.warning}>{state.report.warning}</Text> : null}
          <ExplanationBlock lines={explainOptimizationReport(state.report)} />
          <View style={styles.statGrid}>
            <StatCard label="Кандидатов" value={state.report.candidateCount} />
            <StatCard label="Допустимых на старте" value={state.report.feasibleInitialCount} />
            <StatCard label="Поколений" value={state.report.generationsRan} />
            <StatCard label="Top решений" value={state.report.topSolutions.length} />
          </View>
          {state.report.topSolutions.map((solution) => (
            <SolutionCard key={solution.mask.join('-')} solution={solution} mode="ga" />
          ))}
        </AnimatedSurface>
      ) : null}

      {state.report?.ahpRanking.length ? (
        <AnimatedSurface style={styles.panel}>
          <Text style={styles.sectionTitle}>Независимое ранжирование AHP</Text>
          <Text style={styles.sectionText}>Тот же пул GA-кандидатов переоценивается по нормализованным критериям, отдельно от GA-score.</Text>
          {state.report.ahpRanking.map((solution) => (
            <SolutionCard key={`ahp-${solution.mask.join('-')}`} solution={solution} mode="ahp" />
          ))}
        </AnimatedSurface>
      ) : null}
    </AnimatedScreenScroll>
  );
}
