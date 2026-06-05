import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

import { dataReducer } from './reducer';
import { initialState, makeProjectSnapshot } from './defaults';
import { loadStoredDataState, persistDataState } from './storage';
import { fetchExchangeRatesFromCbr, markExchangeRatesError, shouldRefreshExchangeRates, type ExchangeRatesRefreshResult } from './exchangeRates';
import { parseProjectDataState, serializeDataState, type ProjectImportResult } from './serialization';
import { configureMoneyFormat } from '../../shared/utils/currency';
import { configureAppPreferences } from '../../shared/utils/appPreferences';
import { createCategoryId } from './catalogRules';
import type {
  AppSettings,
  CapitalEquipment,
  CategoryMode,
  CategoryScope,
  DataState,
  ExpenseCategory,
  OperatingEquipment,
  ProjectMeta,
} from './types';

interface DataContextType extends DataState {
  isHydrated: boolean;
  lastSavedAt: Date | null;
  setProjectMeta: (patch: Partial<ProjectMeta>) => void;
  saveCurrentProject: (input?: { name?: string }) => void;
  openSavedProject: (projectId: string) => void;
  duplicateSavedProject: (projectId: string) => void;
  deleteSavedProject: (projectId: string) => void;
  setAppSettings: (patch: Partial<AppSettings>) => void;
  setCapitalData: Dispatch<SetStateAction<CapitalEquipment[]>>;
  setOperatingData: Dispatch<SetStateAction<OperatingEquipment[]>>;
  setElectricityTotal: Dispatch<SetStateAction<number>>;
  addCategory: (input: { name: string; scope: CategoryScope; mode?: CategoryMode }) => void;
  deleteCategory: (categoryId: string) => void;
  applyProjectTemplate: (state: DataState) => void;
  clearProjectEvents: () => void;
  createProjectBackup: (input?: { name?: string; description?: string }) => void;
  restoreProjectBackup: (backupId: string) => void;
  deleteProjectBackup: (backupId: string) => void;
  undoLastAction: () => void;
  redoLastAction: () => void;
  canUndo: boolean;
  canRedo: boolean;
  resetDemoData: () => void;
  resetEmptyProject: () => void;
  getProjectExportJson: () => string;
  importProjectJson: (raw: string) => ProjectImportResult;
  refreshExchangeRates: () => Promise<ExchangeRatesRefreshResult>;
  isRefreshingRates: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isRefreshingRates, setIsRefreshingRates] = useState(false);

  useEffect(() => {
    configureMoneyFormat(state.appSettings, state.exchangeRates);
  }, [state.appSettings, state.exchangeRates]);

  useEffect(() => {
    configureAppPreferences(state.appSettings);
  }, [state.appSettings]);

  useEffect(() => {
    let active = true;

    (async () => {
      const hydratedState = await loadStoredDataState();
      if (!active) return;
      dispatch({ type: 'HYDRATE_STATE', payload: hydratedState });
      setIsHydrated(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    let active = true;
    void persistDataState(state).then(() => {
      if (active) setLastSavedAt(new Date());
    });

    return () => {
      active = false;
    };
  }, [isHydrated, state]);

  const setProjectMeta = useCallback((patch: Partial<ProjectMeta>) => {
    dispatch({ type: 'SET_PROJECT_META', payload: patch });
  }, []);

  const saveCurrentProject = useCallback((input?: { name?: string }) => {
    dispatch({ type: 'SAVE_CURRENT_PROJECT', payload: input });
  }, []);

  const openSavedProject = useCallback((projectId: string) => {
    dispatch({ type: 'OPEN_SAVED_PROJECT', payload: { projectId } });
  }, []);

  const duplicateSavedProject = useCallback((projectId: string) => {
    dispatch({ type: 'DUPLICATE_SAVED_PROJECT', payload: { projectId } });
  }, []);

  const deleteSavedProject = useCallback((projectId: string) => {
    dispatch({ type: 'DELETE_SAVED_PROJECT', payload: { projectId } });
  }, []);

  const setAppSettings = useCallback((patch: Partial<AppSettings>) => {
    dispatch({ type: 'SET_APP_SETTINGS', payload: patch });
  }, []);

  const setCapitalData = useCallback<Dispatch<SetStateAction<CapitalEquipment[]>>>((next) => {
    const payload = typeof next === 'function' ? next(state.capitalData) : next;
    dispatch({ type: 'SET_CAPITAL_DATA', payload });
  }, [state.capitalData]);

  const setOperatingData = useCallback<Dispatch<SetStateAction<OperatingEquipment[]>>>((next) => {
    const payload = typeof next === 'function' ? next(state.operatingData) : next;
    dispatch({ type: 'SET_OPERATING_DATA', payload });
  }, [state.operatingData]);

  const setElectricityTotal = useCallback<Dispatch<SetStateAction<number>>>((next) => {
    const payload = typeof next === 'function' ? next(state.electricityTotal) : next;
    dispatch({ type: 'SET_ELECTRICITY_TOTAL', payload });
  }, [state.electricityTotal]);

  const addCategory = useCallback(({ name, scope, mode }: { name: string; scope: CategoryScope; mode?: CategoryMode }) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    dispatch({
      type: 'ADD_CATEGORY',
      payload: {
        id: createCategoryId(scope, trimmed),
        name: trimmed,
        scope,
        mode,
      },
    });
  }, []);

  const deleteCategory = useCallback((categoryId: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: { categoryId } });
  }, []);

  const applyProjectTemplate = useCallback((templateState: DataState) => {
    dispatch({ type: 'APPLY_PROJECT_TEMPLATE', payload: templateState });
  }, []);

  const clearProjectEvents = useCallback(() => {
    dispatch({ type: 'CLEAR_PROJECT_EVENTS' });
  }, []);

  const createProjectBackup = useCallback((input?: { name?: string; description?: string }) => {
    dispatch({ type: 'CREATE_PROJECT_BACKUP', payload: input });
  }, []);

  const restoreProjectBackup = useCallback((backupId: string) => {
    dispatch({ type: 'RESTORE_PROJECT_BACKUP', payload: { backupId } });
  }, []);

  const deleteProjectBackup = useCallback((backupId: string) => {
    dispatch({ type: 'DELETE_PROJECT_BACKUP', payload: { backupId } });
  }, []);

  const undoLastAction = useCallback(() => {
    dispatch({ type: 'UNDO_LAST_ACTION' });
  }, []);

  const redoLastAction = useCallback(() => {
    dispatch({ type: 'REDO_LAST_ACTION' });
  }, []);

  const resetDemoData = useCallback(() => {
    dispatch({ type: 'RESET_DEMO_DATA' });
  }, []);

  const resetEmptyProject = useCallback(() => {
    dispatch({ type: 'RESET_EMPTY_PROJECT' });
  }, []);

  const getProjectExportJson = useCallback(() => serializeDataState(state), [state]);

  const refreshExchangeRates = useCallback(async (): Promise<ExchangeRatesRefreshResult> => {
    setIsRefreshingRates(true);
    try {
      const exchangeRates = await fetchExchangeRatesFromCbr(state.exchangeRates);
      dispatch({ type: 'SET_EXCHANGE_RATES', payload: exchangeRates });
      return { ok: true, exchangeRates, message: 'Курсы валют обновлены.' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось обновить курсы валют.';
      const exchangeRates = markExchangeRatesError(state.exchangeRates, message);
      dispatch({ type: 'SET_EXCHANGE_RATES', payload: exchangeRates });
      return { ok: false, exchangeRates, message };
    } finally {
      setIsRefreshingRates(false);
    }
  }, [state.exchangeRates]);

  useEffect(() => {
    if (!isHydrated || isRefreshingRates) return;
    if (!state.appSettings.refreshRatesOnStart) return;
    if (!shouldRefreshExchangeRates(state.exchangeRates)) return;
    void refreshExchangeRates();
  }, [isHydrated, isRefreshingRates, refreshExchangeRates, state.appSettings.refreshRatesOnStart, state.exchangeRates]);

  const importProjectJson = useCallback((raw: string) => {
    const result = parseProjectDataState(raw);
    if (result.ok) {
      const backup = state.appSettings.autoBackupBeforeDangerousActions
        ? {
            id: `${Date.now().toString(36)}-backup-import-${Math.random().toString(36).slice(2, 8)}`,
            name: `Автобэкап — ${state.projectMeta.name || 'Проект'}`,
            createdAt: new Date().toISOString(),
            description: 'Создано автоматически перед импортом JSON-проекта.',
            capitalItemsCount: state.capitalData.length,
            operatingItemsCount: state.operatingData.length,
            snapshot: makeProjectSnapshot(state),
          }
        : null;
      dispatch({
        type: 'HYDRATE_STATE',
        payload: backup
          ? { ...result.state, projectBackups: [backup, ...(result.state.projectBackups ?? [])].slice(0, 12) }
          : result.state,
      });
    }
    return result;
  }, [state]);

  const value = useMemo<DataContextType>(() => ({
    ...state,
    isHydrated,
    lastSavedAt,
    setProjectMeta,
    saveCurrentProject,
    openSavedProject,
    duplicateSavedProject,
    deleteSavedProject,
    setAppSettings,
    setCapitalData,
    setOperatingData,
    setElectricityTotal,
    addCategory,
    deleteCategory,
    applyProjectTemplate,
    clearProjectEvents,
    createProjectBackup,
    restoreProjectBackup,
    deleteProjectBackup,
    undoLastAction,
    redoLastAction,
    canUndo: state.undoStack.length > 0,
    canRedo: state.redoStack.length > 0,
    resetDemoData,
    resetEmptyProject,
    getProjectExportJson,
    importProjectJson,
    refreshExchangeRates,
    isRefreshingRates,
  }), [
    state,
    isHydrated,
    lastSavedAt,
    setProjectMeta,
    saveCurrentProject,
    openSavedProject,
    duplicateSavedProject,
    deleteSavedProject,
    setAppSettings,
    setCapitalData,
    setOperatingData,
    setElectricityTotal,
    addCategory,
    deleteCategory,
    applyProjectTemplate,
    clearProjectEvents,
    createProjectBackup,
    restoreProjectBackup,
    deleteProjectBackup,
    undoLastAction,
    redoLastAction,
    state.undoStack.length,
    state.redoStack.length,
    resetDemoData,
    resetEmptyProject,
    getProjectExportJson,
    importProjectJson,
    refreshExchangeRates,
    isRefreshingRates,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export type { AppSettings, CapitalEquipment, CategoryMode, CategoryScope, DataState, ExpenseCategory, OperatingEquipment, ProjectMeta, ProjectBackup, StoredProjectRecord, ProjectSnapshot } from './types';
export * from './selectors';
