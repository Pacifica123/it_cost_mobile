"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFinancialChartData = buildFinancialChartData;
const buildReport_1 = require("../../report/logic/buildReport");
const DISCOUNT_RATE = 0.12;
function buildFinancialChartData(state) {
    const report = (0, buildReport_1.buildReport)(state);
    const recurringAnnual = report.periodicTotalAnnual + report.electricityTotalAnnual;
    const oneTime = report.totalOneTimeExpenses;
    const cumulativeTco = Array.from({ length: 6 }, (_, year) => oneTime + recurringAnnual * year);
    const discountedTco = Array.from({ length: 6 }, (_, year) => {
        const recurring = Array.from({ length: year }, (_, index) => index + 1).reduce((sum, currentYear) => sum + recurringAnnual / Math.pow(1 + DISCOUNT_RATE, currentYear), 0);
        return Math.round(oneTime + recurring);
    });
    return {
        structure: [
            { id: 'hardware', title: 'ТО', value: report.hardwareTotal },
            { id: 'software', title: 'ПО', value: report.softwareTotal },
            { id: 'one-time-opex', title: 'Разовые OPEX', value: report.oneTimeOperatingTotal },
            { id: 'recurring', title: 'Годовой OPEX', value: report.periodicTotalAnnual },
            { id: 'electricity', title: 'Энергия/год', value: report.electricityTotalAnnual },
        ].filter((item) => item.value > 0),
        annualBars: [
            { id: 'one-time', title: 'Старт', value: oneTime },
            { id: 'recurring', title: 'Годовые', value: recurringAnnual },
            { id: 'total', title: '1 год', value: report.grandTotalAnnual },
        ],
        cumulativeTco,
        discountedTco,
    };
}
