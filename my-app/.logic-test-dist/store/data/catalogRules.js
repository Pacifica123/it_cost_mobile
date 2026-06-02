"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryModeFallback = exports.ensureUniqueCategories = exports.ensureCapitalKinds = exports.inferCapitalKindByText = exports.getCategoryNameById = exports.createCategoryId = exports.ONE_TIME_OPERATING_CATEGORIES = void 0;
const SOFTWARE_HINTS = ['лиценз', 'подписк', 'windows', 'linux', 'software', 'license', 'office'];
exports.ONE_TIME_OPERATING_CATEGORIES = new Set(['Миграция', 'Тестирование']);
const slugify = (value) => value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
const createCategoryId = (scope, name) => `${scope}-${slugify(name) || Date.now()}`;
exports.createCategoryId = createCategoryId;
const getCategoryNameById = (categories, categoryId) => categories.find((category) => category.id === categoryId)?.name ?? 'Без категории';
exports.getCategoryNameById = getCategoryNameById;
const inferCapitalKindByText = (categoryName, name) => {
    const haystack = `${categoryName} ${name}`.toLowerCase();
    return SOFTWARE_HINTS.some((hint) => haystack.includes(hint)) ? 'software' : 'hardware';
};
exports.inferCapitalKindByText = inferCapitalKindByText;
const ensureCapitalKinds = (items, categories) => items.map((item) => ({
    ...item,
    kind: item.kind ?? (0, exports.inferCapitalKindByText)((0, exports.getCategoryNameById)(categories, item.categoryId), item.name),
}));
exports.ensureCapitalKinds = ensureCapitalKinds;
const ensureUniqueCategories = (existing, extraCapital, extraOperating) => {
    const map = new Map(existing.map((category) => [category.id, category]));
    for (const item of extraCapital) {
        if (map.has(item.categoryId))
            continue;
        map.set(item.categoryId, {
            id: item.categoryId,
            name: 'Без категории',
            scope: 'capital',
        });
    }
    for (const item of extraOperating) {
        if (map.has(item.categoryId))
            continue;
        map.set(item.categoryId, {
            id: item.categoryId,
            name: 'Без категории',
            scope: 'operating',
            mode: 'periodic',
        });
    }
    return Array.from(map.values());
};
exports.ensureUniqueCategories = ensureUniqueCategories;
const getCategoryModeFallback = (categoryName) => exports.ONE_TIME_OPERATING_CATEGORIES.has(categoryName) ? 'oneTime' : 'periodic';
exports.getCategoryModeFallback = getCategoryModeFallback;
