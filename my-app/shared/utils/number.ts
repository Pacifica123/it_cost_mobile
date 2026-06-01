export const onlyDigits = (value: string) => String(value ?? '').replace(/\D+/g, '');

export const onlyDecimal = (value: string) => String(value ?? '').replace(/[^\d.,]+/g, '');

export const toNumberSafe = (value: string | number | null | undefined) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value ?? '').replace(',', '.').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatNumber = (value: string | number | null | undefined) => {
  const n = toNumberSafe(value);
  return new Intl.NumberFormat('ru-RU').format(n);
};
