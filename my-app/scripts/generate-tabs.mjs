import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const appDir = path.join(projectRoot, "app");
const outDir = path.join(appDir, "generated");
const outFile = path.join(outDir, "tabs.ts");

const exts = new Set([".ts", ".tsx", ".js", ".jsx"]);

function isRoutableFile(filename) {
  if (filename.startsWith("_") || filename.startsWith("+")) return false;
  return exts.has(path.extname(filename));
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const e of entries) {
    const full = path.join(dir, e.name);

    if (e.isDirectory()) {
      files.push(...walk(full));
    } else if (e.isFile() && isRoutableFile(e.name)) {
      files.push(full);
    }
  }

  return files;
}

function walkDirs(dir) {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const dirs = [];

  for (const e of entries) {
    if (!e.isDirectory()) continue;

    if (
      e.name.startsWith(".") ||
      e.name === "generated" ||
      e.name === "styles" ||
      e.name === "data" ||
      e.name === "components" ||
      e.name === "assets" ||
      e.name === "node_modules"
    ) {
      continue;
    }

    const full = path.join(dir, e.name);
    dirs.push(full);
    dirs.push(...walkDirs(full));
  }

  return dirs;
}

function findTabsDirs() {
  if (!fs.existsSync(appDir)) return [];
  const allDirs = [appDir, ...walkDirs(appDir)];
  return allDirs.filter((d) => path.basename(d) === "(tabs)");
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function stripRouteGroups(route) {
  return route.replace(/\/\([^/]+\)/g, "");
}

function makeRouteFromRel(relWithExtPosix) {
  const relNoExt = relWithExtPosix.replace(/\.[^.]+$/, "");
  const routePart = relNoExt.endsWith("/index")
    ? relNoExt.slice(0, -"/index".length)
    : relNoExt;

  return stripRouteGroups(`/${routePart}`).replace(/\/\/+/g, "/");
}

function tryExtractTitle(src) {
  const patterns = [
    /export\s+const\s+title\s*=\s*["'`](.+?)["'`]\s*;?/,
    /export\s+const\s+screenTitle\s*=\s*["'`](.+?)["'`]\s*;?/,
  ];

  for (const pattern of patterns) {
    const m = src.match(pattern);
    if (m?.[1]?.trim()) return m[1].trim();
  }

  return null;
}

function tryExtractTabFlag(src) {
  const patterns = [
    /export\s+const\s+tab\s*=\s*true\s*;?/,
    /export\s+const\s+isTab\s*=\s*true\s*;?/,
  ];

  return patterns.some((pattern) => pattern.test(src));
}

function tryExtractEntryFlag(src) {
  const patterns = [
    /export\s+const\s+entry\s*=\s*true\s*;?/,
    /export\s+const\s+isEntry\s*=\s*true\s*;?/,
  ];

  return patterns.some((pattern) => pattern.test(src));
}

function getFeatureGroup(absPath) {
  const rel = toPosix(path.relative(appDir, absPath));
  const parts = rel.split("/");
  const tabsIdx = parts.indexOf("(tabs)");

  if (tabsIdx !== -1) {
    return stripRouteGroups("/" + parts.slice(0, tabsIdx + 1).join("/")) || "/";
  }

  return "/";
}

function parseFiles(files) {
  return files
    .map((abs) => {
      const rel = path.relative(appDir, abs);
      const relPosix = toPosix(rel);
      const src = fs.readFileSync(abs, "utf8");
      const title = tryExtractTitle(src);

      if (!title) return null;

      return {
        id: makeRouteFromRel(relPosix),
        name: path.basename(abs, path.extname(abs)),
        title,
        route: makeRouteFromRel(relPosix),
        group: getFeatureGroup(abs),
        isTab: tryExtractTabFlag(src),
        isEntry: tryExtractEntryFlag(src),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title, "ru"));
}

function main() {
  const tabsDirs = findTabsDirs();

  if (tabsDirs.length === 0) {
    console.error(`❌ Не найдено ни одной папки "(tabs)" внутри: ${appDir}`);
    process.exit(1);
  }

  const files = tabsDirs.flatMap((d) => walk(d));
  const parsed = parseFiles(files);

  const главныеЭкраны = parsed
    .filter((b) => b.isEntry)
    .map((b) => ({
      id: b.id,
      title: b.title,
      route: b.route,
      group: b.group,
    }));

const скрытыеЭкраны = parsed
  .filter((b) => !b.isEntry && !b.isTab)
  .map((b) => ({
    id: b.id,
    title: b.title,
    route: b.route,
    group: b.group,
  }));

  const всеЭкраныТабов = parsed.map((b) => ({
    id: b.id,
    name: b.name,
    title: b.title,
    route: b.route,
    group: b.group,
    isTab: b.isTab,
    isEntry: b.isEntry,
  }));

  fs.mkdirSync(outDir, { recursive: true });

  const ts = `/* eslint-disable */
// AUTO-GENERATED FILE. DO NOT EDIT.

import type { Href } from "expo-router";

export type ЭкранТаба = {
  id: string;
  name: string;
  title: string;
  route: Href;
  group?: string;
  isTab: boolean;
  isEntry: boolean;
};

export type ПунктЭкрана = {
  id: string;
  title: string;
  route: Href;
  group?: string;
};

export const всеЭкраныТабов: ЭкранТаба[] = ${JSON.stringify(всеЭкраныТабов, null, 2)} as const;
export const главныеЭкраны: ПунктЭкрана[] = ${JSON.stringify(главныеЭкраны, null, 2)} as const;
export const скрытыеЭкраны: ПунктЭкрана[] = ${JSON.stringify(скрытыеЭкраны, null, 2)} as const;

// Английские алиасы для совместимости
export type TabBlock = ЭкранТаба;
export type BlockItem = ПунктЭкрана;

export const allTabScreens = всеЭкраныТабов;
export const entryBlocks = главныеЭкраны;
export const hiddenBlocks = скрытыеЭкраны;
`;

  fs.writeFileSync(outFile, ts, "utf8");
  console.log(`✅ Generated ${path.relative(projectRoot, outFile)}`);
}

main();