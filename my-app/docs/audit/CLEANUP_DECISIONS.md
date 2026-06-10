# Решения по удалению лишнего

## Удалено из корня проекта

Накопленные одноразовые отчёты патчей были полезны во время разработки, но засоряли корень проекта. Они удалены из корня архива.

Удалено файлов/путей: 26

```text
DUPLICATE_AUDIT_SUMMARY.md
EXCHANGE_RATES_SUMMARY.md
MULTI_PROJECT_CATALOG_IMPORT_SUMMARY.md
UI_CHART_LAYOUT_COLOR_FIX_SUMMARY.md
FUNCTIONALITY_AUDIT_UPDATE_SUMMARY.md
GITHUB_REPO_CONFIG_FIX_SUMMARY.md
SORT_AND_CATALOG_CARD_FIX_SUMMARY.md
RISKS_SCENARIOS_MOVES_CSV_SUMMARY.md
KIT_PLANNER_IMPLEMENTATION_PASS_SUMMARY.md
HOME_SERVICE_SHORTCUTS_SUMMARY.md
HOME_ROOT_SERVICE_SHORTCUTS_FIX_SUMMARY.md
SETTINGS_EXTENDED_PASS_SUMMARY.md
SETTINGS_DENSITY_HOME_FIX_SUMMARY.md
MENU_IT_AUDIT_SUMMARY.md
SETTINGS_ANIMATED_DENSITY_FIX_SUMMARY.md
THEME_DEMO_UX_FIX_SUMMARY.md
MENU_SIMPLIFICATION_THEME_REPORT_FIX_SUMMARY.md
COLOR_TEXT_AND_USER_LOAD_PASS_SUMMARY.md
DOCUMENTATION_PASS_SUMMARY.md
components/hello-wave.tsx
components/external-link.tsx
components/haptic-tab.tsx
hooks/use-color-scheme.ts
hooks/use-color-scheme.web.ts
constants/theme.ts
scripts/reset-project.js
```

## Почему это удалено

- пользователь не должен видеть внутренние промежуточные отчёты;
- разработчику важнее актуальная документация в `docs/`;
- корень проекта должен содержать только основные файлы запуска, сборки и настройки;
- старые summary-файлы ухудшают навигацию по проекту.

## Что оставлено

- `README.md`;
- `CONTRIBUTING.md`;
- `docs/`;
- `app/`;
- `features/`;
- `shared/`;
- `store/`;
- `scripts/`;
- `tests/`;
- `eas.json`;
- `app.json`;
- стартовые `.bat` файлы.

## Что не удалялось специально

Функциональные экраны не удалялись физически. Они спрятаны глубже в интерфейсе, потому что их удаление может сломать сценарии, тесты, отчёт или маршруты.

Такой подход безопаснее: пользователь видит меньше, но разработчик не теряет функциональность.
