export type VersionCompareResult = 'newer' | 'same' | 'older' | 'unknown';

export function normalizeVersionTag(value: string | null | undefined) {
  return String(value ?? '')
    .trim()
    .replace(/^release[-_/]?/i, '')
    .replace(/^version[-_/]?/i, '')
    .replace(/^v/i, '')
    .replace(/^[^0-9]*/, '')
    .split(/[+\s]/)[0]
    .trim();
}

export function parseVersionParts(value: string | null | undefined): number[] | null {
  const normalized = normalizeVersionTag(value);
  const match = normalized.match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:[-.]?(\d+))?/);
  if (!match) return null;
  return [match[1], match[2] ?? '0', match[3] ?? '0', match[4] ?? '0'].map((part) => Number(part));
}

export function compareVersions(localVersion: string | null | undefined, remoteVersion: string | null | undefined): VersionCompareResult {
  const local = parseVersionParts(localVersion);
  const remote = parseVersionParts(remoteVersion);
  if (!local || !remote) return 'unknown';

  for (let index = 0; index < Math.max(local.length, remote.length); index += 1) {
    const a = local[index] ?? 0;
    const b = remote[index] ?? 0;
    if (b > a) return 'newer';
    if (b < a) return 'older';
  }

  return 'same';
}
