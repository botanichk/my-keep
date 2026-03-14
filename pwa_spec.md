# 📱 My Keep — PWA (устанавливается на телефон)

> После этого на телефоне появится иконка на рабочем столе, приложение открывается без браузерной панели — как настоящее приложение.

---

## Шаг 1 — Создать файл `public/manifest.json`

Создай файл `manifest.json` в папке `public/` со следующим содержимым:

```json
{
  "name": "My Keep",
  "short_name": "My Keep",
  "description": "Мои заметки",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F5F0E8",
  "theme_color": "#D4763B",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## Шаг 2 — Создать иконки

Создай два PNG файла и положи в папку `public/`:

- `icon-192.png` — размер 192×192 пикселей
- `icon-512.png` — размер 512×512 пикселей

**Быстрый способ сделать иконки бесплатно:**

1. Открой **favicon.io/favicon-generator**
2. Text → напечатай `M`
3. Background: `#D4763B` (оранжевый)
4. Font color: `#FFFFFF`
5. Нажми **Download**
6. Распакуй архив — там будут PNG файлы нужных размеров
7. Переименуй в `icon-192.png` и `icon-512.png`
8. Положи в папку `public/`

---

## Шаг 3 — Подключить manifest в `index.html`

Открой `index.html` в корне проекта.

Найди строку:
```html
<head>
```

Добавь сразу после неё:
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#D4763B" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="My Keep" />
<link rel="apple-touch-icon" href="/icon-192.png" />
```

---

## Шаг 4 — Создать Service Worker

Создай файл `public/sw.js`:

```js
const CACHE = 'my-keep-v1';

const ASSETS = [
  '/',
  '/index.html',
];

// Установка — кешируем основные файлы
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Активация — удаляем старый кеш
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — сначала сеть, потом кеш
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
```

---

## Шаг 5 — Зарегистрировать Service Worker в `src/main.jsx`

Открой `src/main.jsx`.

Найди:
```jsx
import { StrictMode } from 'react'
```

Добавь после всех импортов перед `ReactDOM.createRoot`:
```js
// Регистрируем Service Worker для PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
```

---

## Шаг 6 — Пересобрать и задеплоить

```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## Как установить на телефон после деплоя

**Android (Chrome):**
1. Открой `https://mykeep-app-2026.netlify.app` в Chrome
2. Нажми три точки (меню) → **Добавить на главный экран**
3. Нажми **Установить**

**iPhone (Safari):**
1. Открой ссылку в Safari
2. Нажми кнопку **Поделиться** (квадрат со стрелкой вверх)
3. Прокрути вниз → **На экран «Домой»**
4. Нажми **Добавить**

---

## Результат

- Иконка My Keep появится на рабочем столе
- Открывается без адресной строки браузера
- Работает как обычное приложение
