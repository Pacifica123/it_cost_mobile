"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectOperatingForCategory = exports.selectCapitalForCategory = exports.selectOperatingByMode = exports.selectOperatingTotal = exports.selectCapitalTotal = exports.selectOperatingGrouped = exports.selectCapitalGrouped = exports.groupByResolvedCategory = exports.resolveCategoryName = exports.selectCategoryByName = exports.selectCategoryById = exports.selectCategoriesByScope = void 0;
const selectCategoriesByScope = (state, scope) => state.categories
    .filter((category) => category.scope === scope)
    .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
exports.selectCategoriesByScope = selectCategoriesByScope;
const selectCategoryById = (state, categoryId) => state.categories.find((category) => category.id === categoryId);
exports.selectCategoryById = selectCategoryById;
const selectCategoryByName = (state, scope, categoryName) => state.categories.find((category) => category.scope === scope && category.name === categoryName);
exports.selectCategoryByName = selectCategoryByName;
const resolveCategoryName = (categories, categoryId) => categories.find((category) => category.id === categoryId)?.name ?? 'Без категории';
exports.resolveCategoryName = resolveCategoryName;
const groupByResolvedCategory = (items, categories) => {
    const grouped = {};
    for (const item of items) {
        const categoryName = (0, exports.resolveCategoryName)(categories, item.categoryId);
        (grouped[categoryName] || (grouped[categoryName] = [])).push(item);
    }
    return grouped;
};
exports.groupByResolvedCategory = groupByResolvedCategory;
const selectCapitalGrouped = (state) => (0, exports.groupByResolvedCategory)(state.capitalData, state.categories);
exports.selectCapitalGrouped = selectCapitalGrouped;
const selectOperatingGrouped = (state) => (0, exports.groupByResolvedCategory)(state.operatingData, state.categories);
exports.selectOperatingGrouped = selectOperatingGrouped;
const selectCapitalTotal = (state) => state.capitalData.reduce((sum, item) => sum + item.quantity * item.price, 0);
exports.selectCapitalTotal = selectCapitalTotal;
const selectOperatingTotal = (state) => state.operatingData.reduce((sum, item) => sum + item.price, 0);
exports.selectOperatingTotal = selectOperatingTotal;
const selectOperatingByMode = (state, mode) => {
    const categoryIds = new Set(state.categories
        .filter((category) => category.scope === 'operating' && category.mode === mode)
        .map((category) => category.id));
    return state.operatingData.filter((item) => categoryIds.has(item.categoryId));
};
exports.selectOperatingByMode = selectOperatingByMode;
const selectCapitalForCategory = (state, categoryId) => state.capitalData.filter((item) => item.categoryId === categoryId);
exports.selectCapitalForCategory = selectCapitalForCategory;
const selectOperatingForCategory = (state, categoryId) => state.operatingData.filter((item) => item.categoryId === categoryId);
exports.selectOperatingForCategory = selectOperatingForCategory;
