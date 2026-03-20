# ITCost Mobile

Мобильное приложение на **Expo + React Native + Expo Router**.

## Стек

* Expo
* React Native
* Expo Router
* TypeScript
* React Navigation

## Требования

Перед запуском убедитесь, что установлены:

* **Node.js LTS**
* **npm**
* **Android Studio + Android SDK** — если нужен запуск на Android-эмуляторе или локальная сборка APK/AAB

## Установка

```bash
npm install
```

## Важная особенность проекта

В проекте используется автогенерация файла маршрутов:

```bash
npm run gen:tabs
```

Скрипт генерирует файл:

```text
app/generated/tabs.ts
```

Этот шаг уже автоматически вызывается перед:

* `npm run start`
* `npx expo prebuild`

Поэтому вручную запускать генерацию обычно не требуется.

## Запуск в режиме разработки

### Старт dev-сервера

```bash
npm run start
```

или

```bash
npx expo start
```

### Запуск на Android

(требует подключенное андроид-устройство или эмулятор)

```bash
npm run android
```

### Запуск в браузере

```bash
npm run web
```

### Ручная генерация маршрутов

```bash
npm run gen:tabs
```

## Локальная сборка Android-приложения

В репозитории **нет готовой папки `android/`**, потому что проект работает в Expo-managed/CNG формате. Перед локальной нативной сборкой нужно сначала сгенерировать Android-проект.

### 1\. Сгенерировать нативный Android-проект

```bash
npx expo prebuild -p android
```

### 2\. Собрать debug-версию

```bash
cd android
./gradlew assembleDebug
```

Для Windows:

```powershell
cd android
.\\gradlew.bat assembleDebug
```

### 3\. Собрать release-версию

```bash
cd android
./gradlew assembleRelease
```

Для Windows:

```powershell
cd android
.\\gradlew.bat assembleRelease
```

### Где будет APK

После сборки файл обычно находится здесь:

```text
android/app/build/outputs/apk/release/app-release.apk
```

## Сборка через EAS Build

Если нужна облачная сборка без ручной настройки локального Android-окружения, можно использовать **EAS Build**.

### 1\. Установить EAS CLI

```bash
npm install -g eas-cli
```

### 2\. Авторизоваться

```bash
eas login
```

### 3\. Инициализировать конфигурацию EAS

```bash
eas build:configure
```

После этого в корне проекта появится файл `eas.json`.

### 4\. Собрать Android-приложение

```bash
eas build --platform android
```

## Как собрать именно APK через EAS

По умолчанию EAS для Android обычно собирает **AAB**. Если нужен именно **APK** для установки на устройство или эмулятор, добавьте профиль в `eas.json`:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

Затем выполните:

```bash
eas build -p android --profile preview
```

## Возможные проблемы

### 1\. Не запускается Android-сборка

Проверьте:

* установлен ли Android Studio
* установлен ли Android SDK
* доступен ли JDK
* создан ли Android Emulator или подключено физическое устройство

### 2\. Не видны изменения в приложении

Попробуйте заново запустить dev-сервер:

```bash
npm run start
```

Если устройство не видит сервер по локальной сети:

```bash
npx expo start --tunnel
```

### 3\. Ошибка, связанная с маршрутами/экранами

Перегенерируйте файл маршрутов:

```bash
npm run gen:tabs
```

## Структура проекта

```text
my-app/
├─ app/
├─ components/
├─ assets/
├─ scripts/
│  └─ generate-tabs.mjs
├─ package.json
└─ app.json
```

