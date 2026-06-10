import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const menuPath = path.join(root, 'app/it-cost/(tabs)/menu.tsx');
const sectionsPath = path.join(root, 'components/SectionsMenu.tsx');
const tabsPath = path.join(root, 'app/generated/tabs.ts');

const fail = (message) => {
  console.error(`❌ Menu IT audit failed: ${message}`);
  process.exit(1);
};

const read = (file) => fs.readFileSync(file, 'utf8');
const menu = read(menuPath);
const sections = read(sectionsPath);
const tabs = read(tabsPath);

const topLevelRoutes = [
  '/it-cost/project_hub',
  '/it-cost/calculations_hub',
  '/it-cost/analytics_hub',
  '/it-cost/report_hub',
];

for (const route of topLevelRoutes) {
  if (!menu.includes(route)) fail(`top-level route ${route} is missing from Menu IT`);
}

const forbiddenTopLabels = ['Сводка</Text>', 'Проекты</Text>', 'Каталог</Text>', 'Копии</Text>', 'Графики</Text>', 'Демо</Text>', 'Очистить</Text>'];
for (const label of forbiddenTopLabels) {
  if (menu.includes(label)) fail(`old overloaded quick action is still visible in Menu IT: ${label}`);
}

const mustHave = ['С чего начать', 'Основные разделы', 'Начать расчёт', 'Загрузить пример', 'Новый расчёт'];
for (const label of mustHave) {
  if (!menu.includes(label)) fail(`new onboarding label is missing: ${label}`);
}

const sectionsMenuCallCount = (menu.match(/<SectionsMenu/g) ?? []).length;
if (sectionsMenuCallCount !== 0) {
  fail(`Menu IT should not render the full SectionsMenu directly anymore, found ${sectionsMenuCallCount}`);
}

const groupBlocks = [...sections.matchAll(/routes:\s*\[([\s\S]*?)\]/g)];
const groupedRoutes = groupBlocks.flatMap((match) => [...match[1].matchAll(/'([^']+)'/g)].map((routeMatch) => routeMatch[1]));
const duplicateGroupedRoutes = groupedRoutes.filter((route, index) => groupedRoutes.indexOf(route) !== index);
if (duplicateGroupedRoutes.length) {
  fail(`route is repeated across menu groups: ${[...new Set(duplicateGroupedRoutes)].join(', ')}`);
}

const registryRoutes = [...tabs.matchAll(/"route": "([^"]+)"/g)].map((match) => match[1]);
const allRoutes = new Set(registryRoutes);
for (const route of groupedRoutes) {
  if (!allRoutes.has(route)) fail(`grouped route ${route} is not present in generated route registry`);
}
for (const route of topLevelRoutes) {
  if (!allRoutes.has(route)) fail(`top-level route ${route} is not present in generated route registry`);
}

if (menu.includes('Быстрый доступ')) {
  fail('Menu IT must not duplicate root quick-access block');
}

console.log('✅ Menu IT audit ok: simplified top-level flow, hub routes and grouped registries are consistent');
