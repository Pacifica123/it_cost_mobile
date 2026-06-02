"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNumber = exports.toNumberSafe = exports.onlyDecimal = exports.onlyDigits = void 0;
const onlyDigits = (value) => String(value ?? '').replace(/\D+/g, '');
exports.onlyDigits = onlyDigits;
const onlyDecimal = (value) => String(value ?? '').replace(/[^\d.,]+/g, '');
exports.onlyDecimal = onlyDecimal;
const toNumberSafe = (value) => {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }
    const normalized = String(value ?? '').replace(',', '.').trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
};
exports.toNumberSafe = toNumberSafe;
const formatNumber = (value) => {
    const n = (0, exports.toNumberSafe)(value);
    return new Intl.NumberFormat('ru-RU').format(n);
};
exports.formatNumber = formatNumber;
