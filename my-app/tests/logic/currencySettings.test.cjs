const test = require('node:test');
const assert = require('node:assert/strict');
const {
  configureMoneyFormat,
  formatCurrencyRU,
  formatRub,
  formatExchangeRate,
  convertRubToCurrency,
} = require('../../.logic-test-dist/shared/utils/currency.js');

const rates = {
  rates: { USD: 100, EUR: 125 },
  updatedAt: '2026-01-01T00:00:00.000Z',
  source: 'test',
};

test('currency formatter converts RUB values when exchange rates are loaded', () => {
  configureMoneyFormat({ currency: 'USD', roundingMode: 'rubles' }, rates);
  assert.equal(formatCurrencyRU(125000), '1 250 $');

  configureMoneyFormat({ currency: 'EUR', roundingMode: 'thousands' }, rates);
  assert.equal(formatRub(125000), '1 тыс. €');

  configureMoneyFormat({ currency: 'RUB', roundingMode: 'rubles' }, rates);
  assert.equal(formatCurrencyRU(125000), '125 000 ₽');
});

test('currency formatter falls back to symbol-only display without a loaded rate', () => {
  configureMoneyFormat({ currency: 'USD', roundingMode: 'rubles' }, { rates: { USD: null, EUR: null } });
  assert.equal(formatCurrencyRU(125000), '125 000 $');
});

test('exchange rate helpers expose conversion and rate labels', () => {
  assert.equal(convertRubToCurrency(1000, 'USD', rates), 10);
  assert.equal(formatExchangeRate('USD', rates), '1 $ = 100,00 ₽');
});
