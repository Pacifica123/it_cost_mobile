import type { NpvCalculationResult, ResultRow } from '../types';

export function toNumber(value: string) {
  return Number(value.trim().replace(',', '.'));
}

export function parseRate(value: string) {
  const number = toNumber(value);
  if (Number.isNaN(number)) {
    return null;
  }

  return number > 1 ? number / 100 : number;
}

export function parseCashflows(value: string) {
  return value
    .split(',')
    .map((item) => toNumber(item))
    .filter((item) => !Number.isNaN(item));
}

export function formatNpvNumber(value: number) {
  return value.toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function calculateNpv(investmentInput: string, cashflowsInput: string, rateInput: string): NpvCalculationResult {
  const investment = toNumber(investmentInput);
  const rate = parseRate(rateInput);
  const cashflows = parseCashflows(cashflowsInput);

  if (Number.isNaN(investment) || investment <= 0) {
    return { ok: false, error: 'Введите корректные начальные инвестиции' };
  }

  if (rate === null || rate < 0) {
    return { ok: false, error: 'Введите корректную ставку дисконтирования' };
  }

  if (!cashflows.length) {
    return { ok: false, error: 'Введите денежные потоки через запятую' };
  }

  let cumulative = -investment;
  const rows: ResultRow[] = [
    {
      year: 0,
      cft: -investment,
      pv: -investment,
      npv: Number(cumulative.toFixed(2)),
    },
  ];
  const chartValues = [Number(cumulative.toFixed(2))];

  cashflows.forEach((cashflow, index) => {
    const year = index + 1;
    const pv = cashflow / Math.pow(1 + rate, year);
    cumulative += pv;

    rows.push({
      year,
      cft: cashflow,
      pv: Number(pv.toFixed(2)),
      npv: Number(cumulative.toFixed(2)),
    });

    chartValues.push(Number(cumulative.toFixed(2)));
  });

  return { ok: true, data: { rows, chartValues } };
}

export function getFinalNpv(rows: ResultRow[]) {
  return rows.length ? rows[rows.length - 1].npv : null;
}

export function getPaybackPeriod(rows: ResultRow[]) {
  const found = rows.find((row) => row.npv >= 0);
  return found ? found.year : null;
}
