import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const appDir = path.join(projectRoot, 'app', 'it-cost');
const tabsDir = path.join(appDir, '(tabs)');
const generatedFile = path.join(projectRoot, 'app', 'generated', 'tabs.ts');
const sectionsMenuFile = path.join(projectRoot, 'components', 'SectionsMenu.tsx');
const screenDirs = ['app', 'features', 'components', 'shared', 'store'];
const errors = [];

const read = (file) => fs.readFileSync(file, 'utf8');
const exists = (file) => fs.existsSync(file);

function walk(dir, acc = []) {
  if (!exists(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!['node_modules', '.expo', '.logic-test-dist'].includes(name)) walk(full, acc);
    } else if (/\.(ts|tsx|js|mjs)$/.test(name)) {
      acc.push(full);
    }
  }
  return acc;
}

function physicalFileForRoute(route) {
  const short = route.replace('/it-cost/', '');
  const inRoot = path.join(appDir, `${short}.tsx`);
  const inTabs = path.join(tabsDir, `${short}.tsx`);
  if (exists(inRoot)) return inRoot;
  if (exists(inTabs)) return inTabs;
  return null;
}

const screenFiles = [
  ...fs.readdirSync(appDir).filter((name) => name.endsWith('.tsx')).map((name) => path.join(appDir, name)),
  ...fs.readdirSync(tabsDir).filter((name) => name.endsWith('.tsx')).map((name) => path.join(tabsDir, name)),
].filter((file) => !file.endsWith('_layout.tsx'));

for (const file of screenFiles) {
  const source = read(file);
  if (!/export\s+default\s+function|export\s+default\s+/.test(source)) {
    errors.push(`screen without default export: ${path.relative(projectRoot, file)}`);
  }
  if (!/export\s+const\s+title\s*=/.test(source)) {
    errors.push(`screen without title export: ${path.relative(projectRoot, file)}`);
  }
}

const generated = read(generatedFile);
const routeMatches = [...generated.matchAll(/"route":\s*"(\/it-cost\/[^"]+)"/g)].map((match) => match[1]);
for (const route of new Set(routeMatches)) {
  if (!physicalFileForRoute(route)) {
    errors.push(`generated route has no screen file: ${route}`);
  }
}

const allCode = screenDirs.flatMap((dir) => walk(path.join(projectRoot, dir)));
const routeLiteralPattern = /['"](\/it-cost\/[A-Za-z0-9_/-]+)['"]/g;
for (const file of allCode) {
  const source = read(file);
  for (const match of source.matchAll(routeLiteralPattern)) {
    const route = match[1];
    if (route.includes('(tabs)')) continue;
    if (!physicalFileForRoute(route) && route !== '/it-cost/menu' && route !== '/it-cost/export') {
      errors.push(`route literal points to missing screen: ${route} in ${path.relative(projectRoot, file)}`);
    }
  }
}

const sectionsMenu = read(sectionsMenuFile);
const menuRoutes = new Set([...sectionsMenu.matchAll(/'((?:\/it-cost\/)[^']+)'/g)].map((match) => match[1]));
for (const route of new Set(routeMatches)) {
  if (route === '/it-cost/menu' || route === '/it-cost/export') continue;
  if (!menuRoutes.has(route)) {
    errors.push(`registered screen is not present in menu groups: ${route}`);
  }
}

const forbiddenPatterns = [
  /TODO(?!\s*Auto-generated)/i,
  /FIXME/i,
  /coming soon/i,
  /not implemented/i,
  /не реализовано/i,
  /заглушка/i,
  /onPress=\{\s*\(\)\s*=>\s*\{\s*\}\s*\}/,
  /onPress=\{undefined\}/,
];
for (const file of allCode) {
  const source = read(file);
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(source)) {
      errors.push(`possible unfinished functionality (${pattern}) in ${path.relative(projectRoot, file)}`);
    }
  }
}

if (errors.length) {
  console.error('❌ Functionality audit failed');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('✅ Functionality audit ok: screens, menu links, route literals and unfinished stubs checked');
