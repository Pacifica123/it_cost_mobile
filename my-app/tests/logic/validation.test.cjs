const test = require('node:test');
const assert = require('node:assert/strict');

const { initialState } = require('../../.logic-test-dist/store/data/defaults');
const { validateProjectData } = require('../../.logic-test-dist/features/validation/logic/validateProjectData');

test('validation allows demo project without critical errors', () => {
  const report = validateProjectData(initialState);

  assert.equal(report.canCalculate, true);
  assert.equal(report.errors.length, 0);
  assert.ok(report.score > 70);
});

test('validation blocks negative and broken CAPEX data', () => {
  const report = validateProjectData({
    categories: [],
    capitalData: [{ id: 'x', categoryId: 'missing', name: '', quantity: 0, price: -1 }],
    operatingData: [],
    electricityTotal: -5,
  });

  assert.equal(report.canCalculate, false);
  assert.ok(report.errors.length >= 4);
});
