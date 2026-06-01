export type RelationOperator = '>' | '=';

export type ImportanceCriterion = {
  id: string;
  name: string;
};

export type ImportanceAlternative = {
  id: string;
  name: string;
};

export type ImportanceRelation = {
  left: string;
  op: RelationOperator;
  factor: number;
  right: string;
};

export type ImportanceCase = {
  name: string;
  criteria: ImportanceCriterion[];
  alternatives: ImportanceAlternative[];
  scores: Record<string, Record<string, number>>;
  relations: ImportanceRelation[];
};

export type ImportanceRankingRow = {
  id: string;
  name: string;
  weightedSum: number;
  nondominated: boolean;
};

export type ImportanceReport = {
  caseName: string;
  rawVectors: Record<string, number[]>;
  rawDominance: Record<string, Record<string, string>>;
  rawNondominated: string[];
  analysisModel: {
    groups: Record<string, string[]>;
    edges: Array<{ leftGroup: string; rightGroup: string; factor: number }>;
    groupMultiplicity: Record<string, number>;
    criterionMultiplicity: Record<string, number>;
    criterionOrder: string[];
  };
  expandedVectors: Record<string, number[]>;
  finalDominance: Record<string, Record<string, string>>;
  finalNondominated: string[];
  weightedSum: Record<string, number>;
  ranking: ImportanceRankingRow[];
  winnerId: string;
  winnerName: string;
  explanation: string;
};
