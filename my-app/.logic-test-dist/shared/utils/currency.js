"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrencyPreview = exports.formatMoney = exports.formatCurrencyRU = exports.formatRub = exports.formatExchangeRate = exports.formatCurrency = exports.convertRubToCurrency = exports.getCurrencyRate = exports.getCurrencySymbol = exports.getMoneyFormatSettings = exports.configureMoneyFormat = void 0;
const number_1 = require("./number");
const currencySymbols = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
};
let activeMoneySettings = {
    currency: 'RUB',
    roundingMode: 'rubles',
};
let activeExchangeRates = {
    rates: {
        USD: null,
        EUR: null,
    },
    updatedAt: null,
    source: 'ЦБ РФ',
};
const configureMoneyFormat = (settings, exchangeRates) => {
    activeMoneySettings = {
        currency: settings?.currency ?? activeMoneySettings.currency,
        roundingMode: settings?.roundingMode ?? activeMoneySettings.roundingMode,
    };
    if (exchangeRates) {
        activeExchangeRates = exchangeRates;
    }
};
exports.configureMoneyFormat = configureMoneyFormat;
const getMoneyFormatSettings = () => ({
    ...activeMoneySettings,
    exchangeRates: activeExchangeRates,
});
exports.getMoneyFormatSettings = getMoneyFormatSettings;
const getCurrencySymbol = (currency = activeMoneySettings.currency) => currencySymbols[currency] ?? '₽';
exports.getCurrencySymbol = getCurrencySymbol;
const getCurrencyRate = (currency, exchangeRates = activeExchangeRates) => {
    if (currency === 'RUB')
        return 1;
    const rate = exchangeRates.rates?.[currency];
    return Number.isFinite(rate) && Number(rate) > 0 ? Number(rate) : null;
};
exports.getCurrencyRate = getCurrencyRate;
const convertRubToCurrency = (value, currency = activeMoneySettings.currency, exchangeRates = activeExchangeRates) => {
    const rubValue = (0, number_1.toNumberSafe)(value);
    const rate = (0, exports.getCurrencyRate)(currency, exchangeRates);
    if (!rate)
        return rubValue;
    return rubValue / rate;
};
exports.convertRubToCurrency = convertRubToCurrency;
function formatPlainNumber(value, fractionDigits) {
    try {
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        }).format(value);
    }
    catch {
        return value.toFixed(fractionDigits).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
}
const formatCurrency = (value, settings, exchangeRates) => {
    const currency = settings?.currency ?? activeMoneySettings.currency;
    const roundingMode = settings?.roundingMode ?? activeMoneySettings.roundingMode;
    const rates = exchangeRates ?? activeExchangeRates;
    const symbol = (0, exports.getCurrencySymbol)(currency);
    const numericValue = (0, exports.convertRubToCurrency)(value, currency, rates);
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
exports.formatCurrency = formatCurrency;
const formatExchangeRate = (currency, exchangeRates = activeExchangeRates) => {
    const rate = (0, exports.getCurrencyRate)(currency, exchangeRates);
    const symbol = (0, exports.getCurrencySymbol)(currency);
    if (!rate)
        return `1 ${symbol} = курс не загружен`;
    return `1 ${symbol} = ${formatPlainNumber(rate, 2)}\u00A0₽`;
};
exports.formatExchangeRate = formatExchangeRate;
// Backward-compatible names. Values are stored in RUB, and display is converted to the selected app currency when a rate is loaded.
exports.formatRub = exports.formatCurrency;
exports.formatCurrencyRU = exports.formatCurrency;
exports.formatMoney = exports.formatCurrency;
const formatCurrencyPreview = (settings, exchangeRates) => (0, exports.formatCurrency)(125000, settings, exchangeRates);
exports.formatCurrencyPreview = formatCurrencyPreview;
