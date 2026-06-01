const test = require('node:test');
const assert = require('node:assert/strict');
const { buildReport } = require('../../.logic-test-dist/features/report/logic/buildReport.js');

test('buildReport normalizes monthly recurring expenses to annual totals', () => {
  const report = buildReport({
    capitalData: [
      { id: '1', categoryId: 'cap', name: 'Server', quantity: 2, price: 1000, kind: 'hardware' },
    ],
    operatingData: [
      { id: '2', categoryId: 'one', name: 'Migration', price: 500 },
      { id: '3', categoryId: 'per', name: 'Subscription', price: 100 },
    ],
    categories: [
      { id: 'cap', name: 'Cap', scope: 'capital' },
      { id: 'one', name: 'One', scope: 'operating', mode: 'oneTime' },
      { id: 'per', name: 'Per', scope: 'operating', mode: 'periodic' },
    ],
    electricityTotal: 50,
  });

  assert.equal(report.capitalTotal, 2000);
  assert.equal(report.oneTimeOperatingTotal, 500);
  assert.equal(report.periodicTotalMonthly, 100);
  assert.equal(report.periodicTotalAnnual, 1200);
  assert.equal(report.electricityTotalAnnual, 600);
  assert.equal(report.grandTotalAnnual, 4300);
});

test('buildReport returns quality insights for incomplete project data', () => {
  const report = buildReport({
    capitalData: [],
    operatingData: [],
    categories: [],
    electricityTotal: 0,
  });

  assert.ok(report.insights.some((insight) => insight.id === 'capex-empty' && insight.tone === 'warning'));
  assert.ok(report.insights.some((insight) => insight.id === 'opex-empty' && insight.tone === 'warning'));
  assert.match(report.summaryText, /черновой/);
});
