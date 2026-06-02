const test = require('node:test');
const assert = require('node:assert/strict');

const { dataReducer } = require('../../.logic-test-dist/store/data/reducer');
const { initialState } = require('../../.logic-test-dist/store/data/defaults');
const { parseProjectDataState, serializeDataState, PROJECT_EXPORT_VERSION } = require('../../.logic-test-dist/store/data/serialization');
const { parseProjectCsv } = require('../../.logic-test-dist/features/project/logic/importCsv');
const { typicalCatalogItems, filterCatalogItems, catalogItemToCapital } = require('../../.logic-test-dist/features/catalog/logic/itemCatalog');
const { validateProjectData } = require('../../.logic-test-dist/features/validation/logic/validateProjectData');

test('saved projects can be saved, opened, duplicated and deleted', () => {
  const saved = dataReducer(initialState, { type: 'SAVE_CURRENT_PROJECT' });
  assert.equal(saved.savedProjects.length, 1);
  assert.equal(saved.activeProjectId, saved.savedProjects[0].id);

  const changed = dataReducer(saved, { type: 'SET_CAPITAL_DATA', payload: [] });
  assert.equal(changed.capitalData.length, 0);

  const opened = dataReducer(changed, { type: 'OPEN_SAVED_PROJECT', payload: { projectId: saved.savedProjects[0].id } });
  assert.equal(opened.capitalData.length, initialState.capitalData.length);

  const duplicated = dataReducer(opened, { type: 'DUPLICATE_SAVED_PROJECT', payload: { projectId: saved.savedProjects[0].id } });
  assert.equal(duplicated.savedProjects.length, 2);

  const deleted = dataReducer(duplicated, { type: 'DELETE_SAVED_PROJECT', payload: { projectId: duplicated.savedProjects[0].id } });
  assert.equal(deleted.savedProjects.length, 1);
});

test('project export preserves saved projects and migrates to schema 5', () => {
  const saved = dataReducer(initialState, { type: 'SAVE_CURRENT_PROJECT' });
  const parsed = parseProjectDataState(serializeDataState(saved));

  assert.equal(parsed.ok, true);
  assert.equal(parsed.state.schemaVersion, PROJECT_EXPORT_VERSION);
  assert.equal(parsed.state.savedProjects.length, 1);
});

test('typical catalog filters and converts items', () => {
  const servers = filterCatalogItems(typicalCatalogItems, 'сервер', 'hardware');
  assert.ok(servers.length > 0);

  const capital = catalogItemToCapital(servers[0]);
  assert.equal(capital.kind, 'hardware');
  assert.ok(capital.price > 0);
});

test('CSV import reads CAPEX and OPEX rows', () => {
  const csv = 'name;price;quantity;type;category\nОфисный ПК;42000;5;CAPEX;Клиентское оборудование\nАдминистрирование;18000;1;OPEX;Администрирование серверов';
  const result = parseProjectCsv(csv, initialState.categories);

  assert.equal(result.rowsRead, 2);
  assert.equal(result.capitalData.length, 1);
  assert.equal(result.operatingData.length, 1);
  assert.equal(result.capitalData[0].quantity, 5);
});

test('smart validation detects duplicate CAPEX and missing paired parts', () => {
  const report = validateProjectData({
    ...initialState,
    capitalData: [
      { id: 'a', categoryId: 'capital-server', name: 'Сервер', quantity: 1, price: 100000, kind: 'hardware' },
      { id: 'b', categoryId: 'capital-server', name: 'Сервер', quantity: 1, price: 100000, kind: 'hardware' },
    ],
    operatingData: [],
    electricityTotal: 0,
  });

  assert.ok(report.issues.some((issue) => issue.id.startsWith('capex-duplicate')));
  assert.ok(report.issues.some((issue) => issue.id === 'smart-server-without-network'));
});
