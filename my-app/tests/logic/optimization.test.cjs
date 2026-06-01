const test = require('node:test');
const assert = require('node:assert/strict');
const { runOptimization } = require('../../.logic-test-dist/features/optimization/logic/optimization.js');

test('runOptimization respects budget and required categories', () => {
  const report = runOptimization({
    scope: 'all',
    categories: [
      { id: 'server', name: 'Серверное оборудование', scope: 'capital' },
      { id: 'client', name: 'Клиентское оборудование', scope: 'capital' },
      { id: 'software', name: 'Лицензии ПО', scope: 'capital' },
    ],
    capitalData: [
      { id: '1', categoryId: 'server', name: 'Server', quantity: 1, price: 50000, kind: 'hardware' },
      { id: '2', categoryId: 'client', name: 'ПК офисный', quantity: 10, price: 5000, kind: 'hardware' },
      { id: '3', categoryId: 'software', name: 'Windows licenses', quantity: 10, price: 1000, kind: 'software' },
    ],
    params: {
      maxBudget: 110000,
      targetClientSeats: 10,
      requiredCategoryIds: ['server', 'client'],
      weights: { cost: 0.35, categoryCoverage: 0.3, clientSeats: 0.25, itemCount: 0.1 },
      generations: 10,
      popSize: 12,
      seed: 7,
    },
  });

  assert.equal(report.status, 'ok');
  assert.ok(report.best.totalCost <= 110000);
  assert.ok(report.best.selectedCategoryIds.includes('server'));
  assert.ok(report.best.selectedCategoryIds.includes('client'));
  assert.equal(report.best.clientSeats, 10);
});
