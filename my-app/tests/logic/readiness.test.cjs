const test = require('node:test');
const assert = require('node:assert/strict');

const { buildProjectReadiness } = require('../../.logic-test-dist/features/project/logic/readiness');
const { initialState } = require('../../.logic-test-dist/store/data/defaults');

test('project readiness gives demo data a usable score', () => {
  const readiness = buildProjectReadiness(initialState);

  assert.ok(readiness.percent > 50);
  assert.equal(readiness.blockers.length, 0);
  assert.ok(readiness.checks.some((check) => check.id === 'hardware' && check.status === 'ok'));
  assert.ok(readiness.checks.some((check) => check.id === 'software' && check.status === 'ok'));
});

test('project readiness flags empty projects as incomplete', () => {
  const readiness = buildProjectReadiness({
    ...initialState,
    capitalData: [],
    operatingData: [],
    electricityTotal: 0,
  });

  assert.ok(readiness.percent < 50);
  assert.ok(readiness.blockers.some((check) => check.id === 'capex'));
  assert.ok(readiness.blockers.some((check) => check.id === 'hardware'));
  assert.ok(readiness.blockers.some((check) => check.id === 'software'));
});
