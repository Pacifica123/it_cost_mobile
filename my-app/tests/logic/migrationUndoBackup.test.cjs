const test = require('node:test');
const assert = require('node:assert/strict');

const { dataReducer } = require('../../.logic-test-dist/store/data/reducer');
const { initialState } = require('../../.logic-test-dist/store/data/defaults');
const { parseProjectDataState, serializeDataState, PROJECT_EXPORT_VERSION } = require('../../.logic-test-dist/store/data/serialization');
const { buildDiagnostics } = require('../../.logic-test-dist/features/diagnostics/logic/buildDiagnostics');
const { buildFinancialChartData } = require('../../.logic-test-dist/features/charts/logic/buildFinancialCharts');

test('legacy project import is migrated to current schema', () => {
  const legacy = JSON.stringify({
    schema: 'it-cost-mobile-project',
    version: 1,
    data: {
      projectMeta: { name: 'Legacy', budget: 100, targetClientSeats: 1 },
      categories: initialState.categories,
      capitalData: [],
      operatingData: [],
      electricityTotal: 0,
    },
  });

  const result = parseProjectDataState(legacy);

  assert.equal(result.ok, true);
  assert.equal(result.state.schemaVersion, PROJECT_EXPORT_VERSION);
  assert.ok(result.warnings.some((warning) => /обновлён/i.test(warning)));
  assert.deepEqual(result.state.undoStack, []);
  assert.deepEqual(result.state.redoStack, []);
});

test('reducer supports full undo and redo for project data changes', () => {
  const changed = dataReducer(initialState, {
    type: 'SET_CAPITAL_DATA',
    payload: initialState.capitalData.slice(0, 1),
  });

  assert.equal(changed.capitalData.length, 1);
  assert.equal(changed.undoStack.length, 1);

  const undone = dataReducer(changed, { type: 'UNDO_LAST_ACTION' });
  assert.equal(undone.capitalData.length, initialState.capitalData.length);
  assert.equal(undone.redoStack.length, 1);

  const redone = dataReducer(undone, { type: 'REDO_LAST_ACTION' });
  assert.equal(redone.capitalData.length, 1);
});

test('backup can be created and restored', () => {
  const withBackup = dataReducer(initialState, { type: 'CREATE_PROJECT_BACKUP', payload: { name: 'Before edit' } });
  const changed = dataReducer(withBackup, {
    type: 'SET_CAPITAL_DATA',
    payload: withBackup.capitalData.slice(0, 1),
  });
  const restored = dataReducer(changed, {
    type: 'RESTORE_PROJECT_BACKUP',
    payload: { backupId: withBackup.projectBackups[0].id },
  });

  assert.equal(restored.capitalData.length, initialState.capitalData.length);
  assert.equal(restored.projectBackups.length, 1);
});

test('diagnostics and charts build usable data', () => {
  const diagnostics = buildDiagnostics(initialState);
  const charts = buildFinancialChartData(initialState);

  assert.ok(diagnostics.items.length >= 8);
  assert.ok(diagnostics.estimatedSizeBytes > 0);
  assert.ok(charts.structure.length > 0);
  assert.equal(charts.cumulativeTco.length, 6);
});

test('serialized export hides runtime undo and redo stacks', () => {
  const changed = dataReducer(initialState, {
    type: 'SET_PROJECT_META',
    payload: { name: 'Changed' },
  });
  const parsed = JSON.parse(serializeDataState(changed));

  assert.equal(parsed.version, PROJECT_EXPORT_VERSION);
  assert.deepEqual(parsed.data.undoStack, []);
  assert.deepEqual(parsed.data.redoStack, []);
});
