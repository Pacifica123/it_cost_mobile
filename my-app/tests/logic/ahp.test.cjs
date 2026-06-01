const test = require('node:test');
const assert = require('node:assert/strict');
const { runAHPipeline, DEFAULT_SOFT_CRITERIA } = require('../../.logic-test-dist/features/ahp/logic/pipeline.js');

test('runAHPipeline filters by constraints and returns normalized weights', () => {
  const report = runAHPipeline({
    configurations: [
      {
        id: 'A',
        devices: [
          { role: 'server', cpu_score: 8, ram_score: 8, energy: 100, cost: 1000, reliability: { low: 0.9, high: 1 } },
        ],
      },
      {
        id: 'B',
        devices: [
          { role: 'server', cpu_score: 2, ram_score: 2, energy: 1000, cost: 5000, reliability: { low: 0.4, high: 0.6 } },
        ],
      },
    ],
    softCriteria: [...DEFAULT_SOFT_CRITERIA],
    experts: [],
    constraints: {
      max_budget: 1500,
      max_energy: 200,
    },
  });

  assert.equal(report.total_input, 2);
  assert.equal(report.passed_count, 1);
  assert.equal(report.final.ranking[0][0], 'A');

  const weightSum = report.criteria.weights.reduce((sum, value) => sum + value, 0);
  assert.ok(Math.abs(weightSum - 1) < 1e-9);
});
