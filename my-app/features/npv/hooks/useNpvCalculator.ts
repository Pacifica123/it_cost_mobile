import { useMemo, useState } from 'react';

import { calculateNpv, getFinalNpv, getPaybackPeriod } from '../logic/npv';
import type { NpvFormState, ResultRow } from '../types';

const initialForm: NpvFormState = {
  investment: '1000',
  cashflows: '10,20,30,40,100,500,1000',
  rate: '10',
};

export function useNpvCalculator() {
  const [form, setForm] = useState<NpvFormState>(initialForm);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [chartValues, setChartValues] = useState<number[]>([]);
  const [error, setError] = useState('');

  const finalNpv = useMemo(() => getFinalNpv(results), [results]);
  const paybackPeriod = useMemo(() => getPaybackPeriod(results), [results]);

  const calculate = () => {
    setError('');

    const result = calculateNpv(form.investment, form.cashflows, form.rate);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setResults(result.data.rows);
    setChartValues(result.data.chartValues);
  };

  const reset = () => {
    setForm(initialForm);
    setResults([]);
    setChartValues([]);
    setError('');
  };

  return {
    form,
    results,
    chartValues,
    error,
    finalNpv,
    paybackPeriod,
    setForm,
    calculate,
    reset,
  };
}
