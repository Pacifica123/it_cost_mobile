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
  source: 'release' | 'app-json' | 'none';
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
};

const trimSlash = (value: string) => value.replace(/^\/+|\/+$/g, '');

const buildRepoUrl = (owner: string, repo: string) => `https://github.com/${trimSlash(owner)}/${trimSlash(repo)}`;
const buildLatestReleaseUrl = (owner: string, repo: string) => `${buildRepoUrl(owner, repo)}/releases/latest`;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function pickDownloadUrl(assets: GithubUpdateAsset[]) {
  return assets.find((asset) => /\.(apk|aab|ipa|zip)$/i.test(asset.name))?.url ?? assets[0]?.url;
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json, application/json, text/plain;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

function buildResult(input: {
  config: GithubUpdateConfig;
  source: GithubUpdateInfo['source'];
  latestVersion: string | null;
  title: string;
  message?: string;
  url?: string;
  assets?: GithubUpdateAsset[];
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
  };
}

export async function checkGithubUpdate(config: GithubUpdateConfig): Promise<GithubUpdateInfo> {
  const owner = trimSlash(config.owner.trim());
  const repo = trimSlash(config.repo.trim());
  const normalizedConfig = { ...config, owner, repo };

  if (!owner || !repo) {
    return buildResult({
      config: normalizedConfig,
      source: 'none',
      latestVersion: null,
      title: 'Репозиторий не указан',
      message: 'Укажите owner и repo в формате GitHub.',
      url: undefined,
    });
  }

  try {
    const release = await fetchJson(`https://api.github.com/repos/${owner}/${repo}/releases/latest`);
    if (isObject(release)) {
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

      if (tagName) {
        return buildResult({
          config: normalizedConfig,
          source: 'release',
          latestVersion: tagName,
          title: name,
          message: 'Версия проверена через GitHub Releases.',
          url: htmlUrl,
          assets,
        });
      }
    }
  } catch {
    // Fallback below: not every repo has releases.
  }

  const branches = [config.branch || 'main', 'master'].filter((branch, index, list) => list.indexOf(branch) === index);
  for (const branch of branches) {
    try {
      const appJson = await fetchJson(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/app.json`);
      if (!isObject(appJson)) continue;
      const expo = isObject(appJson.expo) ? appJson.expo : null;
      const version = typeof expo?.version === 'string' ? expo.version : typeof appJson.version === 'string' ? appJson.version : '';
      if (!version) continue;

      return buildResult({
        config: normalizedConfig,
        source: 'app-json',
        latestVersion: version,
        title: `app.json · ${branch}`,
        message: 'Релиз не найден, версия прочитана из app.json в репозитории.',
        url: `${buildRepoUrl(owner, repo)}/blob/${branch}/app.json`,
      });
    } catch {
      // Try next branch.
    }
  }

  return buildResult({
    config: normalizedConfig,
    source: 'none',
    latestVersion: null,
    title: 'Версия не найдена',
    message: 'Не удалось прочитать GitHub Releases или app.json. Проверьте репозиторий и доступ к интернету.',
    url: buildRepoUrl(owner, repo),
  });
}

export function describeUpdateStatus(info: GithubUpdateInfo) {
  if (!info.ok) return 'Проверка не выполнена.';
  if (info.hasUpdate) return `Доступна новая версия ${info.latestVersion}.`;
  if (info.compare === 'same') return 'Установлена актуальная версия.';
  if (info.compare === 'older') return 'Локальная версия новее версии в репозитории.';
  return 'Версия получена, но сравнение выполнить не удалось.';
}
