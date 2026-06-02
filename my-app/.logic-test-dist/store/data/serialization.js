"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hydrateDataState = exports.parseProjectDataState = exports.serializeDataState = exports.normalizeDataState = exports.PROJECT_EXPORT_VERSION = exports.PROJECT_EXPORT_SCHEMA = void 0;
const catalogRules_1 = require("./catalogRules");
const defaults_1 = require("./defaults");
exports.PROJECT_EXPORT_SCHEMA = 'it-cost-mobile-project';
exports.PROJECT_EXPORT_VERSION = defaults_1.CURRENT_DATA_SCHEMA_VERSION;
const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
const toStringSafe = (value, fallback = '') => typeof value === 'string' ? value : fallback;
const toIsoSafe = (value, fallback) => {
    const raw = toStringSafe(value, fallback);
    const time = Date.parse(raw);
    return Number.isFinite(time) ? new Date(time).toISOString() : fallback;
};
const normalizeProjectMeta = (input) => {
    const fallback = (0, defaults_1.createDefaultProjectMeta)({ createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    if (!isObject(input))
        return fallback;
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
const normalizeAppSettings = (input) => {
    if (!isObject(input))
        return defaults_1.defaultAppSettings;
    const themeMode = input.themeMode === 'light' || input.themeMode === 'dark' || input.themeMode === 'system'
        ? input.themeMode
        : defaults_1.defaultAppSettings.themeMode;
    const currency = input.currency === 'USD' || input.currency === 'EUR' || input.currency === 'RUB'
        ? input.currency
        : defaults_1.defaultAppSettings.currency;
    const roundingMode = input.roundingMode === 'none' || input.roundingMode === 'rubles' || input.roundingMode === 'thousands'
        ? input.roundingMode
        : defaults_1.defaultAppSettings.roundingMode;
    return {
        themeMode,
        currency,
        roundingMode,
        confirmDelete: typeof input.confirmDelete === 'boolean' ? input.confirmDelete : defaults_1.defaultAppSettings.confirmDelete,
    };
};
const normalizeExchangeRates = (input) => {
    if (!isObject(input))
        return defaults_1.defaultExchangeRates;
    const ratesObject = isObject(input.rates) ? input.rates : {};
    const normalizeRate = (value) => {
        const rate = Number(value);
        return Number.isFinite(rate) && rate > 0 ? rate : null;
    };
    const updatedAt = toStringSafe(input.updatedAt);
    const updatedAtIso = updatedAt ? toIsoSafe(updatedAt, defaults_1.defaultExchangeRates.updatedAt ?? new Date().toISOString()) : null;
    return {
        baseCurrency: 'RUB',
        rates: {
            USD: normalizeRate(ratesObject.USD),
            EUR: normalizeRate(ratesObject.EUR),
        },
        updatedAt: updatedAtIso,
        source: toStringSafe(input.source, defaults_1.defaultExchangeRates.source).trim() || defaults_1.defaultExchangeRates.source,
        error: toStringSafe(input.error).trim() || undefined,
    };
};
const normalizeProjectEvents = (input) => {
    if (!Array.isArray(input))
        return [];
    const allowedTypes = new Set([
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
        .map((event, index) => {
        const title = toStringSafe(event.title).trim();
        if (!title)
            return null;
        const type = allowedTypes.has(event.type) ? event.type : 'project';
        const createdAt = toIsoSafe(event.createdAt, new Date().toISOString());
        return {
            id: toStringSafe(event.id, `import-event-${index + 1}`),
            type,
            title,
            description: toStringSafe(event.description).trim(),
            createdAt,
        };
    })
        .filter((event) => event !== null)
        .slice(0, 80);
};
const normalizeCategories = (input, fallback = defaults_1.initialCategories) => {
    if (!Array.isArray(input))
        return fallback;
    const seen = new Set();
    const normalized = input
        .filter(isObject)
        .map((category) => {
        const name = toStringSafe(category.name).trim();
        const scope = category.scope === 'capital' || category.scope === 'operating' ? category.scope : null;
        if (!name || !scope)
            return null;
        const mode = category.mode === 'oneTime' || category.mode === 'periodic'
            ? category.mode
            : scope === 'operating'
                ? (0, catalogRules_1.getCategoryModeFallback)(name)
                : undefined;
        const id = toStringSafe(category.id, (0, catalogRules_1.createCategoryId)(scope, name));
        const key = `${scope}:${name.toLowerCase()}`;
        if (seen.has(key))
            return null;
        seen.add(key);
        return {
            id,
            name,
            scope,
            mode,
        };
    })
        .filter((category) => category !== null);
    return normalized.length ? normalized : fallback;
};
const buildLegacyCategoryIdMap = (categories) => {
    const byNameScope = new Map();
    categories.forEach((category) => {
        byNameScope.set(`${category.scope}:${category.name.trim().toLowerCase()}`, category.id);
    });
    return byNameScope;
};
const normalizeCapitalData = (input, categories, fallback = defaults_1.initialState.capitalData) => {
    if (!Array.isArray(input))
        return fallback;
    const byNameScope = buildLegacyCategoryIdMap(categories);
    return (0, catalogRules_1.ensureCapitalKinds)(input
        .filter(isObject)
        .map((item, index) => {
        const categoryId = toStringSafe(item.categoryId) ||
            byNameScope.get(`capital:${toStringSafe(item.category).trim().toLowerCase()}`) ||
            '';
        if (!categoryId)
            return null;
        return {
            id: toStringSafe(item.id, `capital-import-${index + 1}`),
            categoryId,
            name: toStringSafe(item.name, 'Без названия'),
            quantity: Math.max(0, toNumber(item.quantity)),
            price: Math.max(0, toNumber(item.price)),
            kind: item.kind === 'hardware' || item.kind === 'software' ? item.kind : undefined,
        };
    })
        .filter((item) => item !== null), categories);
};
const normalizeOperatingData = (input, categories, fallback = defaults_1.initialState.operatingData) => {
    if (!Array.isArray(input))
        return fallback;
    const byNameScope = buildLegacyCategoryIdMap(categories);
    return input
        .filter(isObject)
        .map((item, index) => {
        const categoryId = toStringSafe(item.categoryId) ||
            byNameScope.get(`operating:${toStringSafe(item.category).trim().toLowerCase()}`) ||
            '';
        if (!categoryId)
            return null;
        return {
            id: toStringSafe(item.id, `operating-import-${index + 1}`),
            categoryId,
            name: toStringSafe(item.name, 'Без названия'),
            price: Math.max(0, toNumber(item.price)),
        };
    })
        .filter((item) => item !== null);
};
const normalizeSnapshot = (input, fallbackState) => {
    const projectObject = isObject(input) ? input : {};
    const categories = normalizeCategories(projectObject.categories, fallbackState.categories);
    const capitalData = normalizeCapitalData(projectObject.capitalData, categories, fallbackState.capitalData);
    const operatingData = normalizeOperatingData(projectObject.operatingData, categories, fallbackState.operatingData);
    return (0, defaults_1.makeProjectSnapshot)({
        projectMeta: normalizeProjectMeta(projectObject.projectMeta),
        appSettings: normalizeAppSettings(projectObject.appSettings),
        categories,
        capitalData,
        operatingData,
        electricityTotal: Math.max(0, toNumber(projectObject.electricityTotal, fallbackState.electricityTotal)),
    });
};
const normalizeSavedProjects = (input, fallbackState) => {
    if (!Array.isArray(input))
        return [];
    return input
        .filter(isObject)
        .map((project, index) => {
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
        .filter((project) => project !== null)
        .slice(0, 30);
};
const normalizeBackups = (input, fallbackState) => {
    if (!Array.isArray(input))
        return [];
    return input
        .filter(isObject)
        .map((backup, index) => {
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
        .filter((backup) => backup !== null)
        .slice(0, 12);
};
const extractProjectObject = (parsed) => {
    if (!isObject(parsed))
        return null;
    if (isObject(parsed.data))
        return parsed.data;
    return parsed;
};
const looksLikeProjectObject = (value) => {
    if (!isObject(value))
        return false;
    return 'capitalData' in value || 'operatingData' in value || 'categories' in value || 'electricityTotal' in value || 'projectMeta' in value;
};
const normalizeDataState = (value) => {
    const projectObject = extractProjectObject(value) ?? {};
    const categories = normalizeCategories(isObject(projectObject) ? projectObject.categories : undefined);
    const capitalData = normalizeCapitalData(isObject(projectObject) ? projectObject.capitalData : undefined, categories);
    const operatingData = normalizeOperatingData(isObject(projectObject) ? projectObject.operatingData : undefined, categories);
    const baseState = {
        ...defaults_1.initialState,
        schemaVersion: defaults_1.CURRENT_DATA_SCHEMA_VERSION,
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
exports.normalizeDataState = normalizeDataState;
const serializeDataState = (state) => JSON.stringify({
    schema: exports.PROJECT_EXPORT_SCHEMA,
    version: exports.PROJECT_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
        ...state,
        schemaVersion: defaults_1.CURRENT_DATA_SCHEMA_VERSION,
        undoStack: [],
        redoStack: [],
    },
}, null, 2);
exports.serializeDataState = serializeDataState;
const parseProjectDataState = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) {
        return { ok: false, message: 'Вставьте JSON проекта перед импортом.', warnings: [] };
    }
    let parsed;
    try {
        parsed = JSON.parse(trimmed);
    }
    catch {
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
    const warnings = [];
    if (isObject(parsed) && 'schema' in parsed && parsed.schema !== exports.PROJECT_EXPORT_SCHEMA) {
        warnings.push('Схема экспорта отличается от текущей, данные будут импортированы в режиме совместимости.');
    }
    const rawVersion = isObject(parsed) ? Number(parsed.version) : NaN;
    const rawDataVersion = isObject(projectObject) ? Number(projectObject.schemaVersion) : NaN;
    const detectedVersion = Number.isFinite(rawVersion) ? rawVersion : rawDataVersion;
    if (!Number.isFinite(detectedVersion) || detectedVersion < defaults_1.CURRENT_DATA_SCHEMA_VERSION) {
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
        state: (0, exports.normalizeDataState)(parsed),
        message: 'Проект импортирован. Данные нормализованы и сохранены локально.',
        warnings,
    };
};
exports.parseProjectDataState = parseProjectDataState;
const hydrateDataState = (raw) => {
    if (!raw)
        return defaults_1.initialState;
    const result = (0, exports.parseProjectDataState)(raw);
    return result.ok ? result.state : defaults_1.initialState;
};
exports.hydrateDataState = hydrateDataState;
