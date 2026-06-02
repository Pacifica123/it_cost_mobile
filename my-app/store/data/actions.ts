import type { AppSettings, CapitalEquipment, DataState, ExchangeRates, ExpenseCategory, OperatingEquipment, ProjectMeta } from './types';

export type DataAction =
  | { type: 'HYDRATE_STATE'; payload: DataState }
  | { type: 'SET_PROJECT_META'; payload: Partial<ProjectMeta> }
  | { type: 'SET_APP_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_EXCHANGE_RATES'; payload: ExchangeRates }
  | { type: 'SAVE_CURRENT_PROJECT'; payload?: { name?: string } }
  | { type: 'OPEN_SAVED_PROJECT'; payload: { projectId: string } }
  | { type: 'DUPLICATE_SAVED_PROJECT'; payload: { projectId: string } }
  | { type: 'DELETE_SAVED_PROJECT'; payload: { projectId: string } }
  | { type: 'SET_CAPITAL_DATA'; payload: CapitalEquipment[] }
  | { type: 'SET_OPERATING_DATA'; payload: OperatingEquipment[] }
  | { type: 'SET_ELECTRICITY_TOTAL'; payload: number }
  | { type: 'ADD_CATEGORY'; payload: ExpenseCategory }
  | { type: 'DELETE_CATEGORY'; payload: { categoryId: string } }
  | { type: 'APPLY_PROJECT_TEMPLATE'; payload: DataState }
  | { type: 'CREATE_PROJECT_BACKUP'; payload?: { name?: string; description?: string } }
  | { type: 'RESTORE_PROJECT_BACKUP'; payload: { backupId: string } }
  | { type: 'DELETE_PROJECT_BACKUP'; payload: { backupId: string } }
  | { type: 'UNDO_LAST_ACTION' }
  | { type: 'REDO_LAST_ACTION' }
  | { type: 'CLEAR_PROJECT_EVENTS' }
  | { type: 'RESET_DEMO_DATA' }
  | { type: 'RESET_EMPTY_PROJECT' };
