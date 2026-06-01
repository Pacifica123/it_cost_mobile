const test = require('node:test');
const assert = require('node:assert/strict');

const { runOptimization } = require('../../.logic-test-dist/features/optimization/logic/optimization');
const { explainOptimizationReport } = require('../../.logic-test-dist/features/optimization/logic/explainOptimization');
const { initialState } = require('../../.logic-test-dist/store/data/defaults');

test('optimization explanation describes successful GA result', () => {
  const report = runOptimization({
    capitalData: initialState.capitalData,
    categories: initialState.categories,
    scope: 'all',
    params: {
      maxBudget: 1000000,
      targetClientSeats: 10,
      requiredCategoryIds: ['capital-client'],
      weights: {
        cost: 0.35,
        categoryCoverage: 0.3,
        clientSeats: 0.25,
        itemCount: 0.1,
      },
      generations: 4,
      popSize: 10,
    },
  });

  const lines = explainOptimizationReport(report);

  assert.equal(report.status, 'ok');
  assert.ok(lines.length >= 3);
  assert.ok(lines.join(' ').includes('GA'));
});
