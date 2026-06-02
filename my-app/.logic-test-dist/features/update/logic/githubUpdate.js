"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGithubUpdate = checkGithubUpdate;
exports.describeUpdateStatus = describeUpdateStatus;
const version_1 = require("./version");
const trimSlash = (value) => value.replace(/^\/+|\/+$/g, '');
const buildRepoUrl = (owner, repo) => `https://github.com/${trimSlash(owner)}/${trimSlash(repo)}`;
const buildLatestReleaseUrl = (owner, repo) => `${buildRepoUrl(owner, repo)}/releases/latest`;
function isObject(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
function pickDownloadUrl(assets) {
    return assets.find((asset) => /\.(apk|aab|ipa|zip)$/i.test(asset.name))?.url ?? assets[0]?.url;
}
async function fetchJson(url) {
    const response = await fetch(url, {
        headers: {
            Accept: 'application/vnd.github+json, application/json, text/plain;q=0.8',
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
}
function buildResult(input) {
    const latestVersion = input.latestVersion ? (0, version_1.normalizeVersionTag)(input.latestVersion) : null;
    const compare = latestVersion ? (0, version_1.compareVersions)(input.config.currentVersion, latestVersion) : 'unknown';
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
async function checkGithubUpdate(config) {
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
    }
    catch {
        // Fallback below: not every repo has releases.
    }
    const branches = [config.branch || 'main', 'master'].filter((branch, index, list) => list.indexOf(branch) === index);
    for (const branch of branches) {
        try {
            const appJson = await fetchJson(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/app.json`);
            if (!isObject(appJson))
                continue;
            const expo = isObject(appJson.expo) ? appJson.expo : null;
            const version = typeof expo?.version === 'string' ? expo.version : typeof appJson.version === 'string' ? appJson.version : '';
            if (!version)
                continue;
            return buildResult({
                config: normalizedConfig,
                source: 'app-json',
                latestVersion: version,
                title: `app.json · ${branch}`,
                message: 'Релиз не найден, версия прочитана из app.json в репозитории.',
                url: `${buildRepoUrl(owner, repo)}/blob/${branch}/app.json`,
            });
        }
        catch {
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
function describeUpdateStatus(info) {
    if (!info.ok)
        return 'Проверка не выполнена.';
    if (info.hasUpdate)
        return `Доступна новая версия ${info.latestVersion}.`;
    if (info.compare === 'same')
        return 'Установлена актуальная версия.';
    if (info.compare === 'older')
        return 'Локальная версия новее версии в репозитории.';
    return 'Версия получена, но сравнение выполнить не удалось.';
}
