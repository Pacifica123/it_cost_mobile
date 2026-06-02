"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseProjectCsv = parseProjectCsv;
const normalize = (value) => value.trim().toLowerCase();
const splitCsvLine = (line) => {
    const cells = [];
    let current = '';
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const next = line[i + 1];
        if (char === '"' && quoted && next === '"') {
            current += '"';
            i += 1;
            continue;
        }
        if (char === '"') {
            quoted = !quoted;
            continue;
        }
        if ((char === ';' || char === ',') && !quoted) {
            cells.push(current.trim());
            current = '';
            continue;
        }
        current += char;
    }
    cells.push(current.trim());
    return cells;
};
const parseMoney = (value) => {
    const cleaned = value.replace(/\s+/g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};
const parseQuantity = (value) => {
    const parsed = Number(value.replace(',', '.').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};
const createId = (prefix, index) => `${prefix}-${Date.now().toString(36)}-${index}-${Math.random().toString(36).slice(2, 6)}`;
const findColumn = (headers, aliases) => {
    const normalizedAliases = aliases.map(normalize);
    return headers.findIndex((header) => normalizedAliases.includes(normalize(header)));
};
const resolveCategoryId = (categories, scope, value, fallback) => {
    const normalized = normalize(value);
    if (!normalized)
        return fallback;
    const byId = categories.find((category) => category.scope === scope && normalize(category.id) === normalized);
    if (byId)
        return byId.id;
    const byName = categories.find((category) => category.scope === scope && normalize(category.name) === normalized);
    return byName?.id ?? fallback;
};
const detectScope = (raw, categoryRaw, defaultSection = 'CAPEX') => {
    const value = `${raw} ${categoryRaw}`.toLowerCase();
    if (/opex|operating|операц|эксплуатац|подпис|аренд|администр/i.test(value))
        return 'operating';
    if (/capex|capital|капит|то|техничес|hardware|оборуд|по|software|лиценз/i.test(value))
        return 'capital';
    return defaultSection === 'OPEX' ? 'operating' : 'capital';
};
const detectKind = (rawKind, categoryRaw, name) => {
    const value = `${rawKind} ${categoryRaw} ${name}`.toLowerCase();
    if (/software|soft|по|лиценз|office|windows|антивирус|saas/i.test(value))
        return 'software';
    return 'hardware';
};
function parseProjectCsv(raw, categories, options = {}) {
    const defaultSection = options.defaultSection ?? 'CAPEX';
    const warnings = [];
    const lines = raw
        .split(/\r?\n/g)
        .map((line) => line.trim())
        .filter(Boolean);
    if (lines.length < 2) {
        return { capitalData: [], operatingData: [], warnings: ['CSV должен содержать строку заголовков и хотя бы одну позицию.'], rowsRead: 0 };
    }
    const headers = splitCsvLine(lines[0]);
    const nameIndex = findColumn(headers, ['name', 'title', 'название', 'позиция', 'товар']);
    const priceIndex = findColumn(headers, ['price', 'cost', 'стоимость', 'цена', 'сумма']);
    const quantityIndex = findColumn(headers, ['quantity', 'qty', 'количество', 'шт']);
    const scopeIndex = findColumn(headers, ['scope', 'type', 'раздел', 'тип']);
    const categoryIndex = findColumn(headers, ['category', 'категория']);
    const kindIndex = findColumn(headers, ['kind', 'то/по', 'вид']);
    if (nameIndex === -1 || priceIndex === -1) {
        return {
            capitalData: [],
            operatingData: [],
            warnings: ['Не найдены обязательные колонки: название/name и цена/price.'],
            rowsRead: 0,
        };
    }
    const capitalData = [];
    const operatingData = [];
    lines.slice(1).forEach((line, rowIndex) => {
        const cells = splitCsvLine(line);
        const name = cells[nameIndex]?.trim() || '';
        const price = parseMoney(cells[priceIndex] ?? '0');
        const quantity = quantityIndex === -1 ? 1 : parseQuantity(cells[quantityIndex] ?? '1');
        const scopeRaw = scopeIndex === -1 ? '' : cells[scopeIndex] ?? '';
        const categoryRaw = categoryIndex === -1 ? '' : cells[categoryIndex] ?? '';
        const kindRaw = kindIndex === -1 ? '' : cells[kindIndex] ?? '';
        if (!name) {
            warnings.push(`Строка ${rowIndex + 2}: пропущена позиция без названия.`);
            return;
        }
        if (price <= 0) {
            warnings.push(`Строка ${rowIndex + 2}: цена у «${name}» равна 0, позиция импортирована для последующего уточнения.`);
        }
        const scope = detectScope(scopeRaw, categoryRaw, defaultSection);
        if (scope === 'operating') {
            operatingData.push({
                id: createId('csv-opex', rowIndex),
                categoryId: resolveCategoryId(categories, 'operating', categoryRaw, 'operating-subscriptions'),
                name,
                price,
            });
            return;
        }
        capitalData.push({
            id: createId('csv-capex', rowIndex),
            categoryId: resolveCategoryId(categories, 'capital', categoryRaw, defaultSection === 'SOFTWARE' || detectKind(kindRaw, categoryRaw, name) === 'software' ? 'capital-software' : 'capital-client'),
            name,
            quantity,
            price,
            kind: defaultSection === 'SOFTWARE' ? 'software' : defaultSection === 'HARDWARE' ? 'hardware' : detectKind(kindRaw, categoryRaw, name),
        });
    });
    return {
        capitalData,
        operatingData,
        warnings,
        rowsRead: lines.length - 1,
    };
}
