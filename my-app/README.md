# IT Cost Mobile

Мобильное приложение для расчёта и анализа стоимости IT-инфраструктуры: оборудование, ПО, CAPEX, OPEX, электроэнергия, аналитика, риски и итоговый отчёт.

## Быстрый запуск

```bash
npm install
npm run fresh
```

Обычный запуск:

```bash
npm run dev
```

Проверка перед сборкой:

```bash
npm run check
```

## Сборка APK

В этом проекте APK собирается профилем `preview`:

```powershell
$env:EAS_NO_VCS="1"
eas build -p android --profile preview
```

Подробнее: [`docs/release/BUILD_APK.md`](docs/release/BUILD_APK.md).

## Основной сценарий пользователя

```text
Проект → Расчёты → Аналитика → Отчёт
```

Документация пользователя:

- [`docs/user/QUICK_START.md`](docs/user/QUICK_START.md)
- [`docs/user/USER_GUIDE.md`](docs/user/USER_GUIDE.md)
- [`docs/support/FAQ.md`](docs/support/FAQ.md)
- [`docs/support/TROUBLESHOOTING.md`](docs/support/TROUBLESHOOTING.md)

## Документация разработчика

- [`docs/developer/DEVELOPER_GUIDE.md`](docs/developer/DEVELOPER_GUIDE.md)
- [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md)
- [`docs/developer/NAVIGATION.md`](docs/developer/NAVIGATION.md)
- [`docs/developer/QUALITY_CHECKS.md`](docs/developer/QUALITY_CHECKS.md)
- [`docs/developer/DATA_SCHEMA.md`](docs/developer/DATA_SCHEMA.md)

## Релиз

- [`docs/release/RELEASE_CHECKLIST.md`](docs/release/RELEASE_CHECKLIST.md)
- [`docs/release/GITHUB_RELEASES.md`](docs/release/GITHUB_RELEASES.md)

## Главные команды

| Команда | Назначение |
|---|---|
| `npm run dev` | Обычный запуск Expo |
| `npm run fresh` | Запуск с очисткой кэша |
| `npm run android` | Запуск на Android |
| `npm run web` | Запуск web-версии |
| `npm run check` | Полная проверка проекта |
| `npm run test:logic` | Логические тесты |
| `npm run check:router` | Проверка маршрутов |
| `npm run check:duplicates` | Проверка дублей |
| `npm run check:functionality` | Проверка экранов и переходов |
| `npm run check:menu-it` | Проверка структуры Меню ИТ |

## Структура

```text
app/        экраны Expo Router
features/   функциональные модули
shared/     общие компоненты, тема, утилиты
store/      состояние и сохранение
scripts/    проверки и генераторы
tests/      тесты логики
docs/       документация
```

## Репозиторий обновлений

```text
Pacifica123/it_cost_mobile
```

Экран обновлений использует GitHub Releases.
