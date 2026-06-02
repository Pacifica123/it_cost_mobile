import { compareVersions, normalizeVersionTag, type VersionCompareResult } from './version';

export type GithubUpdateConfig = {
  owner: string;
  repo: string;
  branch?: string;
  currentVersion: string;
};

export type GithubUpdateAsset = {
  name: string;
  url: string;
  size?: number;
};

export type GithubUpdateInfo = {
  ok: boolean;
  source: 'release' | 'app-json' | 'package-json' | 'none';
  owner: string;
  repo: string;
  currentVersion: string;
  latestVersion: string | null;
  compare: VersionCompareResult;
  hasUpdate: boolean;
  title: string;
  message: string;
  checkedAt: string;
  url?: string;
  downloadUrl?: string;
  assets: GithubUpdateAsset[];
  diagnostics: string[];
};

type HttpJsonResult =
  | { ok: true; data: unknown; status: number; url: string }
  | { ok: false; data: null; status: number | null; url: string; error: string };

const trimSlash = (value: string) => value.replace(/^\/+|\/+$/g, '');

const buildRepoUrl = (owner: string, repo: string) => `https://github.com/${trimSlash(owner)}/${trimSlash(repo)}`;
const buildLatestReleaseUrl = (owner: string, repo: string) => `${buildRepoUrl(owner, repo)}/releases/latest`;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function pickDownloadUrl(assets: GithubUpdateAsset[]) {
  return assets.find((asset) => /\.(apk|aab|ipa|zip)$/i.test(asset.name))?.url ?? assets[0]?.url;
}

async function fetchJson(url: string): Promise<HttpJsonResult> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json, application/json, text/plain;q=0.8',
        'User-Agent': 'it-cost-mobile-update-check',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      return { ok: false, data: null, status: response.status, url, error: `HTTP ${response.status}` };
    }

    const text = await response.text();
    try {
      return { ok: true, data: JSON.parse(text), status: response.status, url };
    } catch {
      return { ok: false, data: null, status: response.status, url, error: 'Ответ не является JSON' };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Сетевая ошибка';
    return { ok: false, data: null, status: null, url, error: message };
  }
}

function buildResult(input: {
  config: GithubUpdateConfig;
  source: GithubUpdateInfo['source'];
  latestVersion: string | null;
  title: string;
  message?: string;
  url?: string;
  assets?: GithubUpdateAsset[];
  diagnostics?: string[];
}): GithubUpdateInfo {
  const latestVersion = input.latestVersion ? normalizeVersionTag(input.latestVersion) : null;
  const compare = latestVersion ? compareVersions(input.config.currentVersion, latestVersion) : 'unknown';
  const assets = input.assets ?? [];

  return {
    ok: Boolean(latestVersion),
    source: input.source,
    owner: input.config.owner,
    repo: input.config.repo,
    currentVersion: input.config.currentVersion,
    latestVersion,
    compare,
    hasUpdate: compare === 'newer',
    title: input.title,
    message: input.message ?? '',
    checkedAt: new Date().toISOString(),
    url: input.url,
    downloadUrl: pickDownloadUrl(assets),
    assets,
    diagnostics: input.diagnostics ?? [],
  };
}

function releaseToResult(
  release: Record<string, unknown>,
  config: GithubUpdateConfig,
  owner: string,
  repo: string,
  diagnostics: string[]
) {
  const tagName = typeof release.tag_name === 'string' ? release.tag_name : '';
  const name = typeof release.name === 'string' ? release.name : tagName || 'Последний релиз';
  const htmlUrl = typeof release.html_url === 'string' ? release.html_url : buildLatestReleaseUrl(owner, repo);
  const assets = Array.isArray(release.assets)
    ? release.assets
        .filter(isObject)
        .map((asset) => ({
          name: typeof asset.name === 'string' ? asset.name : 'asset',
          url: typeof asset.browser_download_url === 'string' ? asset.browser_download_url : '',
          size: typeof asset.size === 'number' ? asset.size : undefined,
        }))
        .filter((asset) => asset.url)
    : [];

  if (!tagName) return null;

  return buildResult({
    config,
    source: 'release',
    latestVersion: tagName,
    title: name,
    message: assets.length
      ? 'Версия проверена через GitHub Releases. Файл сборки найден в assets релиза.'
      : 'Версия проверена через GitHub Releases. Файл сборки к релизу не прикреплён.',
    url: htmlUrl,
    assets,
    diagnostics,
  });
}

function extractVersionFromManifest(data: unknown): string {
  if (!isObject(data)) return '';
  const expo = isObject(data.expo) ? data.expo : null;
  const version = typeof expo?.version === 'string' ? expo.version : typeof data.version === 'string' ? data.version : '';
  return version;
}

async function readRepoDefaultBranch(owner: string, repo: string, diagnostics: string[]) {
  const repoMetaUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const result = await fetchJson(repoMetaUrl);
  if (!result.ok) {
    diagnostics.push(`Метаданные репозитория: ${result.error}.`);
    return null;
  }
  if (!isObject(result.data)) return null;
  const defaultBranch = typeof result.data.default_branch === 'string' ? result.data.default_branch : null;
  if (defaultBranch) diagnostics.push(`Основная ветка репозитория: ${defaultBranch}.`);
  return defaultBranch;
}

function uniqueValues(values: string[]) {
  return values.filter((value, index, list) => Boolean(value) && list.indexOf(value) === index);
}

async function readManifestVersion(input: {
  owner: string;
  repo: string;
  branches: string[];
  config: GithubUpdateConfig;
  diagnostics: string[];
}) {
  const appJsonPaths = ['app.json', 'package/app.json', 'ITCostMobile/app.json', 'itcostmobile/app.json'];
  const packageJsonPaths = ['package.json', 'package/package.json', 'ITCostMobile/package.json', 'itcostmobile/package.json'];

  for (const branch of input.branches) {
    for (const path of appJsonPaths) {
      const url = `https://raw.githubusercontent.com/${input.owner}/${input.repo}/${branch}/${path}`;
      const result = await fetchJson(url);
      if (!result.ok) {
        input.diagnostics.push(`${branch}/${path}: ${result.error}.`);
        continue;
      }

      const version = extractVersionFromManifest(result.data);
      if (!version) {
        input.diagnostics.push(`${branch}/${path}: поле version не найдено.`);
        continue;
      }

      return buildResult({
        config: input.config,
        source: 'app-json',
        latestVersion: version,
        title: `${path} · ${branch}`,
        message: 'Релиз не найден, версия прочитана из app.json в репозитории.',
        url: `${buildRepoUrl(input.owner, input.repo)}/blob/${branch}/${path}`,
        diagnostics: input.diagnostics,
      });
    }

    for (const path of packageJsonPaths) {
      const url = `https://raw.githubusercontent.com/${input.owner}/${input.repo}/${branch}/${path}`;
      const result = await fetchJson(url);
      if (!result.ok) {
        input.diagnostics.push(`${branch}/${path}: ${result.error}.`);
        continue;
      }

      const version = extractVersionFromManifest(result.data);
      if (!version) {
        input.diagnostics.push(`${branch}/${path}: поле version не найдено.`);
        continue;
      }

      return buildResult({
        config: input.config,
        source: 'package-json',
        latestVersion: version,
        title: `${path} · ${branch}`,
        message: 'Релиз и app.json не найдены, версия прочитана из package.json в репозитории.',
        url: `${buildRepoUrl(input.owner, input.repo)}/blob/${branch}/${path}`,
        diagnostics: input.diagnostics,
      });
    }
  }

  return null;
}

export async function checkGithubUpdate(config: GithubUpdateConfig): Promise<GithubUpdateInfo> {
  const owner = trimSlash(config.owner.trim());
  const repo = trimSlash(config.repo.trim());
  const normalizedConfig = { ...config, owner, repo };
  const diagnostics: string[] = [];

  if (!owner || !repo) {
    return buildResult({
      config: normalizedConfig,
      source: 'none',
      latestVersion: null,
      title: 'Репозиторий не указан',
      message: 'Укажите owner и repo в формате GitHub.',
      url: undefined,
      diagnostics,
    });
  }

  const latestReleaseUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  const latestRelease = await fetchJson(latestReleaseUrl);
  if (latestRelease.ok && isObject(latestRelease.data)) {
    const result = releaseToResult(latestRelease.data, normalizedConfig, owner, repo, diagnostics);
    if (result) return result;
    diagnostics.push('Последний релиз найден, но у него нет tag_name.');
  } else if (!latestRelease.ok) {
    diagnostics.push(`GitHub Releases/latest: ${latestRelease.error}.`);
  }

  const releasesListUrl = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=10`;
  const releasesList = await fetchJson(releasesListUrl);
  if (releasesList.ok && Array.isArray(releasesList.data)) {
    const release = releasesList.data.find(isObject);
    if (release) {
      const result = releaseToResult(release, normalizedConfig, owner, repo, diagnostics);
      if (result) return result;
    } else {
      diagnostics.push('Список GitHub Releases пустой.');
    }
  } else if (!releasesList.ok) {
    diagnostics.push(`GitHub Releases list: ${releasesList.error}.`);
  }

  const defaultBranch = await readRepoDefaultBranch(owner, repo, diagnostics);
  const branches = uniqueValues([config.branch || 'main', defaultBranch || '', 'main', 'master']);
  const manifestResult = await readManifestVersion({ owner, repo, branches, config: normalizedConfig, diagnostics });
  if (manifestResult) return manifestResult;

  return buildResult({
    config: normalizedConfig,
    source: 'none',
    latestVersion: null,
    title: 'Версия не найдена',
    message:
      'Не удалось найти GitHub Release, app.json или package.json. Проверьте, что репозиторий публичный, файлы лежат в корне или в папке package, а версия указана в app.json/package.json.',
    url: buildRepoUrl(owner, repo),
    diagnostics,
  });
}

export function describeUpdateStatus(info: Pick<GithubUpdateInfo, 'ok' | 'hasUpdate' | 'latestVersion' | 'compare'>) {
  if (!info.ok) return 'Проверка не выполнена.';
  if (info.hasUpdate) return `Доступна новая версия ${info.latestVersion}.`;
  if (info.compare === 'same') return 'Установлена актуальная версия.';
  if (info.compare === 'older') return 'Локальная версия новее версии в репозитории.';
  return 'Версия получена, но сравнение выполнить не удалось.';
}
