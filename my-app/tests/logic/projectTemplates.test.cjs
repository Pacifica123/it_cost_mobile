const test = require('node:test');
const assert = require('node:assert/strict');

const { projectTemplates } = require('../../.logic-test-dist/features/project/logic/templates');
const { buildReport } = require('../../.logic-test-dist/features/report/logic/buildReport');
const { buildReportHtml } = require('../../.logic-test-dist/features/report/logic/buildReportHtml');
const { buildProjectReadiness } = require('../../.logic-test-dist/features/project/logic/readiness');

test('project templates contain ready states with metadata', () => {
  assert.ok(projectTemplates.length >= 3);
  for (const template of projectTemplates) {
    assert.ok(template.state.projectMeta.name);
    assert.ok(template.state.projectMeta.budget >= 0);
    assert.ok(template.state.capitalData.length > 0);
  }
});

test('html report includes project metadata and totals', () => {
  const template = projectTemplates[0];
  const report = buildReport(template.state);
  const readiness = buildProjectReadiness(template.state);
  const html = buildReportHtml(report, readiness, template.state.projectMeta);

  assert.match(html, /<!doctype html>/i);
  assert.match(html, new RegExp(template.state.projectMeta.name));
  assert.match(html, /Итоговые показатели/);
});
