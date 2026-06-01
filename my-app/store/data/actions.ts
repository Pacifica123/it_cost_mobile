import type { CapitalEquipment, DataState, ExpenseCategory, OperatingEquipment, ProjectMeta } from './types';

export type DataAction =
  | { type: 'HYDRATE_STATE'; payload: DataState }
  | { type: 'SET_PROJECT_META'; payload: Partial<ProjectMeta> }
  | { type: 'SET_CAPITAL_DATA'; payload: CapitalEquipment[] }
  | { type: 'SET_OPERATING_DATA'; payload: OperatingEquipment[] }
  | { type: 'SET_ELECTRICITY_TOTAL'; payload: number }
  | { type: 'ADD_CATEGORY'; payload: ExpenseCategory }
  | { type: 'DELETE_CATEGORY'; payload: { categoryId: string } }
  | { type: 'APPLY_PROJECT_TEMPLATE'; payload: DataState }
  | { type: 'CLEAR_PROJECT_EVENTS' }
  | { type: 'RESET_DEMO_DATA' }
  | { type: 'RESET_EMPTY_PROJECT' };
