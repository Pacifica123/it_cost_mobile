import { toNumberSafe } from './number';

export type CurrencyCode = 'RUB' | 'USD' | 'EUR';
export type RoundingMode = 'none' | 'rubles' | 'thousands';

export type CurrencyExchangeRates = {
  rates?: {
    USD?: number | null;
    EUR?: number | null;
  };
  updatedAt?: string | null;
  source?: string;
};

export type MoneyFormatSettings = {
  currency?: CurrencyCode;
  roundingMode?: RoundingMode;
};

const currencySymbols: Record<CurrencyCode, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
};

let activeMoneySettings: Required<MoneyFormatSettings> = {
  currency: 'RUB',
  roundingMode: 'rubles',
};

let activeExchangeRates: CurrencyExchangeRates = {
  rates: {
    USD: null,
    EUR: null,
  },
  updatedAt: null,
  source: 'ЦБ РФ',
};

export const configureMoneyFormat = (
  settings?: MoneyFormatSettings | null,
  exchangeRates?: CurrencyExchangeRates | null
) => {
  activeMoneySettings = {
    currency: settings?.currency ?? activeMoneySettings.currency,
    roundingMode: settings?.roundingMode ?? activeMoneySettings.roundingMode,
  };

  if (exchangeRates) {
    activeExchangeRates = exchangeRates;
  }
};

export const getMoneyFormatSettings = () => ({
  ...activeMoneySettings,
  exchangeRates: activeExchangeRates,
});

export const getCurrencySymbol = (currency: CurrencyCode = activeMoneySettings.currency) => currencySymbols[currency] ?? '₽';

export const getCurrencyRate = (currency: CurrencyCode, exchangeRates: CurrencyExchangeRates = activeExchangeRates) => {
  if (currency === 'RUB') return 1;
  const rate = exchangeRates.rates?.[currency];
  return Number.isFinite(rate) && Number(rate) > 0 ? Number(rate) : null;
};

export const convertRubToCurrency = (
  value: string | number | null | undefined,
  currency: CurrencyCode = activeMoneySettings.currency,
  exchangeRates: CurrencyExchangeRates = activeExchangeRates
) => {
  const rubValue = toNumberSafe(value);
  const rate = getCurrencyRate(currency, exchangeRates);
  if (!rate) return rubValue;
  return rubValue / rate;
};

function formatPlainNumber(value: number, fractionDigits: number) {
  try {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    return value.toFixed(fractionDigits).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
}

export const formatCurrency = (
  value: string | number | null | undefined,
  settings?: MoneyFormatSettings | null,
  exchangeRates?: CurrencyExchangeRates | null
) => {
  const currency = settings?.currency ?? activeMoneySettings.currency;
  const roundingMode = settings?.roundingMode ?? activeMoneySettings.roundingMode;
  const rates = exchangeRates ?? activeExchangeRates;
  const symbol = getCurrencySymbol(currency);
  const numericValue = convertRubToCurrency(value, currency, rates);

  if (roundingMode === 'thousands') {
    const roundedThousands = Math.round(numericValue / 1000);
    return `${formatPlainNumber(roundedThousands, 0)}\u00A0тыс.\u00A0${symbol}`;
  }

  if (roundingMode === 'rubles') {
    return `${formatPlainNumber(Math.round(numericValue), 0)}\u00A0${symbol}`;
  }

  const fractionDigits = Number.isInteger(numericValue) ? 0 : 2;
  return `${formatPlainNumber(numericValue, fractionDigits)}\u00A0${symbol}`;
};

export const formatExchangeRate = (
  currency: Exclude<CurrencyCode, 'RUB'>,
  exchangeRates: CurrencyExchangeRates = activeExchangeRates
) => {
  const rate = getCurrencyRate(currency, exchangeRates);
  const symbol = getCurrencySymbol(currency);
  if (!rate) return `1 ${symbol} = курс не загружен`;
  return `1 ${symbol} = ${formatPlainNumber(rate, 2)}\u00A0₽`;
};

// Backward-compatible names. Values are stored in RUB, and display is converted to the selected app currency when a rate is loaded.
export const formatRub = formatCurrency;
export const formatCurrencyRU = formatCurrency;
export const formatMoney = formatCurrency;

export const formatCurrencyPreview = (
  settings: MoneyFormatSettings,
  exchangeRates?: CurrencyExchangeRates | null
) => formatCurrency(125000, settings, exchangeRates);
