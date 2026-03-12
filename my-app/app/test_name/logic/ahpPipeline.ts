export const DEFAULT_SOFT_CRITERIA = [
    'avg_reliability',
'total_performance',
'total_cost',
'total_energy',
'lifespan'
];

export const M1 = [
    [1, 3, 5, 4, 3],
[1 / 3, 1, 3, 2, 2],
[1 / 5, 1 / 3, 1, 0.5, 1 / 3],
[1 / 4, 0.5, 2, 1, 0.5],
[1 / 3, 0.5, 3, 2, 1]
];

export const M2 = [
    [1, 2, 4, 3, 2],
[0.5, 1, 2, 2, 1],
[0.25, 0.5, 1, 0.5, 1 / 3],
[1 / 3, 0.5, 2, 1, 0.5],
[0.5, 1, 3, 2, 1]
];

function centroid(r: { low: number; high: number }) {
    return (r.low + r.high) / 2;
}

function normalize(v: number[]) {
    const s = v.reduce((a, b) => a + b, 0);
    return s === 0 ? v.map(() => 1 / v.length) : v.map(x => x / s);
}

export function runAHPipeline({
    configurations,
    softCriteria,
    experts,
    constraints
}: any) {
    const aggregates = configurations.map((c: any) => {
        let cost = 0, energy = 0, perf = 0, rel: number[] = [];
        const counts: any = {};
        c.devices.forEach((d: any) => {
            cost += d.cost;
            energy += d.energy;
            perf += d.cpu_score + d.ram_score;
            if (d.reliability) rel.push(centroid(d.reliability));
            counts[d.role] = (counts[d.role] || 0) + 1;
        });
        return {
            id: c.id,
            total_cost: cost,
            total_energy: energy,
            total_performance: perf,
            avg_reliability: rel.length ? rel.reduce((a, b) => a + b) / rel.length : 0,
                                          lifespan: 5,
                                          counts,
                                          people: c.meta?.people || 0
        };
    });

    const passed = aggregates.filter((a: any) =>
    a.total_cost <= constraints.max_budget &&
    a.total_energy <= constraints.max_energy
    );

    const scores = passed.map((a: any) =>
    softCriteria.map((k: string) => a[k] ?? 0)
    );

    const weights = normalize(
        softCriteria.map((_, i) =>
        scores.reduce((s: number, r: number[]) => s + r[i], 0)
        )
    );

    const final = passed.map((a: any, i: number) => ({
        id: a.id,
        score: weights.reduce((s, w, j) => s + w * scores[i][j], 0)
    }));

    final.sort((a, b) => b.score - a.score);

    return {
        total_input: aggregates.length,
        passed_count: passed.length,
        criteria: { names: softCriteria, weights, CR: 0 },
        final: {
            ranking: final.map(f => [f.id, f.score])
        }
    };
}
