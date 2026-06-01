import type { CapitalEquipment, ExpenseCategory, ItemKind } from '../../store/data/types';

export type OptimizationScope = 'all' | 'technical' | 'software';

export type OptimizationWeights = {
  cost: number;
  categoryCoverage: number;
  clientSeats: number;
  itemCount: number;
};

export type OptimizationParams = {
  maxBudget: number;
  targetClientSeats: number;
  requiredCategoryIds: string[];
  weights: OptimizationWeights;
  popSize?: number;
  generations?: number;
  mutationRate?: number;
  elite?: number;
  seed?: number;
  topSolutionsLimit?: number;
};

export type OptimizationInput = {
  capitalData: CapitalEquipment[];
  categories: ExpenseCategory[];
  scope: OptimizationScope;
  params: OptimizationParams;
};

export type OptimizationCandidateItem = CapitalEquipment & {
  totalCost: number;
  categoryName: string;
  clientSeats: number;
  kind: ItemKind;
};

export type OptimizationCriteriaValues = {
  costUtility: number;
  categoryCoverage: number;
  clientSeats: number;
  itemCount: number;
};

export type OptimizationSolution = {
  rank: number;
  mask: number[];
  selectedItems: OptimizationCandidateItem[];
  totalCost: number;
  categoryCoverage: number;
  selectedCategoryIds: string[];
  clientSeats: number;
  criteria: OptimizationCriteriaValues;
  score: number;
  ahpScore?: number;
  hybridScore?: number;
};

export type OptimizationHistoryPoint = {
  generation: number;
  bestScore: number;
  feasibleCount: number;
};

export type OptimizationReport = {
  status: 'ok' | 'empty' | 'no_feasible';
  scope: OptimizationScope;
  candidateCount: number;
  feasibleInitialCount: number;
  generationsRan: number;
  terminationReason: 'max_generations' | 'no_feasible_solution';
  weights: OptimizationWeights;
  requiredCategoryIds: string[];
  categoriesAvailable: string[];
  best?: OptimizationSolution;
  topSolutions: OptimizationSolution[];
  ahpRanking: OptimizationSolution[];
  history: OptimizationHistoryPoint[];
  warning?: string;
};
