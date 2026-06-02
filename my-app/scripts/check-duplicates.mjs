import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const appDir = path.join(root, 'app');
const generatedTabsFile = path.join(appDir, 'generated', 'tabs.ts');
const exts = new Set(['.ts', '.tsx', '.js', '.jsx']);
const IGNORED_DIRS = new Set(['generated', 'styles', 'data', 'components', 'assets', 'node_modules']);
const ALLOWED_TABS = new Set(['menu', 'export']);
const EXPECTED_TAB_ROUTES = ['/it-cost/menu', '/it-cost/export'];

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function stripRouteGroups(route) {
  return route.replace(/\/\([^/]+\)/g, '');
}

function routeFromAppRel(relWithExtPosix) {
  const relNoExt = relWithExtPosix.replace(/\.[^.]+$/, '');
  const routePart = relNoExt.endsWith('/index') ? relNoExt.slice(0, -'/index'.length) : relNoExt;
  return stripRouteGroups(`/${routePart}`).replace(/\/\/+/, '/');
}

function isRoutableFile(filename) {
  if (filename.startsWith('_') || filename.startsWith('+')) return false;
  return exts.has(path.extname(filename));
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || IGNORED_DIRS.has(entry.name)) return [];
      return walkFiles(full);
    }
    return entry.isFile() && isRoutableFile(entry.name) ? [full] : [];
  });
}

function collectDuplicates(items, keyFn) {
  const groups = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()].filter(([, values]) => values.length > 1);
}

function extractStringArrayFromGenerated(name) {
  if (!fs.existsSync(generatedTabsFile)) return [];
  const src = fs.readFileSync(generatedTabsFile, 'utf8');
  const match = src.match(new RegExp(`export\\s+const\\s+${name}[^=]*=\\s+([\\s\\S]*?)\\s+as\\s+const;`));
  if (!match) return [];
  try {
    return JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`Не удалось прочитать ${name} из app/generated/tabs.ts: ${error.message}`);
  }
}

function readGeneratedScreens() {
  return [
    ...extractStringArrayFromGenerated('allTabScreens'),
    ...extractStringArrayFromGenerated('entryBlocks'),
    ...extractStringArrayFromGenerated('hiddenBlocks'),
  ];
}

function extractTitle(src) {
  const match = src.match(/export\s+const\s+(?:title|screenTitle)\s*=\s*["'`](.+?)["'`]/);
  return match?.[1]?.trim() ?? null;
}

function extractExportBoolean(src, name) {
  return new RegExp(`export\\s+const\\s+${name}\\s*=\\s*true\\s*;?`).test(src);
}

function readRouteFiles() {
  return walkFiles(appDir).map((absPath) => {
    const rel = toPosix(path.relative(appDir, absPath));
    const src = fs.readFileSync(absPath, 'utf8');
    return {
      rel,
      route: routeFromAppRel(rel),
      normalizedRoute: routeFromAppRel(rel).toLowerCase(),
      title: extractTitle(src),
      isTab: extractExportBoolean(src, 'tab') || extractExportBoolean(src, 'isTab'),
      isEntry: extractExportBoolean(src, 'entry') || extractExportBoolean(src, 'isEntry'),
    };
  });
}

function extractArrayObjectBlock(src, constName) {
  const start = src.indexOf(`export const ${constName}`);
  if (start === -1) return null;
  const arrayStart = src.indexOf('[', start);
  if (arrayStart === -1) return null;
  let depth = 0;
  for (let i = arrayStart; i < src.length; i += 1) {
    const char = src[i];
    if (char === '[') depth += 1;
    if (char === ']') depth -= 1;
    if (depth === 0) return src.slice(arrayStart, i + 1);
  }
  return null;
}

function extractObjectStringFields(block, field) {
  if (!block) return [];
  const regex = new RegExp(field + "\\s*:\\s*[\"'`](.*?)[\"'`]", 'g');
  return [...block.matchAll(regex)].map((match) => match[1].trim());
}

function extractInitialDataList(constName) {
  const defaultsPath = path.join(root, 'store', 'data', 'defaults.ts');
  if (!fs.existsSync(defaultsPath)) return [];
  const src = fs.readFileSync(defaultsPath, 'utf8');
  const block = extractArrayObjectBlock(src, constName);
  const ids = extractObjectStringFields(block, 'id');
  const names = extractObjectStringFields(block, 'name');
  return ids.map((id, index) => ({ id, name: names[index] ?? '', index }));
}

function formatDuplicateGroups(groups, labelFn) {
  return groups
    .map(([key, values]) => `- ${key}: ${values.map(labelFn).join(', ')}`)
    .join('\n');
}

function main() {
  const errors = [];
  const warnings = [];

  const routeFiles = readRouteFiles();
  const itCostRouteFiles = routeFiles.filter((file) => file.route.startsWith('/it-cost'));
  const generatedScreens = readGeneratedScreens();
  const generatedUnique = new Map();
  for (const screen of generatedScreens) generatedUnique.set(`${screen.route}|${screen.title}|${screen.id}`, screen);
  const generated = [...generatedUnique.values()];

  const routeDuplicates = collectDuplicates(routeFiles, (file) => file.normalizedRoute);
  if (routeDuplicates.length) {
    errors.push(`Повторяющиеся маршруты после удаления route group:\n${formatDuplicateGroups(routeDuplicates, (file) => file.rel)}`);
  }

  const screenRouteDuplicates = collectDuplicates(generated, (screen) => screen.route.toLowerCase());
  if (screenRouteDuplicates.length) {
    errors.push(`Повторяющиеся route в app/generated/tabs.ts:\n${formatDuplicateGroups(screenRouteDuplicates, (screen) => screen.title)}`);
  }

  const screenTitleDuplicates = collectDuplicates(generated, (screen) => screen.title.trim().toLowerCase());
  if (screenTitleDuplicates.length) {
    errors.push(`Повторяющиеся названия экранов в app/generated/tabs.ts:\n${formatDuplicateGroups(screenTitleDuplicates, (screen) => screen.route)}`);
  }

  const tabs = extractStringArrayFromGenerated('allTabScreens');
  const tabRoutes = tabs.filter((screen) => screen.isTab).map((screen) => screen.route);
  const unexpectedTabs = tabRoutes.filter((route) => !EXPECTED_TAB_ROUTES.includes(route));
  const missingTabs = EXPECTED_TAB_ROUTES.filter((route) => !tabRoutes.includes(route));
  if (unexpectedTabs.length || missingTabs.length || tabRoutes.length !== EXPECTED_TAB_ROUTES.length) {
    errors.push(
      `Нижние вкладки должны быть только ${EXPECTED_TAB_ROUTES.join(', ')}. Сейчас: ${tabRoutes.join(', ') || 'нет'}`
    );
  }

  const tabDirRoutes = itCostRouteFiles.filter((file) => file.rel.startsWith('it-cost/(tabs)/'));
  const unexpectedTabFiles = tabDirRoutes.filter((file) => !ALLOWED_TABS.has(path.basename(file.rel, path.extname(file.rel))));
  if (unexpectedTabFiles.length) {
    errors.push(
      `В app/it-cost/(tabs) есть лишние routable-файлы:\n${unexpectedTabFiles.map((file) => `- ${file.rel}`).join('\n')}`
    );
  }

  const titledItCostFiles = itCostRouteFiles.filter((file) => file.title);
  const missingGenerated = titledItCostFiles.filter((file) => !generated.some((screen) => screen.route.toLowerCase() === file.route.toLowerCase()));
  const ignoredAllowed = new Set(['/it-cost/menu', '/it-cost/export']);
  const realMissingGenerated = missingGenerated.filter((file) => !ignoredAllowed.has(file.route));
  if (realMissingGenerated.length) {
    warnings.push(`Есть it-cost экраны с title, которых нет в generated registry:\n${realMissingGenerated.map((file) => `- ${file.rel} (${file.route})`).join('\n')}`);
  }

  const capitalDefaults = extractInitialDataList('capitalData');
  const operatingDefaults = extractInitialDataList('operatingData');
  const categoryDefaults = extractInitialDataList('initialCategories');
  const defaultChecks = [
    ['категории', categoryDefaults],
    ['CAPEX demo', capitalDefaults],
    ['OPEX demo', operatingDefaults],
  ];
  for (const [label, items] of defaultChecks) {
    const idDuplicates = collectDuplicates(items, (item) => item.id);
    if (idDuplicates.length) {
      errors.push(`Повторяющиеся id в ${label}:\n${formatDuplicateGroups(idDuplicates, (item) => item.name || `#${item.index + 1}`)}`);
    }
    const nameDuplicates = collectDuplicates(items, (item) => item.name.trim().toLowerCase());
    if (nameDuplicates.length) {
      warnings.push(`Повторяющиеся названия в ${label}:\n${formatDuplicateGroups(nameDuplicates, (item) => item.id)}`);
    }
  }

  if (warnings.length) {
    console.warn('⚠️ Duplicate audit warnings:');
    for (const warning of warnings) console.warn(warning);
  }

  if (errors.length) {
    console.error('❌ Duplicate audit failed:');
    for (const error of errors) console.error(error);
    process.exit(1);
  }

  console.log('✅ Duplicate audit ok: routes, tab registry, titles and demo ids are unique');
}

main();
