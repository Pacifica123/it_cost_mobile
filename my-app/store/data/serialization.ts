import { getCategoryModeFallback, createCategoryId, ensureCapitalKinds } from './catalogRules';
import { createDefaultProjectMeta, initialCategories, initialState } from './defaults';
import type {
  CapitalEquipment,
  DataState,
  ExpenseCategory,
  OperatingEquipment,
  ProjectEvent,
  ProjectEventType,
  ProjectMeta,
} from './types';

export const PROJECT_EXPORT_SCHEMA = 'it-cost-mobile-project';
export const PROJECT_EXPORT_VERSION = 2;

export type ProjectExportEnvelope = {
  schema: typeof PROJECT_EXPORT_SCHEMA;
  version: number;
  exportedAt: string;
  data: DataState;
};

export type ProjectImportResult =
  | { ok: true; state: DataState; message: string; warnings: string[] }
  | { ok: false; message: string; warnings: string[] };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toStringSafe = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : fallback;

const toIsoSafe = (value: unknown, fallback: string) => {
  const raw = toStringSafe(value, fallback);
  const time = Date.parse(raw);
  return Number.isFinite(time) ? new Date(time).toISOString() : fallback;
};

const normalizeProjectMeta = (input: unknown): ProjectMeta => {
  const fallback = createDefaultProjectMeta({ createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  if (!isObject(input)) return fallback;

  const createdAt = toIsoSafe(input.createdAt, fallback.createdAt);
  const updatedAt = toIsoSafe(input.updatedAt, fallback.updatedAt);

  return {
    name: toStringSafe(input.name, fallback.name).trim() || fallback.name,
    organization: toStringSafe(input.organization, fallback.organization).trim(),
    budget: Math.max(0, toNumber(input.budget, fallback.budget)),
    targetClientSeats: Math.max(0, Math.round(toNumber(input.targetClientSeats, fallback.targetClientSeats))),
    note: toStringSafe(input.note, fallback.note).trim(),
    createdAt,
    updatedAt,
  };
};

const normalizeProjectEvents = (input: unknown): ProjectEvent[] => {
  if (!Array.isArray(input)) return [];
  const allowedTypes = new Set<ProjectEventType>(['project', 'data', 'catalog', 'template', 'import', 'export', 'reset', 'report']);

  return input
    .filter(isObject)
    .map<ProjectEvent | null>((event, index) => {
      const title = toStringSafe(event.title).trim();
      if (!title) return null;
      const type = allowedTypes.has(event.type as ProjectEventType) ? (event.type as ProjectEventType) : 'project';
      const createdAt = toIsoSafe(event.createdAt, new Date().toISOString());

      return {
        id: toStringSafe(event.id, `import-event-${index + 1}`),
        type,
        title,
        description: toStringSafe(event.description).trim(),
        createdAt,
      };
    })
    .filter((event): event is ProjectEvent => event !== null)
    .slice(0, 80);
};

const normalizeCategories = (input: unknown): ExpenseCategory[] => {
  if (!Array.isArray(input)) return initialCategories;

  const seen = new Set<string>();
  const normalized = input
    .filter(isObject)
    .map<ExpenseCategory | null>((category) => {
      const name = toStringSafe(category.name).trim();
      const scope = category.scope === 'capital' || category.scope === 'operating' ? category.scope : null;
      if (!name || !scope) return null;

      const mode =
        category.mode === 'oneTime' || category.mode === 'periodic'
          ? category.mode
          : scope === 'operating'
            ? getCategoryModeFallback(name)
            : undefined;
      const id = toStringSafe(category.id, createCategoryId(scope, name));
      const key = `${scope}:${name.toLowerCase()}`;
      if (seen.has(key)) return null;
      seen.add(key);

      return {
        id,
        name,
        scope,
        mode,
      };
    })
    .filter((category): category is ExpenseCategory => category !== null);

  return normalized.length ? normalized : initialCategories;
};

const buildLegacyCategoryIdMap = (categories: ExpenseCategory[]) => {
  const byNameScope = new Map<string, string>();
  categories.forEach((category) => {
    byNameScope.set(`${category.scope}:${category.name.trim().toLowerCase()}`, category.id);
  });
  return byNameScope;
};

const normalizeCapitalData = (input: unknown, categories: ExpenseCategory[]): CapitalEquipment[] => {
  if (!Array.isArray(input)) return initialState.capitalData;
  const byNameScope = buildLegacyCategoryIdMap(categories);

  return ensureCapitalKinds(
    input
      .filter(isObject)
      .map<CapitalEquipment | null>((item, index) => {
        const categoryId =
          toStringSafe(item.categoryId) ||
          byNameScope.get(`capital:${toStringSafe(item.category).trim().toLowerCase()}`) ||
          '';

        if (!categoryId) return null;

        return {
          id: toStringSafe(item.id, `capital-import-${index + 1}`),
          categoryId,
          name: toStringSafe(item.name, 'Без названия'),
          quantity: toNumber(item.quantity),
          price: toNumber(item.price),
          kind: item.kind === 'hardware' || item.kind === 'software' ? item.kind : undefined,
        };
      })
      .filter((item): item is CapitalEquipment => item !== null),
    categories
  );
};

const normalizeOperatingData = (input: unknown, categories: ExpenseCategory[]): OperatingEquipment[] => {
  if (!Array.isArray(input)) return initialState.operatingData;
  const byNameScope = buildLegacyCategoryIdMap(categories);

  return input
    .filter(isObject)
    .map<OperatingEquipment | null>((item, index) => {
      const categoryId =
        toStringSafe(item.categoryId) ||
        byNameScope.get(`operating:${toStringSafe(item.category).trim().toLowerCase()}`) ||
        '';

      if (!categoryId) return null;

      return {
        id: toStringSafe(item.id, `operating-import-${index + 1}`),
        categoryId,
        name: toStringSafe(item.name, 'Без названия'),
        price: toNumber(item.price),
      };
    })
    .filter((item): item is OperatingEquipment => item !== null);
};

const extractProjectObject = (parsed: unknown) => {
  if (!isObject(parsed)) return null;
  if (isObject(parsed.data)) return parsed.data;
  return parsed;
};

const looksLikeProjectObject = (value: unknown) => {
  if (!isObject(value)) return false;
  return 'capitalData' in value || 'operatingData' in value || 'categories' in value || 'electricityTotal' in value || 'projectMeta' in value;
};

export const normalizeDataState = (value: unknown): DataState => {
  const projectObject = extractProjectObject(value) ?? {};
  const categories = normalizeCategories(isObject(projectObject) ? projectObject.categories : undefined);
  const capitalData = normalizeCapitalData(isObject(projectObject) ? projectObject.capitalData : undefined, categories);
  const operatingData = normalizeOperatingData(isObject(projectObject) ? projectObject.operatingData : undefined, categories);

  return {
    projectMeta: normalizeProjectMeta(isObject(projectObject) ? projectObject.projectMeta : undefined),
    projectEvents: normalizeProjectEvents(isObject(projectObject) ? projectObject.projectEvents : undefined),
    categories,
    capitalData,
    operatingData,
    electricityTotal: Math.max(0, toNumber(isObject(projectObject) ? projectObject.electricityTotal : 0)),
  };
};

export const serializeDataState = (state: DataState): string =>
  JSON.stringify(
    {
      schema: PROJECT_EXPORT_SCHEMA,
      version: PROJECT_EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      data: state,
    } satisfies ProjectExportEnvelope,
    null,
    2
  );

export const parseProjectDataState = (raw: string): ProjectImportResult => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, message: 'Вставьте JSON проекта перед импортом.', warnings: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, message: 'JSON не читается. Проверьте скобки, кавычки и запятые.', warnings: [] };
  }

  const projectObject = extractProjectObject(parsed);
  if (!looksLikeProjectObject(projectObject)) {
    return {
      ok: false,
      message: 'Файл не похож на проект IT Cost Mobile: нет projectMeta, categories, capitalData, operatingData или electricityTotal.',
      warnings: [],
    };
  }

  const warnings: string[] = [];
  if (isObject(parsed) && 'schema' in parsed && parsed.schema !== PROJECT_EXPORT_SCHEMA) {
    warnings.push('Схема экспорта отличается от текущей, данные будут импортированы в режиме совместимости.');
  }
  if (isObject(projectObject) && !Array.isArray(projectObject.categories)) {
    warnings.push('Категории не найдены, будут использованы базовые категории приложения.');
  }
  if (isObject(projectObject) && !isObject(projectObject.projectMeta)) {
    warnings.push('Паспорт проекта не найден, будет создан базовый паспорт.');
  }

  return {
    ok: true,
    state: normalizeDataState(parsed),
    message: 'Проект импортирован. Данные нормализованы и сохранены локально.',
    warnings,
  };
};

export const hydrateDataState = (raw: string | null): DataState => {
  if (!raw) return initialState;
  const result = parseProjectDataState(raw);
  return result.ok ? result.state : initialState;
};
