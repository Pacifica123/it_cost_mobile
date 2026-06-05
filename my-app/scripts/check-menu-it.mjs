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

const quickRoutesMatch = menu.match(/const MAIN_QUICK_ACTION_ROUTES = \[([\s\S]*?)\];/);
if (!quickRoutesMatch) fail('MAIN_QUICK_ACTION_ROUTES is missing');

const quickRoutes = [...quickRoutesMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
const uniqueQuickRoutes = new Set(quickRoutes);
if (quickRoutes.length !== uniqueQuickRoutes.size) {
  fail(`duplicate quick-action route in Menu IT: ${quickRoutes.join(', ')}`);
}

const pushedRoutes = [...menu.matchAll(/router\.push\('([^']+)' as Href\)/g)].map((match) => match[1]);
for (const route of pushedRoutes) {
  if (!uniqueQuickRoutes.has(route) && !route.includes('nextStep')) {
    fail(`quick-action route ${route} is not listed in MAIN_QUICK_ACTION_ROUTES`);
  }
}

const excludeUsage = menu.includes('excludeRoutes={MAIN_QUICK_ACTION_ROUTES}');
if (!excludeUsage) fail('SectionsMenu must exclude MAIN_QUICK_ACTION_ROUTES to avoid visual duplicates');

const sectionsMenuCallCount = (menu.match(/<SectionsMenu/g) ?? []).length;
if (sectionsMenuCallCount !== 1) {
  fail(`Menu IT should render exactly one SectionsMenu, found ${sectionsMenuCallCount}`);
}

const rootServiceRoutes = ['/it-cost/settings', '/it-cost/diagnostics', '/it-cost/app_update'];
for (const route of rootServiceRoutes) {
  if (!uniqueQuickRoutes.has(route)) fail(`root service route ${route} is not excluded from Menu IT list`);
}

const groupBlocks = [...sections.matchAll(/routes:\s*\[([\s\S]*?)\]/g)];
const groupedRoutes = groupBlocks.flatMap((match) => [...match[1].matchAll(/'([^']+)'/g)].map((routeMatch) => routeMatch[1]));
const duplicateGroupedRoutes = groupedRoutes.filter((route, index) => groupedRoutes.indexOf(route) !== index);
if (duplicateGroupedRoutes.length) {
  fail(`route is repeated across menu groups: ${[...new Set(duplicateGroupedRoutes)].join(', ')}`);
}

const hiddenRoutes = [...tabs.matchAll(/"route": "([^"]+)"/g)].map((match) => match[1]);
const allRoutes = new Set(hiddenRoutes);
for (const route of groupedRoutes) {
  if (!allRoutes.has(route)) fail(`grouped route ${route} is not present in generated route registry`);
}
for (const route of quickRoutes) {
  if (!allRoutes.has(route)) fail(`quick-action route ${route} is not present in generated route registry`);
}

if (menu.includes('Быстрый доступ')) {
  fail('Menu IT must not duplicate root quick-access block');
}

console.log('✅ Menu IT audit ok: quick actions, groups, exclusions and route registry are consistent');
