const test = require('node:test');
const assert = require('node:assert/strict');

const { initialState } = require('../../.logic-test-dist/store/data/defaults');
const { buildRisksSummary } = require('../../.logic-test-dist/features/risks/logic/buildRisks');
const { buildScenarioComparison } = require('../../.logic-test-dist/features/scenarios/logic/buildScenarios');

test('risks summary produces score and actionable recommendations', () => {
  const riskyState = {
    ...initialState,
    projectMeta: { ...initialState.projectMeta, budget: 1000 },
  };
  const summary = buildRisksSummary(riskyState);

  assert.ok(summary.score < 100);
  assert.ok(summary.risks.length > 0);
  assert.ok(summary.recommendations.every((item) => item.recommendation));
});

test('scenario comparison includes current project and templates', () => {
  const comparison = buildScenarioComparison(initialState);

  assert.ok(comparison.items.some((item) => item.id === 'current'));
  assert.ok(comparison.items.length >= 4);
  assert.ok(comparison.recommended);
});
