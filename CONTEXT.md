# 📝 My Keep — Контекст проекта

> Этот файл читать перед любой работой над проектом.

---

## Что это

Веб-приложение — клон Google Keep для создания и хранения заметок. Работает в браузере и устанавливается на телефон как приложение (PWA).

**Живой адрес (Netlify):** https://mykeep-app-2026.netlify.app  
**Живой адрес (GitLab Pages):** https://igorrr.ro.gitlab.io/my-keep
**Живой адрес (GitHub Pages):** https://botanichk.github.io/my-keep

---

## Стек

| Слой | Технология |
|---|---|
| Frontend | React 18 + Vite + JavaScript |
| Стили | Tailwind CSS |
| База данных | Firebase Firestore (NoSQL, realtime) |
| Хранилище файлов | Firebase Storage (платный, не используем) |
| Хостинг | Netlify + GitLab Pages |
| Иконки | lucide-react |
| PWA | Service Worker + manifest.json |

---

## Дизайн-система

Стиль **Claude AI Mobile** — тёплые кремовые тона.

| Переменная | Цвет | Где используется |
|---|---|---|
| Фон | `#F5F0E8` | Фон всего приложения |
| Фон карточек | `#FDFAF5` | Карточки заметок |
| Фон сайдбара | `#EDE8DF` | Боковая панель |
| Акцент | `#D4763B` | Кнопки, активные элементы |
| Акцент hover | `#C2662B` | Кнопки при наведении |
| Акцент мягкий | `#FAE8D8` | Hover фоны |
| Текст основной | `#1C1917` | Заголовки, основной текст |
| Текст вторичный | `#78716C` | Подписи, placeholder |
| Текст muted | `#A8A29E` | Неактивные элементы |
| Граница | `#E8E0D4` | Borders |

---

## Структура файлов

```
my-keep/
├── index.html
├── .gitlab-ci.yml        ← CI/CD для GitLab Pages
├── CONTEXT.md            ← Этот файл
├── public/
│   ├── manifest.json       ← PWA манифест
│   ├── sw.js               ← Service Worker
│   ├── icon-192.svg        ← Иконка PWA
│   └── icon-512.svg        ← Иконка PWA
└── src/
    ├── main.jsx            ← Точка входа
    ├── App.jsx             ← Корневой компонент
    ├── firebase.js         ← Конфиг Firebase
    ├── theme.js            ← Цвета и палитра карточек
    ├── index.css           ← Глобальные стили
    ├── hooks/
    │   ├── useNotes.js     ← CRUD заметок
    │   ├── useLabels.js    ← CRUD меток
    │   └── useFolders.js   ← CRUD папок
    ├── utils/
    │   └── linkify.jsx     ← Превращает URL в тексте в кликабельные ссылки
    └── components/
        ├── layout/
        │   ├── Header.jsx      ← Шапка с поиском + переключатель вида
        │   └── Sidebar.jsx     ← Навигация
        ├── notes/
        │   ├── NoteForm.jsx    ← Форма создания
        │   ├── NoteCard.jsx    ← Карточка заметки
        │   └── NoteModal.jsx   ← Редактирование (весь экран)
        └── ui/
            ├── ColorPicker.jsx  ← Горизонтальный выбор цвета
            ├── LabelPicker.jsx  ← Выбор меток
            ├── ImageUpload.jsx  ← Загрузка фото (только URL)
            ├── EmptyState.jsx   ← Заглушка
            ├── AppIcon.jsx      ← SVG иконка приложения
            └── Toast.jsx        ← Уведомления
```

---

## Firebase

**Проект:** `my-keep-fde5b`

**Коллекции Firestore:**

`notes` — заметки:
```
title       string
text        string
color       string    (#FDFAF5 по умолчанию)
pinned      boolean
archived    boolean
deleted     boolean   (мягкое удаление)
imageUrl    string    (внешний URL, не Storage)
labelIds    array
folderId    string    (null = корень)
createdAt   timestamp
updatedAt   timestamp
```

`labels` — метки:
```
name        string
color       string
createdAt   timestamp
```

`folders` — папки:
```
name        string
icon        string
createdAt   timestamp
```

**Важно — составные индексы Firestore** (уже созданы):
- `archived ASC + folderId ASC + createdAt DESC` — главный экран
- `archived ASC + updatedAt DESC` — архив
- `folderId ASC + archived ASC + createdAt DESC` — папки
- `deleted ASC + deletedAt DESC` — корзина

---

## Что работает

- ✅ Создание заметок (форма раскрывается по клику)
- ✅ Редактирование в модалке (весь экран на мобиле и десктопе)
- ✅ Удаление (мягкое — флаг `deleted: true`)
- ✅ **Корзина** — восстановление и удаление навсегда
- ✅ Цветные карточки (12 тёплых цветов, горизонтальный ColorPicker)
- ✅ Тёмная карточка `#1C1917` (текст автоматически белый)
- ✅ Закрепление заметок
- ✅ Архив + восстановление из архива
- ✅ Метки — создание, назначение, удаление
- ✅ Папки — создание, переименование, удаление (заметки уходят в корень)
- ✅ Перемещение заметок между папками
- ✅ Поиск по заголовку и тексту
- ✅ Загрузка изображений по URL (Firebase Storage не используем — платный)
- ✅ Masonry сетка (1/2/3/4 колонки)
- ✅ Адаптив mobile/tablet/desktop
- ✅ PWA — устанавливается на телефон как приложение
- ✅ Toast уведомления
- ✅ **Переключатель вида: список / сетка (на мобильном)**
- ✅ **Кликабельные ссылки в тексте** — открываются в новой вкладке

---

## Важные нюансы

**ColorPicker:** контейнер попапа должен иметь `style={{ width: '280px' }}` — иначе Tailwind flex сожмёт и кружки встанут вертикально.

**useNotes:** вызывать с аргументами — `useNotes(folderId, view)`. Без аргументов хук не фильтрует и возвращает все заметки везде.

**Загрузка фото с компа:** Firebase Storage требует платный план — не реализовано. Работает только загрузка по URL.

**NoteModal:** на мобильных (`< 640px`) модалка занимает весь экран, появляется снизу вверх.

**Переключатель вида (Header.jsx):**
- Кнопка с иконками `LayoutList` / `LayoutGrid` из lucide-react
- Использует `onPointerDown` для надёжной работы на мобильном Firefox
- На десктопе всегда masonry сетка, на мобильном переключается список/сетка

**Service Worker:** кэширует приложение для PWA. При проблемах с обновлением — изменить версию кэша в `public/sw.js`.

**Деплой после каждого изменения:**

*Netlify:*
```bash
npm run build
npx netlify deploy --prod --dir=dist
```

*GitLab Pages (автоматически):*
```bash
git add .
git commit -m "описание изменений"
git push
# → Pipeline запустится автоматически
```

---

## Как запустить локально

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## CI/CD

**GitLab Pages:**
- Файл: `.gitlab-ci.yml`
- Команда: `npm run build` → `cp -r dist public`
- Публикация: `https://igorrr.ro.gitlab.io/my-keep`
- Ветка: `main`

**GitHub Pages:**
- Репозиторий: `https://github.com/botanichk/my-keep`
- Деплой через GitHub Actions (автоматически при push)
- Публикация: `https://botanichk.github.io/my-keep`

**Netlify:**
- Ручной деплой: `npx netlify deploy --prod --dir=dist`
- URL: `https://mykeep-app-2026.netlify.app`

---

*Последнее обновление: 2026-03-19*
