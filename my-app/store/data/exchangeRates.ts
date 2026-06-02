import type { ExchangeRates } from './types';

export type ExchangeRatesRefreshResult =
  | { ok: true; exchangeRates: ExchangeRates; message: string }
  | { ok: false; exchangeRates: ExchangeRates; message: string };

const CBR_DAILY_XML_URL = 'https://www.cbr.ru/scripts/XML_daily.asp';

const toRateNumber = (value: string) => {
  const normalized = value.replace(',', '.').replace(/\s+/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const readTag = (block: string, tagName: string) => {
  const match = block.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match?.[1]?.trim() ?? '';
};

export const parseCbrExchangeRatesXml = (xml: string, fallback: ExchangeRates): ExchangeRates => {
  const blocks = xml.match(/<Valute[\s\S]*?<\/Valute>/gi) ?? [];
  const rates: ExchangeRates['rates'] = {
    USD: fallback.rates.USD,
    EUR: fallback.rates.EUR,
  };

  blocks.forEach((block) => {
    const code = readTag(block, 'CharCode');
    if (code !== 'USD' && code !== 'EUR') return;

    const nominal = toRateNumber(readTag(block, 'Nominal')) ?? 1;
    const value = toRateNumber(readTag(block, 'Value'));
    if (!value || !nominal) return;

    rates[code] = value / nominal;
  });

  if (!rates.USD && !rates.EUR) {
    throw new Error('В ответе ЦБ РФ не найдены курсы USD/EUR.');
  }

  return {
    baseCurrency: 'RUB',
    rates,
    updatedAt: new Date().toISOString(),
    source: 'ЦБ РФ',
  };
};

export const fetchExchangeRatesFromCbr = async (fallback: ExchangeRates): Promise<ExchangeRates> => {
  const response = await fetch(CBR_DAILY_XML_URL);
  if (!response.ok) {
    throw new Error(`Не удалось загрузить курс валют: HTTP ${response.status}.`);
  }

  const xml = await response.text();
  return parseCbrExchangeRatesXml(xml, fallback);
};

export const shouldRefreshExchangeRates = (exchangeRates: ExchangeRates, maxAgeHours = 12) => {
  if (!exchangeRates.updatedAt) return true;
  const time = Date.parse(exchangeRates.updatedAt);
  if (!Number.isFinite(time)) return true;
  return Date.now() - time > maxAgeHours * 60 * 60 * 1000;
};

export const markExchangeRatesError = (exchangeRates: ExchangeRates, message: string): ExchangeRates => ({
  ...exchangeRates,
  source: exchangeRates.source || 'ЦБ РФ',
  updatedAt: new Date().toISOString(),
  error: message,
});
