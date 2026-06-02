const test = require('node:test');
const assert = require('node:assert/strict');
const { compareVersions, normalizeVersionTag } = require('../../.logic-test-dist/features/update/logic/version.js');
const { describeUpdateStatus } = require('../../.logic-test-dist/features/update/logic/githubUpdate.js');

test('version comparator understands github release tags', () => {
  assert.equal(normalizeVersionTag('v1.2.3'), '1.2.3');
  assert.equal(normalizeVersionTag('release-2.0.1'), '2.0.1');
  assert.equal(compareVersions('1.0.0', 'v1.0.1'), 'newer');
  assert.equal(compareVersions('1.0.0', '1.0.0'), 'same');
  assert.equal(compareVersions('1.2.0', '1.1.9'), 'older');
});

test('update status text marks available update', () => {
  const status = describeUpdateStatus({ ok: true, hasUpdate: true, latestVersion: '1.0.1', compare: 'newer' });
  assert.match(status, /Доступна новая версия 1\.0\.1/);
});
