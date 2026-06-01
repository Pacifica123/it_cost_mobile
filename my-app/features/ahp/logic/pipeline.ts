import { DEFAULT_SOFT_CRITERIA, M1, M2 } from '../constants';
import type { AHPInput, AHPReport, ReliabilityRange } from '../types';

export { DEFAULT_SOFT_CRITERIA, M1, M2 };
export type { AHPInput, AHPReport };

function centroid(r: ReliabilityRange) {
  return (r.low + r.high) / 2;
}

function normalize(v: number[]) {
  const s = v.reduce((a, b) => a + b, 0);
  return s === 0 ? v.map(() => 1 / v.length) : v.map((x) => x / s);
}

export function runAHPipeline({
  configurations,
  softCriteria,
  experts,
  constraints,
}: AHPInput): AHPReport {
  const aggregates = configurations.map((configuration) => {
    let cost = 0;
    let energy = 0;
    let perf = 0;
    const rel: number[] = [];
    const counts: Record<string, number> = {};

    configuration.devices.forEach((device) => {
      cost += device.cost;
      energy += device.energy;
      perf += device.cpu_score + device.ram_score;

      if (device.reliability) {
        rel.push(centroid(device.reliability));
      }

      counts[device.role] = (counts[device.role] || 0) + 1;
    });

    return {
      id: configuration.id,
      total_cost: cost,
      total_energy: energy,
      total_performance: perf,
      avg_reliability: rel.length ? rel.reduce((a, b) => a + b, 0) / rel.length : 0,
      lifespan: 5,
      counts,
      people: configuration.meta?.people || 0,
    };
  });

  const passed = aggregates.filter(
    (aggregate) =>
      aggregate.total_cost <= constraints.max_budget &&
      aggregate.total_energy <= constraints.max_energy
  );

  const warning = passed.length === 0
    ? 'Нет конфигураций, прошедших заданные ограничения.'
    : undefined;

  const scores = passed.map((aggregate) =>
    softCriteria.map((criterion) => (aggregate[criterion as keyof typeof aggregate] as number) ?? 0)
  );

  const weights = normalize(
    softCriteria.map((_, index) => scores.reduce((sum, row) => sum + (row[index] || 0), 0))
  );

  const final = passed.map((aggregate, index) => ({
    id: aggregate.id,
    score: weights.reduce((sum, weight, criterionIndex) => sum + weight * (scores[index]?.[criterionIndex] || 0), 0),
  }));

  final.sort((a, b) => b.score - a.score);

  return {
    total_input: aggregates.length,
    passed_count: passed.length,
    warning,
    criteria: {
      names: softCriteria,
      weights,
      CR: experts.length > 0 ? 0 : 0,
    },
    final: {
      ranking: final.map((item) => [item.id, item.score]),
    },
  };
}
