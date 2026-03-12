// scripts/generate-tabs.mjs
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const appDir = path.join(projectRoot, "app");
const outDir = path.join(appDir, "generated");
const outFile = path.join(outDir, "tabs.ts");

const exts = new Set([".ts", ".tsx", ".js", ".jsx"]);

function isRoutableFile(filename) {
  if (filename.startsWith("_") || filename.startsWith("+")) return false;
  const ext = path.extname(filename);
  return exts.has(ext);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else if (e.isFile() && isRoutableFile(e.name)) files.push(full);
  }
  return files;
}

function walkDirs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const dirs = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;

    if (
      e.name.startsWith(".") ||
      e.name === "generated" ||
      e.name === "styles" ||
      e.name === "data" ||
      e.name === "components"
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

function tryExtractTitle(src) {
  const m = src.match(/export\s+const\s+title\s*=\s*["'`](.+?)["'`]\s*;?/);
  return m?.[1]?.trim() || null;
}

function tryExtractEntryFlag(src) {
  const m = src.match(/export\s+const\s+(entry|isEntry)\s*=\s*true\s*;?/);
  return Boolean(m);
}

function tryExtractEntryTitle(src) {
  const m = src.match(/export\s+const\s+entryTitle\s*=\s*["'`](.+?)["'`]\s*;?/);
  return m?.[1]?.trim() || null;
}

function makeRouteFromRel(relWithExtPosix) {
  const relNoExt = relWithExtPosix.replace(/\.[^.]+$/, "");
  const routePart = relNoExt.endsWith("/index")
    ? relNoExt.slice(0, -"/index".length)
    : relNoExt;

  return `/${routePart}`.replace(/\/\/+/g, "/");
}

function groupKeyFromRoute(route) {
  // "/finance/(tabs)/menu" -> "/finance/(tabs)"
  // "/(tabs)/menu" -> "/(tabs)"
  const parts = route.split("/").filter(Boolean);
  const idx = parts.indexOf("(tabs)");
  if (idx === -1) return "/"; // если вдруг файл вне tabs
  return "/" + parts.slice(0, idx + 1).join("/");
}

function main() {
  const tabsDirs = findTabsDirs();
  if (tabsDirs.length === 0) {
    console.error(`❌ Не найдено ни одной папки "(tabs)" внутри: ${appDir}`);
    process.exit(1);
  }

  const files = tabsDirs.flatMap((d) => walk(d));

  const allBlocks = files
    .map((abs) => {
      const rel = path.relative(appDir, abs);
      const relPosix = toPosix(rel);

      const baseName = path.basename(abs, path.extname(abs)); // menu / index / NPV etc.
      const src = fs.readFileSync(abs, "utf8");

      const title = tryExtractTitle(src);
      if (!title) return null;

      const route = makeRouteFromRel(relPosix);
      const group = groupKeyFromRoute(route);

      const isEntry = tryExtractEntryFlag(src) || baseName === "menu";
      const entryTitle = tryExtractEntryTitle(src);

      return {
        id: route,
        title,
        route,
        group,
        baseName,
        isEntry,
        entryTitle: entryTitle || null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title, "ru"));

  // Все экраны (как было)
  const tabBlocks = allBlocks.map((b) => ({
    id: b.id,
    title: b.title,
    route: b.route,
    group: b.group,
  }));

  // Точки входа (как было)
  const entryBlocks = allBlocks
    .filter((b) => b.isEntry)
    .map((b) => ({
      id: b.id,
      title: b.entryTitle || b.title,
      route: b.route,
      group: b.group,
    }));

  // Группировка экранов
  const screenGroupsMap = new Map();
  for (const b of allBlocks) {
    // Обычно меню не хотят видеть внутри меню:
    if (b.baseName === "menu") continue;

    if (!screenGroupsMap.has(b.group)) screenGroupsMap.set(b.group, []);
    screenGroupsMap.get(b.group).push({
      id: b.id,
      title: b.title,
      route: b.route,
    });
  }

  // Группировка entry
  const entryGroupsMap = new Map();
  for (const b of entryBlocks) {
    if (!entryGroupsMap.has(b.group)) entryGroupsMap.set(b.group, []);
    entryGroupsMap.get(b.group).push({
      id: b.id,
      title: b.title,
      route: b.route,
    });
  }

  // Сортировки внутри групп
  for (const arr of screenGroupsMap.values()) {
    arr.sort((a, b) => a.title.localeCompare(b.title, "ru"));
  }
  for (const arr of entryGroupsMap.values()) {
    arr.sort((a, b) => a.title.localeCompare(b.title, "ru"));
  }

  const screenGroups = Array.from(screenGroupsMap.entries())
    .map(([group, items]) => ({ group, items }))
    .sort((a, b) => a.group.localeCompare(b.group, "ru"));

  const entryGroups = Array.from(entryGroupsMap.entries())
    .map(([group, items]) => ({ group, items }))
    .sort((a, b) => a.group.localeCompare(b.group, "ru"));

  fs.mkdirSync(outDir, { recursive: true });

  const ts = `/* eslint-disable */
// AUTO-GENERATED FILE. DO NOT EDIT.
// Generated by scripts/generate-tabs.mjs

import type { Href } from "expo-router";

export type BlockItem = {
  id: string;
  title: string;
  route: Href;
  group?: string;
};

export type GroupedBlocks = {
  group: string;
  items: Omit<BlockItem, "group">[];
};

// Точки входа (для главного меню)
export const entryBlocks: BlockItem[] = ${JSON.stringify(entryBlocks, null, 2)} as const;

// Все экраны, у которых задан title
export const tabBlocks: BlockItem[] = ${JSON.stringify(tabBlocks, null, 2)} as const;

// Группы точек входа (по пути до "(tabs)")
export const entryGroups: GroupedBlocks[] = ${JSON.stringify(entryGroups, null, 2)} as const;

// Группы экранов (по пути до "(tabs)")
export const screenGroups: GroupedBlocks[] = ${JSON.stringify(screenGroups, null, 2)} as const;
`;

  fs.writeFileSync(outFile, ts, "utf8");
  console.log(
    `✅ Generated ${path.relative(projectRoot, outFile)} (tabs: ${tabBlocks.length}, entries: ${entryBlocks.length}, screenGroups: ${screenGroups.length}, entryGroups: ${entryGroups.length})`
  );
}

main();