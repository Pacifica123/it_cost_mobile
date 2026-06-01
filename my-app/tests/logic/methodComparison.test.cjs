const test = require('node:test');
const assert = require('node:assert/strict');

const { initialState } = require('../../.logic-test-dist/store/data/defaults');
const { compareOptimizationMethods } = require('../../.logic-test-dist/features/methodComparison/logic/compareMethods');

test('method comparison builds rows for demo project', () => {
  const report = compareOptimizationMethods(initialState);

  assert.equal(report.status, 'ok');
  assert.equal(report.rows.length, 4);
  assert.ok(report.rows.some((row) => row.id === 'ga'));
  assert.ok(report.rows.some((row) => row.id === 'pareto'));
});

test('method comparison reports insufficient data for empty project', () => {
  const report = compareOptimizationMethods({ categories: [], capitalData: [], operatingData: [], electricityTotal: 0 });

  assert.equal(report.status, 'not_enough_data');
  assert.match(report.conclusion, /минимум/i);
});
