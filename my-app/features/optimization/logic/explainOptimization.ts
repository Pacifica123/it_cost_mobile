import type { OptimizationReport, OptimizationSolution } from '../types';
import { formatCurrencyRU } from '../../../shared/utils/currency';

const percent = (value: number) => `${Math.round(value * 100)}%`;

export function explainOptimizationSolution(solution: OptimizationSolution) {
  const lines = [
    `Конфигурация уложилась в бюджетную модель: итоговая стоимость ${formatCurrencyRU(solution.totalCost)}.`,
    `Покрытие категорий составило ${percent(solution.categoryCoverage)}, рабочих мест найдено: ${solution.clientSeats}.`,
    `Оценка GA: ${solution.score.toFixed(3)}${solution.ahpScore !== undefined ? `, AHP: ${solution.ahpScore.toFixed(3)}` : ''}${solution.hybridScore !== undefined ? `, гибрид: ${solution.hybridScore.toFixed(3)}` : ''}.`,
  ];

  const strongCriteria = Object.entries(solution.criteria)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => {
      if (key === 'costUtility') return 'стоимость';
      if (key === 'categoryCoverage') return 'покрытие категорий';
      if (key === 'clientSeats') return 'клиентские места';
      return 'размер набора';
    });

  if (strongCriteria.length) {
    lines.push(`Сильнее всего на результат повлияли: ${strongCriteria.join(' и ')}.`);
  }

  return lines;
}

export function explainOptimizationReport(report: OptimizationReport) {
  if (report.status === 'empty') {
    return [
      'Для выбранной области анализа нет элементов CAPEX.',
      'Добавьте ТО или ПО, затем повторите запуск GA.',
    ];
  }

  if (report.status === 'no_feasible') {
    return [
      'GA не нашёл допустимых конфигураций.',
      'Обычно причина в слишком маленьком бюджете или слишком жёстком наборе обязательных категорий.',
      'Попробуйте увеличить бюджет, снять часть обязательных категорий или добавить более дешёвые альтернативы.',
    ];
  }

  if (!report.best) {
    return ['Результат получен, но лучшая конфигурация не определена. Проверьте исходные данные.'];
  }

  return explainOptimizationSolution(report.best);
}
