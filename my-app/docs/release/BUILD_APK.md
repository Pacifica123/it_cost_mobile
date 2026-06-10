# Сборка APK

## 1. Установка зависимостей

```bash
npm install
```

## 2. Проверка проекта

```bash
npm run check
```

## 3. Установка EAS CLI

```bash
npm install -g eas-cli
```

## 4. Авторизация

```bash
eas login
```

## 5. Сборка APK

В текущем `eas.json` APK собирается профилем `preview`:

```powershell
$env:EAS_NO_VCS="1"
eas build -p android --profile preview
```

Для `cmd`:

```cmd
set EAS_NO_VCS=1
eas build -p android --profile preview
```

## Почему `preview`, а не `apk`

В `eas.json` профиль называется `preview`:

```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```

Поэтому команда:

```bash
eas build -p android --profile apk
```

не сработает, пока в `eas.json` нет профиля `apk`.

## Если Git не найден

Ошибка:

```text
git command not found
spawn git ENOENT
```

Быстрый вариант:

```powershell
$env:EAS_NO_VCS="1"
eas build -p android --profile preview
```

Нормальный вариант — переустановить Git for Windows и выбрать пункт:

```text
Git from the command line and also from 3rd-party software
```

## Если EAS не видит корень проекта

Перейдите в папку проекта:

```powershell
cd C:\Users\aaskr\OneDrive\Документы\GitHub\it_cost_mobile\my-app
```

И повторите сборку.

При необходимости можно указать корень:

```powershell
$env:EAS_PROJECT_ROOT="C:\Users\aaskr\OneDrive\Документы\GitHub\it_cost_mobile\my-app"
$env:EAS_NO_VCS="1"
eas build -p android --profile preview
```

## После сборки

EAS даст ссылку на скачивание APK. Скачайте APK и установите на Android-устройство.
