export type ReliabilityRange = {
  low: number;
  high: number;
};

export type Device = {
  role: string;
  vendor?: string;
  cpu_score: number;
  ram_score: number;
  energy: number;
  cost: number;
  reliability?: ReliabilityRange;
};

export type Configuration = {
  id: string;
  meta?: {
    people?: number;
  };
  devices: Device[];
};

export type Constraints = {
  max_budget: number;
  max_energy: number;
  people_match_tolerance?: number;
};

export type AHPInput = {
  configurations: Configuration[];
  softCriteria: string[];
  experts: number[][][];
  constraints: Constraints;
};

export type AHPReport = {
  total_input: number;
  passed_count: number;
  warning?: string;
  criteria: {
    names: string[];
    weights: number[];
    CR: number;
  };
  final: {
    ranking: [string, number][];
  };
};
