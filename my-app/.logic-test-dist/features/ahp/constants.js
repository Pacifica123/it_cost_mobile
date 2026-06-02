"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.M2 = exports.M1 = exports.DEFAULT_SOFT_CRITERIA = void 0;
exports.DEFAULT_SOFT_CRITERIA = [
    'avg_reliability',
    'total_performance',
    'total_cost',
    'total_energy',
    'lifespan',
];
exports.M1 = [
    [1, 3, 5, 4, 3],
    [1 / 3, 1, 3, 2, 2],
    [1 / 5, 1 / 3, 1, 0.5, 1 / 3],
    [1 / 4, 0.5, 2, 1, 0.5],
    [1 / 3, 0.5, 3, 2, 1],
];
exports.M2 = [
    [1, 2, 4, 3, 2],
    [0.5, 1, 2, 2, 1],
    [0.25, 0.5, 1, 0.5, 1 / 3],
    [1 / 3, 0.5, 2, 1, 0.5],
    [0.5, 1, 3, 2, 1],
];
