const test = require('node:test');
const assert = require('node:assert/strict');

const { initialState } = require('../../.logic-test-dist/store/data/defaults');
const { serializeDataState, parseProjectDataState } = require('../../.logic-test-dist/store/data/serialization');

test('project export can be imported back without losing core data', () => {
  const exported = serializeDataState(initialState);
  const result = parseProjectDataState(exported);

  assert.equal(result.ok, true);
  assert.equal(result.state.capitalData.length, initialState.capitalData.length);
  assert.equal(result.state.operatingData.length, initialState.operatingData.length);
  assert.equal(result.state.categories.length, initialState.categories.length);
});

test('project import rejects unrelated JSON', () => {
  const result = parseProjectDataState('{"hello":"world"}');

  assert.equal(result.ok, false);
  assert.match(result.message, /не похож/i);
});
