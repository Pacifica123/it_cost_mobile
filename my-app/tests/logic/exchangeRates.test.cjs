const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseCbrExchangeRatesXml,
  shouldRefreshExchangeRates,
} = require('../../.logic-test-dist/store/data/exchangeRates.js');

const fallback = {
  baseCurrency: 'RUB',
  rates: { USD: null, EUR: null },
  updatedAt: null,
  source: 'ЦБ РФ',
};

test('CBR XML parser reads USD and EUR nominal-adjusted rates', () => {
  const xml = `<?xml version="1.0"?><ValCurs>
    <Valute ID="R01235"><CharCode>USD</CharCode><Nominal>1</Nominal><Value>91,1234</Value></Valute>
    <Valute ID="R01239"><CharCode>EUR</CharCode><Nominal>1</Nominal><Value>99,5678</Value></Valute>
  </ValCurs>`;
  const parsed = parseCbrExchangeRatesXml(xml, fallback);
  assert.equal(parsed.rates.USD, 91.1234);
  assert.equal(parsed.rates.EUR, 99.5678);
  assert.equal(parsed.baseCurrency, 'RUB');
  assert.equal(parsed.source, 'ЦБ РФ');
});

test('exchange rate refresh age helper detects stale rates', () => {
  assert.equal(shouldRefreshExchangeRates({ ...fallback, updatedAt: null }), true);
  assert.equal(shouldRefreshExchangeRates({ ...fallback, updatedAt: new Date().toISOString() }), false);
});
