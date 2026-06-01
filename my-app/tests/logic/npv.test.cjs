const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateNpv, getFinalNpv, getPaybackPeriod, parseRate } = require('../../.logic-test-dist/features/npv/logic/npv.js');

test('parseRate supports percent strings and decimal strings', () => {
  assert.equal(parseRate('12'), 0.12);
  assert.equal(parseRate('0.12'), 0.12);
});

test('calculateNpv builds rows and positive final NPV for healthy cashflow', () => {
  const result = calculateNpv('1000', '450,450,450', '10');
  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.data.rows.length, 4);
  assert.equal(getPaybackPeriod(result.data.rows), 3);
  assert.ok((getFinalNpv(result.data.rows) ?? -1) > 0);
});

test('calculateNpv validates bad investment input', () => {
  const result = calculateNpv('0', '100,200', '10');
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.error, /инвестиции/i);
});
