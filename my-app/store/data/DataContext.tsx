import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

import { dataReducer } from './reducer';
import { initialState } from './defaults';
import { loadStoredDataState, persistDataState } from './storage';
import { parseProjectDataState, serializeDataState, type ProjectImportResult } from './serialization';
import { createCategoryId } from './catalogRules';
import type {
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
  setCapitalData: Dispatch<SetStateAction<CapitalEquipment[]>>;
  setOperatingData: Dispatch<SetStateAction<OperatingEquipment[]>>;
  setElectricityTotal: Dispatch<SetStateAction<number>>;
  addCategory: (input: { name: string; scope: CategoryScope; mode?: CategoryMode }) => void;
  deleteCategory: (categoryId: string) => void;
  applyProjectTemplate: (state: DataState) => void;
  clearProjectEvents: () => void;
  resetDemoData: () => void;
  resetEmptyProject: () => void;
  getProjectExportJson: () => string;
  importProjectJson: (raw: string) => ProjectImportResult;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

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

  const resetDemoData = useCallback(() => {
    dispatch({ type: 'RESET_DEMO_DATA' });
  }, []);

  const resetEmptyProject = useCallback(() => {
    dispatch({ type: 'RESET_EMPTY_PROJECT' });
  }, []);

  const getProjectExportJson = useCallback(() => serializeDataState(state), [state]);

  const importProjectJson = useCallback((raw: string) => {
    const result = parseProjectDataState(raw);
    if (result.ok) {
      dispatch({ type: 'HYDRATE_STATE', payload: result.state });
    }
    return result;
  }, []);

  const value = useMemo<DataContextType>(() => ({
    ...state,
    isHydrated,
    lastSavedAt,
    setProjectMeta,
    setCapitalData,
    setOperatingData,
    setElectricityTotal,
    addCategory,
    deleteCategory,
    applyProjectTemplate,
    clearProjectEvents,
    resetDemoData,
    resetEmptyProject,
    getProjectExportJson,
    importProjectJson,
  }), [
    state,
    isHydrated,
    lastSavedAt,
    setProjectMeta,
    setCapitalData,
    setOperatingData,
    setElectricityTotal,
    addCategory,
    deleteCategory,
    applyProjectTemplate,
    clearProjectEvents,
    resetDemoData,
    resetEmptyProject,
    getProjectExportJson,
    importProjectJson,
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

export type { CapitalEquipment, CategoryMode, CategoryScope, DataState, ExpenseCategory, OperatingEquipment, ProjectMeta } from './types';
export * from './selectors';
