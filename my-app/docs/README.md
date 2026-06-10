# Документация IT Cost Mobile

Этот каталог содержит инструкции для пользователей, разработчиков и сборки приложения.

## Для пользователя

- [Быстрый старт](user/QUICK_START.md)
- [Руководство пользователя](user/USER_GUIDE.md)
- [Частые вопросы](support/FAQ.md)
- [Устранение проблем](support/TROUBLESHOOTING.md)

## Для разработчика

- [Руководство разработчика](developer/DEVELOPER_GUIDE.md)
- [Архитектура проекта](architecture/ARCHITECTURE.md)
- [Навигация и маршруты](developer/NAVIGATION.md)
- [Проверки качества](developer/QUALITY_CHECKS.md)
- [Схема данных и миграции](developer/DATA_SCHEMA.md)

## Сборка и релиз

- [Сборка APK](release/BUILD_APK.md)
- [Публикация релиза на GitHub](release/GITHUB_RELEASES.md)
- [Чек-лист релиза](release/RELEASE_CHECKLIST.md)

## Куда смотреть в первую очередь

Если нужно просто запустить проект:

```bash
npm install
npm run fresh
```

Если нужно проверить перед сборкой:

```bash
npm run check
```

Если нужно собрать APK через EAS:

```powershell
$env:EAS_NO_VCS="1"
eas build -p android --profile preview
```

## Аудит и упрощение

- [Аудит удобства и понятности](audit/UX_AUDIT.md)
- [Решения по удалению лишнего](audit/CLEANUP_DECISIONS.md)
