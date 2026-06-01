import type { DataAction } from './actions';
import { createProjectEvent, emptyProjectState, initialState } from './defaults';
import type { DataState, ProjectEvent, ProjectEventType } from './types';
import { ensureCapitalKinds, ensureUniqueCategories } from './catalogRules';

export { initialState } from './defaults';

const nowIso = () => new Date().toISOString();
const MAX_EVENTS = 80;

const withMetaUpdate = (state: DataState): DataState => ({
  ...state,
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

export function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'HYDRATE_STATE':
      return action.payload;
    case 'APPLY_PROJECT_TEMPLATE':
      return withEvent(action.payload, 'Применён шаблон проекта', action.payload.projectMeta.name, 'template');
    case 'RESET_DEMO_DATA':
      return withEvent(initialState, 'Загружены демо-данные', 'Текущий проект заменён демонстрационным набором.', 'template');
    case 'RESET_EMPTY_PROJECT':
      return withEvent(emptyProjectState, 'Проект очищен', 'Позиции и расчёты очищены, базовые категории сохранены.', 'reset');
    case 'CLEAR_PROJECT_EVENTS':
      return {
        ...withMetaUpdate(state),
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
    case 'SET_PROJECT_META': {
      const nextState = {
        ...state,
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
          ...state,
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
          ...state,
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
        { ...state, electricityTotal: action.payload },
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
          ...state,
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
          ...state,
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
