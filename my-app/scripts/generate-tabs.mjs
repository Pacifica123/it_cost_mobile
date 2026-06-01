import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const appDir = path.join(projectRoot, 'app');
const outDir = path.join(appDir, 'generated');
const outFile = path.join(outDir, 'tabs.ts');

const exts = new Set(['.ts', '.tsx', '.js', '.jsx']);
const IGNORED_DIRS = new Set(['generated', 'styles', 'data', 'components', 'assets', 'node_modules']);
const MENU_ORDER = [
  '/it-cost/project',
  '/it-cost/templates',
  '/it-cost/quick_start',
  '/it-cost/project_io',
  '/it-cost/history',
  '/it-cost/validation',
  '/it-cost/it_infrastructure',
  '/it-cost/capital_expenditures',
  '/it-cost/criteria_importance',
  '/it-cost/operating_expenses',
  '/it-cost/software',
  '/it-cost/technical_equipment',
  '/it-cost/electricity',
  '/it-cost/ahp',
  '/it-cost/NPV',
  '/it-cost/genetic_optimization',
  '/it-cost/method_comparison',
];
const TAB_ORDER = ['/it-cost/menu', '/it-cost/export'];
const LEGACY_TAB_ROUTE_FILES = new Set([
  'NPV',
  'ahp',
  'capital_expenditures',
  'criteria_importance',
  'electricity',
  'genetic_optimization',
  'it_infrastructure',
  'operating_expenses',
  'software',
  'technical_equipment',
]);

function isRoutableFile(filename) {
  if (filename.startsWith('_') || filename.startsWith('+')) return false;
  return exts.has(path.extname(filename));
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function stripRouteGroups(route) {
  return route.replace(/\/\([^/]+\)/g, '');
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || IGNORED_DIRS.has(entry.name)) {
        return [];
      }

      return walkFiles(full);
    }

    return entry.isFile() && isRoutableFile(entry.name) ? [full] : [];
  });
}

function isLegacyItCostTabRoute(relWithExtPosix) {
  const relNoExt = relWithExtPosix.replace(/\.[^.]+$/, '');
  const parts = relNoExt.split('/');

  return (
    parts[0] === 'it-cost' &&
    parts[1] === '(tabs)' &&
    LEGACY_TAB_ROUTE_FILES.has(parts.at(-1))
  );
}

function makeRouteFromRel(relWithExtPosix) {
  const relNoExt = relWithExtPosix.replace(/\.[^.]+$/, '');
  const routePart = relNoExt.endsWith('/index') ? relNoExt.slice(0, -'/index'.length) : relNoExt;
  return stripRouteGroups(`/${routePart}`).replace(/\/\/+/g, '/');
}

function tryExtractTitle(src) {
  const patterns = [
    /export\s+const\s+title\s*=\s*["'`](.+?)["'`]\s*;?/,
    /export\s+const\s+screenTitle\s*=\s*["'`](.+?)["'`]\s*;?/,
  ];

  for (const pattern of patterns) {
    const match = src.match(pattern);
    if (match?.[1]?.trim()) return match[1].trim();
  }

  return null;
}

function hasBooleanExport(src, names) {
  return names.some((name) => new RegExp(`export\\s+const\\s+${name}\\s*=\\s*true\\s*;?`).test(src));
}

function getFeatureGroup(route) {
  const parts = route.split('/').filter(Boolean);
  if (parts.length <= 1) return '/';
  return `/${parts[0]}`;
}

function orderIndex(route, order) {
  const index = order.indexOf(route);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function parseFiles(files) {
  return files
    .map((absPath) => {
      const relPosix = toPosix(path.relative(appDir, absPath));

      if (isLegacyItCostTabRoute(relPosix)) return null;

      const src = fs.readFileSync(absPath, 'utf8');
      const title = tryExtractTitle(src);

      if (!title) return null;

      const route = makeRouteFromRel(relPosix);
      const name = path.basename(absPath, path.extname(absPath));

      return {
        id: route,
        name,
        title,
        route,
        group: getFeatureGroup(route),
        isTab: hasBooleanExport(src, ['tab', 'isTab']),
        isEntry: hasBooleanExport(src, ['entry', 'isEntry']),
      };
    })
    .filter(Boolean)
    .filter((screen) => screen.route.startsWith('/it-cost/'));
}

function main() {
  const parsed = parseFiles(walkFiles(appDir));
  const tabScreens = parsed
    .filter((screen) => screen.isTab)
    .sort((a, b) => orderIndex(a.route, TAB_ORDER) - orderIndex(b.route, TAB_ORDER) || a.title.localeCompare(b.title, 'ru'));
  const entryScreens = parsed
    .filter((screen) => screen.isEntry)
    .sort((a, b) => orderIndex(a.route, TAB_ORDER) - orderIndex(b.route, TAB_ORDER) || a.title.localeCompare(b.title, 'ru'))
    .map(({ id, title, route, group }) => ({ id, title, route, group }));
  const hiddenScreens = parsed
    .filter((screen) => !screen.isEntry && !screen.isTab)
    .sort((a, b) => orderIndex(a.route, MENU_ORDER) - orderIndex(b.route, MENU_ORDER) || a.title.localeCompare(b.title, 'ru'))
    .map(({ id, title, route, group }) => ({ id, title, route, group }));

  fs.mkdirSync(outDir, { recursive: true });

  const ts = `/* eslint-disable */
// AUTO-GENERATED FILE. DO NOT EDIT.

export type TabScreen = {
  id: string;
  name: string;
  title: string;
  route: string;
  group?: string;
  isTab: boolean;
  isEntry: boolean;
};

export type ScreenLink = {
  id: string;
  title: string;
  route: string;
  group?: string;
};

export const allTabScreens: TabScreen[] = ${JSON.stringify(tabScreens, null, 2)} as const;
export const entryBlocks: ScreenLink[] = ${JSON.stringify(entryScreens, null, 2)} as const;
export const hiddenBlocks: ScreenLink[] = ${JSON.stringify(hiddenScreens, null, 2)} as const;
`;

  fs.writeFileSync(outFile, ts, 'utf8');
  console.log(`✅ Generated ${path.relative(projectRoot, outFile)}`);
}

main();
