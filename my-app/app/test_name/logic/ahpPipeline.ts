export const DEFAULT_SOFT_CRITERIA = [
  'avg_reliability',
  'total_performance',
  'total_cost',
  'total_energy',
  'lifespan',
] as const;

export const M1 = [
  [1, 3, 5, 4, 3],
  [1 / 3, 1, 3, 2, 2],
  [1 / 5, 1 / 3, 1, 0.5, 1 / 3],
  [1 / 4, 0.5, 2, 1, 0.5],
  [1 / 3, 0.5, 3, 2, 1],
];

export const M2 = [
  [1, 2, 4, 3, 2],
  [0.5, 1, 2, 2, 1],
  [0.25, 0.5, 1, 0.5, 1 / 3],
  [1 / 3, 0.5, 2, 1, 0.5],
  [0.5, 1, 3, 2, 1],
];

type ReliabilityRange = {
  low: number;
  high: number;
};

type Device = {
  role: string;
  vendor?: string;
  cpu_score: number;
  ram_score: number;
  energy: number;
  cost: number;
  reliability?: ReliabilityRange;
};

type Configuration = {
  id: string;
  meta?: {
    people?: number;
  };
  devices: Device[];
};

type Constraints = {
  max_budget: number;
  max_energy: number;
  people_match_tolerance?: number;
};

type AHPInput = {
  configurations: Configuration[];
  softCriteria: string[];
  experts: number[][][];
  constraints: Constraints;
};

export type AHPReport = {
  total_input: number;
  passed_count: number;
  warning?: string;
  criteria: {
    names: string[];
    weights: number[];
    CR: number;
  };
  final: {
    ranking: [string, number][];
  };
};

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
  const aggregates = configurations.map((c) => {
    let cost = 0;
    let energy = 0;
    let perf = 0;
    const rel: number[] = [];
    const counts: Record<string, number> = {};

    c.devices.forEach((d) => {
      cost += d.cost;
      energy += d.energy;
      perf += d.cpu_score + d.ram_score;

      if (d.reliability) {
        rel.push(centroid(d.reliability));
      }

      counts[d.role] = (counts[d.role] || 0) + 1;
    });

    return {
      id: c.id,
      total_cost: cost,
      total_energy: energy,
      total_performance: perf,
      avg_reliability: rel.length
        ? rel.reduce((a, b) => a + b, 0) / rel.length
        : 0,
      lifespan: 5,
      counts,
      people: c.meta?.people || 0,
    };
  });

  const passed = aggregates.filter(
    (a) =>
      a.total_cost <= constraints.max_budget &&
      a.total_energy <= constraints.max_energy
  );

  const warning =
    passed.length === 0
      ? 'Нет конфигураций, прошедших заданные ограничения.'
      : undefined;

  const scores = passed.map((a) =>
    softCriteria.map((k) => a[k as keyof typeof a] as number ?? 0)
  );

  const weights = normalize(
    softCriteria.map((_, i) =>
      scores.reduce((sum, row) => sum + (row[i] || 0), 0)
    )
  );

  const final = passed.map((a, i) => ({
    id: a.id,
    score: weights.reduce((sum, w, j) => sum + w * (scores[i]?.[j] || 0), 0),
  }));

  final.sort((a, b) => b.score - a.score);

  return {
    total_input: aggregates.length,
    passed_count: passed.length,
    warning,
    criteria: {
      names: softCriteria,
      weights,
      CR: 0,
    },
    final: {
      ranking: final.map((f) => [f.id, f.score]),
    },
  };
}