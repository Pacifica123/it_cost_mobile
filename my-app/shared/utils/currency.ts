import { formatNumber, toNumberSafe } from './number';

export const formatRub = (value: string | number | null | undefined) => `${formatNumber(value)}\u00A0₽`;

export const formatCurrencyRU = (value: string | number | null | undefined) => {
  try {
    return `${new Intl.NumberFormat('ru-RU').format(toNumberSafe(value))} ₽`;
  } catch {
    return `${Math.round(toNumberSafe(value))
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽`;
  }
};

export const formatMoney = formatCurrencyRU;
