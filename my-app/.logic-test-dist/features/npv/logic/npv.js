"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toNumber = toNumber;
exports.parseRate = parseRate;
exports.parseCashflows = parseCashflows;
exports.formatNpvNumber = formatNpvNumber;
exports.calculateNpv = calculateNpv;
exports.getFinalNpv = getFinalNpv;
exports.getPaybackPeriod = getPaybackPeriod;
function toNumber(value) {
    return Number(value.trim().replace(',', '.'));
}
function parseRate(value) {
    const number = toNumber(value);
    if (Number.isNaN(number)) {
        return null;
    }
    return number > 1 ? number / 100 : number;
}
function parseCashflows(value) {
    return value
        .split(',')
        .map((item) => toNumber(item))
        .filter((item) => !Number.isNaN(item));
}
function formatNpvNumber(value) {
    return value.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
function calculateNpv(investmentInput, cashflowsInput, rateInput) {
    const investment = toNumber(investmentInput);
    const rate = parseRate(rateInput);
    const cashflows = parseCashflows(cashflowsInput);
    if (Number.isNaN(investment) || investment <= 0) {
        return { ok: false, error: 'Введите корректные начальные инвестиции' };
    }
    if (rate === null || rate < 0) {
        return { ok: false, error: 'Введите корректную ставку дисконтирования' };
    }
    if (!cashflows.length) {
        return { ok: false, error: 'Введите денежные потоки через запятую' };
    }
    let cumulative = -investment;
    const rows = [
        {
            year: 0,
            cft: -investment,
            pv: -investment,
            npv: Number(cumulative.toFixed(2)),
        },
    ];
    const chartValues = [Number(cumulative.toFixed(2))];
    cashflows.forEach((cashflow, index) => {
        const year = index + 1;
        const pv = cashflow / Math.pow(1 + rate, year);
        cumulative += pv;
        rows.push({
            year,
            cft: cashflow,
            pv: Number(pv.toFixed(2)),
            npv: Number(cumulative.toFixed(2)),
        });
        chartValues.push(Number(cumulative.toFixed(2)));
    });
    return { ok: true, data: { rows, chartValues } };
}
function getFinalNpv(rows) {
    return rows.length ? rows[rows.length - 1].npv : null;
}
function getPaybackPeriod(rows) {
    const found = rows.find((row) => row.npv >= 0);
    return found ? found.year : null;
}
