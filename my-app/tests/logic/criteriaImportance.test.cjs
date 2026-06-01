const test = require('node:test');
const assert = require('node:assert/strict');
const { defaultBudgetingCase } = require('../../.logic-test-dist/features/criteriaImportance/logic/defaultCase.js');
const { runImportancePipeline, dominanceRelation } = require('../../.logic-test-dist/features/criteriaImportance/logic/pipeline.js');

test('dominanceRelation detects dominance and incomparability', () => {
  assert.equal(dominanceRelation([2, 2], [1, 2]), 'dominates');
  assert.equal(dominanceRelation([1, 2], [2, 1]), 'incomparable');
});

test('runImportancePipeline returns expected demo winner', () => {
  const report = runImportancePipeline(defaultBudgetingCase);

  assert.equal(report.winnerId, 'system2');
  assert.equal(report.ranking[0].name, 'Система 2');
  assert.ok(report.analysisModel.criterionMultiplicity['4.1'] >= report.analysisModel.criterionMultiplicity['7']);
});
