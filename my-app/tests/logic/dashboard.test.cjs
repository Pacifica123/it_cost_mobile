const test = require('node:test');
const assert = require('node:assert/strict');

const { buildDashboardSummary } = require('../../.logic-test-dist/features/dashboard/logic/buildDashboard');
const { initialState } = require('../../.logic-test-dist/store/data/defaults');

test('dashboard summary builds metrics and top items for demo state', () => {
  const dashboard = buildDashboardSummary(initialState);

  assert.ok(dashboard.metrics.length >= 6);
  assert.ok(dashboard.topCapitalItems.length > 0);
  assert.ok(dashboard.insights.length > 0);
  assert.equal(dashboard.capitalTotal > 0, true);
  assert.equal(typeof dashboard.statusLabel, 'string');
});

test('dashboard flags budget overrun', () => {
  const dashboard = buildDashboardSummary({
    ...initialState,
    projectMeta: { ...initialState.projectMeta, budget: 100 },
  });

  assert.ok(dashboard.budgetRemainder < 0);
  assert.ok(dashboard.insights.some((insight) => insight.id === 'budget-overrun' && insight.tone === 'danger'));
});
