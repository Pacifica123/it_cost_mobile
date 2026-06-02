import { getCategoryModeFallback, createCategoryId, ensureCapitalKinds } from './catalogRules';
import { CURRENT_DATA_SCHEMA_VERSION, createDefaultProjectMeta, defaultAppSettings, defaultExchangeRates, initialCategories, initialState, makeProjectSnapshot } from './defaults';
import type {
  CapitalEquipment,
  DataState,
  ExpenseCategory,
  OperatingEquipment,
  AppSettings,
  ExchangeRates,
  ProjectBackup,
  ProjectSnapshot,
  StoredProjectRecord,
  ProjectEvent,
  ProjectEventType,
  ProjectMeta,
} from './types';

export const PROJECT_EXPORT_SCHEMA = 'it-cost-mobile-project';
export const PROJECT_EXPORT_VERSION = CURRENT_DATA_SCHEMA_VERSION;

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

const clampNumber = (value: unknown, fallback: number, min: number, max: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

const normalizeAppSettings = (input: unknown): AppSettings => {
  if (!isObject(input)) return defaultAppSettings;

  const themeMode = input.themeMode === 'light' || input.themeMode === 'dark' || input.themeMode === 'system'
    ? input.themeMode
    : defaultAppSettings.themeMode;
  const currency = input.currency === 'USD' || input.currency === 'EUR' || input.currency === 'RUB'
    ? input.currency
    : defaultAppSettings.currency;
  const roundingMode = input.roundingMode === 'none' || input.roundingMode === 'rubles' || input.roundingMode === 'thousands'
    ? input.roundingMode
    : defaultAppSettings.roundingMode;
  const uiDensity = input.uiDensity === 'compact' || input.uiDensity === 'large' || input.uiDensity === 'comfortable'
    ? input.uiDensity
    : defaultAppSettings.uiDensity;
  const startScreen = input.startScreen === 'home' || input.startScreen === 'itMenu' || input.startScreen === 'dashboard' || input.startScreen === 'quickStart'
    ? input.startScreen
    : defaultAppSettings.startScreen;
  const reportMode = input.reportMode === 'short' || input.reportMode === 'full' || input.reportMode === 'finance' || input.reportMode === 'technical'
    ? input.reportMode
    : defaultAppSettings.reportMode;
  const csvDefaultSection = input.csvDefaultSection === 'CAPEX' || input.csvDefaultSection === 'OPEX' || input.csvDefaultSection === 'HARDWARE' || input.csvDefaultSection === 'SOFTWARE'
    ? input.csvDefaultSection
    : defaultAppSettings.csvDefaultSection;

  return {
    themeMode,
    currency,
    roundingMode,
    confirmDelete: typeof input.confirmDelete === 'boolean' ? input.confirmDelete : defaultAppSettings.confirmDelete,
    uiDensity,
    startScreen,
    calculationHorizonYears: Math.round(clampNumber(input.calculationHorizonYears, defaultAppSettings.calculationHorizonYears, 1, 10)),
    discountRatePercent: clampNumber(input.discountRatePercent, defaultAppSettings.discountRatePercent, 0, 50),
    hardwareLifetimeMonths: Math.round(clampNumber(input.hardwareLifetimeMonths, defaultAppSettings.hardwareLifetimeMonths, 6, 120)),
    serverLifetimeMonths: Math.round(clampNumber(input.serverLifetimeMonths, defaultAppSettings.serverLifetimeMonths, 6, 120)),
    softwareLifetimeMonths: Math.round(clampNumber(input.softwareLifetimeMonths, defaultAppSettings.softwareLifetimeMonths, 1, 60)),
    reportMode,
    reportIncludeCharts: typeof input.reportIncludeCharts === 'boolean' ? input.reportIncludeCharts : defaultAppSettings.reportIncludeCharts,
    reportIncludeRisks: typeof input.reportIncludeRisks === 'boolean' ? input.reportIncludeRisks : defaultAppSettings.reportIncludeRisks,
    reportIncludeHistory: typeof input.reportIncludeHistory === 'boolean' ? input.reportIncludeHistory : defaultAppSettings.reportIncludeHistory,
    reportIncludeEmptySections: typeof input.reportIncludeEmptySections === 'boolean' ? input.reportIncludeEmptySections : defaultAppSettings.reportIncludeEmptySections,
    autoBackupBeforeDangerousActions: typeof input.autoBackupBeforeDangerousActions === 'boolean' ? input.autoBackupBeforeDangerousActions : defaultAppSettings.autoBackupBeforeDangerousActions,
    checkUpdatesOnStart: typeof input.checkUpdatesOnStart === 'boolean' ? input.checkUpdatesOnStart : defaultAppSettings.checkUpdatesOnStart,
    refreshRatesOnStart: typeof input.refreshRatesOnStart === 'boolean' ? input.refreshRatesOnStart : defaultAppSettings.refreshRatesOnStart,
    csvRequirePreview: typeof input.csvRequirePreview === 'boolean' ? input.csvRequirePreview : defaultAppSettings.csvRequirePreview,
    csvAutoMergeDuplicates: typeof input.csvAutoMergeDuplicates === 'boolean' ? input.csvAutoMergeDuplicates : defaultAppSettings.csvAutoMergeDuplicates,
    csvDefaultSection,
    minimumReadinessForReport: Math.round(clampNumber(input.minimumReadinessForReport, defaultAppSettings.minimumReadinessForReport, 0, 100)),
    minimumDataQualityForReport: Math.round(clampNumber(input.minimumDataQualityForReport, defaultAppSettings.minimumDataQualityForReport, 0, 100)),
  };
};

const normalizeExchangeRates = (input: unknown): ExchangeRates => {
  if (!isObject(input)) return defaultExchangeRates;
  const ratesObject = isObject(input.rates) ? input.rates : {};
  const normalizeRate = (value: unknown) => {
    const rate = Number(value);
    return Number.isFinite(rate) && rate > 0 ? rate : null;
  };

  const updatedAt = toStringSafe(input.updatedAt);
  const updatedAtIso = updatedAt ? toIsoSafe(updatedAt, defaultExchangeRates.updatedAt ?? new Date().toISOString()) : null;

  return {
    baseCurrency: 'RUB',
    rates: {
      USD: normalizeRate(ratesObject.USD),
      EUR: normalizeRate(ratesObject.EUR),
    },
    updatedAt: updatedAtIso,
    source: toStringSafe(input.source, defaultExchangeRates.source).trim() || defaultExchangeRates.source,
    error: toStringSafe(input.error).trim() || undefined,
  };
};

const normalizeProjectEvents = (input: unknown): ProjectEvent[] => {
  if (!Array.isArray(input)) return [];
  const allowedTypes = new Set<ProjectEventType>([
    'project',
    'data',
    'catalog',
    'template',
    'import',
    'export',
    'reset',
    'report',
    'backup',
    'history',
  ]);

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

const normalizeCategories = (input: unknown, fallback: ExpenseCategory[] = initialCategories): ExpenseCategory[] => {
  if (!Array.isArray(input)) return fallback;

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

  return normalized.length ? normalized : fallback;
};

const buildLegacyCategoryIdMap = (categories: ExpenseCategory[]) => {
  const byNameScope = new Map<string, string>();
  categories.forEach((category) => {
    byNameScope.set(`${category.scope}:${category.name.trim().toLowerCase()}`, category.id);
  });
  return byNameScope;
};

const normalizeCapitalData = (
  input: unknown,
  categories: ExpenseCategory[],
  fallback: CapitalEquipment[] = initialState.capitalData
): CapitalEquipment[] => {
  if (!Array.isArray(input)) return fallback;
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
          quantity: Math.max(0, toNumber(item.quantity)),
          price: Math.max(0, toNumber(item.price)),
          kind: item.kind === 'hardware' || item.kind === 'software' ? item.kind : undefined,
        };
      })
      .filter((item): item is CapitalEquipment => item !== null),
    categories
  );
};

const normalizeOperatingData = (
  input: unknown,
  categories: ExpenseCategory[],
  fallback: OperatingEquipment[] = initialState.operatingData
): OperatingEquipment[] => {
  if (!Array.isArray(input)) return fallback;
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
        price: Math.max(0, toNumber(item.price)),
      };
    })
    .filter((item): item is OperatingEquipment => item !== null);
};

const normalizeSnapshot = (input: unknown, fallbackState: DataState): ProjectSnapshot => {
  const projectObject = isObject(input) ? input : {};
  const categories = normalizeCategories(projectObject.categories, fallbackState.categories);
  const capitalData = normalizeCapitalData(projectObject.capitalData, categories, fallbackState.capitalData);
  const operatingData = normalizeOperatingData(projectObject.operatingData, categories, fallbackState.operatingData);

  return makeProjectSnapshot({
    projectMeta: normalizeProjectMeta(projectObject.projectMeta),
    appSettings: normalizeAppSettings(projectObject.appSettings),
    categories,
    capitalData,
    operatingData,
    electricityTotal: Math.max(0, toNumber(projectObject.electricityTotal, fallbackState.electricityTotal)),
  });
};


const normalizeSavedProjects = (input: unknown, fallbackState: DataState): StoredProjectRecord[] => {
  if (!Array.isArray(input)) return [];
  return input
    .filter(isObject)
    .map<StoredProjectRecord | null>((project, index) => {
      const snapshot = normalizeSnapshot(project.snapshot, fallbackState);
      const fallbackName = snapshot.projectMeta.name || `Проект ${index + 1}`;
      const createdAt = toIsoSafe(project.createdAt, snapshot.projectMeta.createdAt || new Date().toISOString());
      const updatedAt = toIsoSafe(project.updatedAt, snapshot.projectMeta.updatedAt || createdAt);
      return {
        id: toStringSafe(project.id, `import-project-${index + 1}`),
        name: toStringSafe(project.name, fallbackName).trim() || fallbackName,
        organization: toStringSafe(project.organization, snapshot.projectMeta.organization).trim(),
        createdAt,
        updatedAt,
        capitalItemsCount: Math.max(0, Math.round(toNumber(project.capitalItemsCount, snapshot.capitalData.length))),
        operatingItemsCount: Math.max(0, Math.round(toNumber(project.operatingItemsCount, snapshot.operatingData.length))),
        budget: Math.max(0, toNumber(project.budget, snapshot.projectMeta.budget)),
        snapshot,
      };
    })
    .filter((project): project is StoredProjectRecord => project !== null)
    .slice(0, 30);
};

const normalizeBackups = (input: unknown, fallbackState: DataState): ProjectBackup[] => {
  if (!Array.isArray(input)) return [];
  return input
    .filter(isObject)
    .map<ProjectBackup | null>((backup, index) => {
      const snapshot = normalizeSnapshot(backup.snapshot, fallbackState);
      const name = toStringSafe(backup.name, `Резервная копия ${index + 1}`).trim();
      return {
        id: toStringSafe(backup.id, `import-backup-${index + 1}`),
        name: name || `Резервная копия ${index + 1}`,
        description: toStringSafe(backup.description, 'Импортированная резервная копия.').trim(),
        createdAt: toIsoSafe(backup.createdAt, new Date().toISOString()),
        capitalItemsCount: Math.max(0, Math.round(toNumber(backup.capitalItemsCount, snapshot.capitalData.length))),
        operatingItemsCount: Math.max(0, Math.round(toNumber(backup.operatingItemsCount, snapshot.operatingData.length))),
        snapshot,
      };
    })
    .filter((backup): backup is ProjectBackup => backup !== null)
    .slice(0, 12);
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
  const baseState: DataState = {
    ...initialState,
    schemaVersion: CURRENT_DATA_SCHEMA_VERSION,
    projectMeta: normalizeProjectMeta(isObject(projectObject) ? projectObject.projectMeta : undefined),
    appSettings: normalizeAppSettings(isObject(projectObject) ? projectObject.appSettings : undefined),
    exchangeRates: normalizeExchangeRates(isObject(projectObject) ? projectObject.exchangeRates : undefined),
    activeProjectId: isObject(projectObject) ? toStringSafe(projectObject.activeProjectId).trim() || null : null,
    savedProjects: [],
    projectEvents: normalizeProjectEvents(isObject(projectObject) ? projectObject.projectEvents : undefined),
    projectBackups: [],
    undoStack: [],
    redoStack: [],
    categories,
    capitalData,
    operatingData,
    electricityTotal: Math.max(0, toNumber(isObject(projectObject) ? projectObject.electricityTotal : 0)),
  };

  const savedProjects = normalizeSavedProjects(isObject(projectObject) ? projectObject.savedProjects : undefined, baseState);
  const activeProjectId = baseState.activeProjectId && savedProjects.some((item) => item.id === baseState.activeProjectId)
    ? baseState.activeProjectId
    : null;

  return {
    ...baseState,
    activeProjectId,
    savedProjects,
    projectBackups: normalizeBackups(isObject(projectObject) ? projectObject.projectBackups : undefined, baseState),
  };
};

export const serializeDataState = (state: DataState): string =>
  JSON.stringify(
    {
      schema: PROJECT_EXPORT_SCHEMA,
      version: PROJECT_EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        ...state,
        schemaVersion: CURRENT_DATA_SCHEMA_VERSION,
        undoStack: [],
        redoStack: [],
      },
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
  const rawVersion = isObject(parsed) ? Number(parsed.version) : NaN;
  const rawDataVersion = isObject(projectObject) ? Number(projectObject.schemaVersion) : NaN;
  const detectedVersion = Number.isFinite(rawVersion) ? rawVersion : rawDataVersion;
  if (!Number.isFinite(detectedVersion) || detectedVersion < CURRENT_DATA_SCHEMA_VERSION) {
    warnings.push('Проект обновлён до текущей версии структуры данных.');
  }
  if (isObject(projectObject) && !Array.isArray(projectObject.categories)) {
    warnings.push('Категории не найдены, будут использованы базовые категории приложения.');
  }
  if (isObject(projectObject) && !isObject(projectObject.projectMeta)) {
    warnings.push('Паспорт проекта не найден, будет создан базовый паспорт.');
  }
  if (isObject(projectObject) && !isObject(projectObject.exchangeRates)) {
    warnings.push('Курсы валют не найдены, их можно обновить в настройках.');
  }
  if (isObject(projectObject) && !Array.isArray(projectObject.savedProjects)) {
    warnings.push('Список сохранённых проектов не найден, будет создан пустой список.');
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
