import type { DataAction } from './actions';
import { CURRENT_DATA_SCHEMA_VERSION, createProjectEvent, emptyProjectState, initialState, makeProjectSnapshot } from './defaults';
import type { DataState, ProjectBackup, ProjectEvent, ProjectEventType, ProjectSnapshot } from './types';
import { ensureCapitalKinds, ensureUniqueCategories } from './catalogRules';

export { initialState } from './defaults';

const nowIso = () => new Date().toISOString();
const MAX_EVENTS = 80;
const MAX_UNDO = 25;
const MAX_BACKUPS = 12;

const withMetaUpdate = (state: DataState): DataState => ({
  ...state,
  schemaVersion: CURRENT_DATA_SCHEMA_VERSION,
  projectMeta: {
    ...state.projectMeta,
    updatedAt: nowIso(),
  },
});

const withEvent = (
  state: DataState,
  title: string,
  description = '',
  type: ProjectEventType = 'data'
): DataState => {
  const event: ProjectEvent = {
    ...createProjectEvent(title, description, type, nowIso()),
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  };

  return {
    ...withMetaUpdate(state),
    projectEvents: [event, ...(state.projectEvents ?? [])].slice(0, MAX_EVENTS),
  };
};

const snapshotEquals = (a: ProjectSnapshot, b: ProjectSnapshot) => JSON.stringify(a) === JSON.stringify(b);

const withUndoPoint = (state: DataState): DataState => {
  const current = makeProjectSnapshot(state);
  const last = state.undoStack[0];
  if (last && snapshotEquals(last, current)) return { ...state, redoStack: [] };
  return {
    ...state,
    undoStack: [current, ...(state.undoStack ?? [])].slice(0, MAX_UNDO),
    redoStack: [],
  };
};

const applySnapshot = (state: DataState, snapshot: ProjectSnapshot): DataState => ({
  ...state,
  schemaVersion: CURRENT_DATA_SCHEMA_VERSION,
  projectMeta: snapshot.projectMeta,
  appSettings: snapshot.appSettings,
  capitalData: ensureCapitalKinds(snapshot.capitalData, snapshot.categories),
  operatingData: snapshot.operatingData,
  categories: ensureUniqueCategories(snapshot.categories, snapshot.capitalData, snapshot.operatingData),
  electricityTotal: snapshot.electricityTotal,
});

const resetRuntimeStacks = (state: DataState): DataState => ({
  ...state,
  schemaVersion: CURRENT_DATA_SCHEMA_VERSION,
  undoStack: [],
  redoStack: [],
});

const buildBackup = (state: DataState, input?: { name?: string; description?: string }): ProjectBackup => {
  const createdAt = nowIso();
  return {
    id: `${Date.now().toString(36)}-backup-${Math.random().toString(36).slice(2, 8)}`,
    name: input?.name?.trim() || `${state.projectMeta.name || 'Проект'} — ${new Date(createdAt).toLocaleString('ru-RU')}`,
    description: input?.description?.trim() || 'Резервная копия текущего состояния проекта.',
    createdAt,
    capitalItemsCount: state.capitalData.length,
    operatingItemsCount: state.operatingData.length,
    snapshot: makeProjectSnapshot(state),
  };
};

export function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'HYDRATE_STATE':
      return resetRuntimeStacks(action.payload);
    case 'UNDO_LAST_ACTION': {
      const [previous, ...restUndo] = state.undoStack ?? [];
      if (!previous) return state;
      const current = makeProjectSnapshot(state);
      const restored = applySnapshot(
        {
          ...state,
          undoStack: restUndo,
          redoStack: [current, ...(state.redoStack ?? [])].slice(0, MAX_UNDO),
        },
        previous
      );
      return withEvent(restored, 'Отменено последнее действие', 'Восстановлено предыдущее состояние проекта.', 'history');
    }
    case 'REDO_LAST_ACTION': {
      const [next, ...restRedo] = state.redoStack ?? [];
      if (!next) return state;
      const current = makeProjectSnapshot(state);
      const restored = applySnapshot(
        {
          ...state,
          undoStack: [current, ...(state.undoStack ?? [])].slice(0, MAX_UNDO),
          redoStack: restRedo,
        },
        next
      );
      return withEvent(restored, 'Повторено отменённое действие', 'Восстановлено состояние после отмены.', 'history');
    }
    case 'CREATE_PROJECT_BACKUP': {
      const backup = buildBackup(state, action.payload);
      return withEvent(
        {
          ...state,
          projectBackups: [backup, ...(state.projectBackups ?? [])].slice(0, MAX_BACKUPS),
        },
        'Создана резервная копия',
        backup.name,
        'backup'
      );
    }
    case 'RESTORE_PROJECT_BACKUP': {
      const backup = state.projectBackups.find((item) => item.id === action.payload.backupId);
      if (!backup) return state;
      const restored = applySnapshot(withUndoPoint(state), backup.snapshot);
      return withEvent(restored, 'Восстановлена резервная копия', backup.name, 'backup');
    }
    case 'DELETE_PROJECT_BACKUP': {
      const backup = state.projectBackups.find((item) => item.id === action.payload.backupId);
      if (!backup) return state;
      return withEvent(
        {
          ...state,
          projectBackups: state.projectBackups.filter((item) => item.id !== backup.id),
        },
        'Удалена резервная копия',
        backup.name,
        'backup'
      );
    }
    case 'APPLY_PROJECT_TEMPLATE': {
      const undoState = withUndoPoint(state);
      const nextTemplate: DataState = {
        ...action.payload,
        schemaVersion: CURRENT_DATA_SCHEMA_VERSION,
        appSettings: state.appSettings,
        exchangeRates: state.exchangeRates,
        projectBackups: state.projectBackups,
        undoStack: undoState.undoStack,
        redoStack: [],
      };
      return withEvent(nextTemplate, 'Применён шаблон проекта', action.payload.projectMeta.name, 'template');
    }
    case 'RESET_DEMO_DATA': {
      const undoState = withUndoPoint(state);
      return withEvent(
        {
          ...initialState,
          appSettings: state.appSettings,
          exchangeRates: state.exchangeRates,
          projectBackups: state.projectBackups,
          undoStack: undoState.undoStack,
          redoStack: [],
        },
        'Загружены демо-данные',
        'Текущий проект заменён демонстрационным набором.',
        'template'
      );
    }
    case 'RESET_EMPTY_PROJECT': {
      const undoState = withUndoPoint(state);
      return withEvent(
        {
          ...emptyProjectState,
          appSettings: state.appSettings,
          exchangeRates: state.exchangeRates,
          projectBackups: state.projectBackups,
          undoStack: undoState.undoStack,
          redoStack: [],
        },
        'Проект очищен',
        'Позиции и расчёты очищены, базовые категории сохранены.',
        'reset'
      );
    }
    case 'CLEAR_PROJECT_EVENTS':
      return {
        ...withMetaUpdate(withUndoPoint(state)),
        projectEvents: [
          {
            id: `${Date.now().toString(36)}-history-clear`,
            type: 'project',
            title: 'История очищена',
            description: 'Журнал действий начат заново.',
            createdAt: nowIso(),
          },
        ],
      };
    case 'SET_APP_SETTINGS': {
      const nextState = {
        ...withUndoPoint(state),
        appSettings: {
          ...state.appSettings,
          ...action.payload,
        },
      };
      return withEvent(nextState, 'Обновлены настройки', 'Изменены параметры интерфейса или поведения приложения.', 'project');
    }
    case 'SET_EXCHANGE_RATES':
      return {
        ...withMetaUpdate(state),
        exchangeRates: action.payload,
      };
    case 'SET_PROJECT_META': {
      const nextState = {
        ...withUndoPoint(state),
        projectMeta: {
          ...state.projectMeta,
          ...action.payload,
          updatedAt: nowIso(),
        },
      };
      return withEvent(nextState, 'Обновлён паспорт проекта', 'Изменены название, бюджет, клиентские места или описание.', 'project');
    }
    case 'SET_CAPITAL_DATA': {
      const capitalData = ensureCapitalKinds(action.payload, state.categories);
      return withEvent(
        {
          ...withUndoPoint(state),
          capitalData,
          categories: ensureUniqueCategories(state.categories, capitalData, state.operatingData),
        },
        'Изменены CAPEX-позиции',
        `Количество позиций: ${capitalData.length}.`,
        'data'
      );
    }
    case 'SET_OPERATING_DATA': {
      const operatingData = action.payload;
      return withEvent(
        {
          ...withUndoPoint(state),
          operatingData,
          categories: ensureUniqueCategories(state.categories, state.capitalData, operatingData),
        },
        'Изменены OPEX-позиции',
        `Количество позиций: ${operatingData.length}.`,
        'data'
      );
    }
    case 'SET_ELECTRICITY_TOTAL':
      return withEvent(
        { ...withUndoPoint(state), electricityTotal: action.payload },
        'Обновлено электропотребление',
        `Ежемесячная сумма: ${action.payload}.`,
        'data'
      );
    case 'ADD_CATEGORY': {
      const exists = state.categories.some(
        (category) =>
          category.scope === action.payload.scope &&
          category.name.trim().toLowerCase() === action.payload.name.trim().toLowerCase()
      );

      if (exists) return state;

      return withEvent(
        {
          ...withUndoPoint(state),
          categories: [...state.categories, action.payload],
        },
        'Добавлена категория',
        action.payload.name,
        'catalog'
      );
    }
    case 'DELETE_CATEGORY': {
      const categoryId = action.payload.categoryId;
      const category = state.categories.find((item) => item.id === categoryId);
      if (!category) return state;

      return withEvent(
        {
          ...withUndoPoint(state),
          categories: state.categories.filter((item) => item.id !== category.id),
          capitalData:
            category.scope === 'capital'
              ? state.capitalData.filter((item) => item.categoryId !== categoryId)
              : state.capitalData,
          operatingData:
            category.scope === 'operating'
              ? state.operatingData.filter((item) => item.categoryId !== categoryId)
              : state.operatingData,
        },
        'Удалена категория',
        category.name,
        'catalog'
      );
    }
    default:
      return state;
  }
}
