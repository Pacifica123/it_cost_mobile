export type ResultRow = {
  year: number;
  cft: number;
  pv: number;
  npv: number;
};

export type NpvFormState = {
  investment: string;
  cashflows: string;
  rate: string;
};

export type NpvCalculationSuccess = {
  rows: ResultRow[];
  chartValues: number[];
};

export type NpvCalculationResult =
  | { ok: true; data: NpvCalculationSuccess }
  | { ok: false; error: string };
