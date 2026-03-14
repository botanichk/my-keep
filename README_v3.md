# 📝 My Keep v3 — Что нового

## ✨ Новые возможности

### 🗄️ Архив
- Архивируйте заметки, которые не нужны на главной
- Доступ к архиву через боковую панель
- Восстанавливайте заметки из архива

### 🖼️ Изображения
- Загружайте фото в заметки (до 5 МБ)
- Предпросмотр в карточке и модалке
- Хранение в Firebase Storage

### 🏷️ Метки (Labels)
- Создавайте цветные метки
- Назначайте несколько меток на заметку
- Фильтрация по меткам в боковой панели

### 📁 Папки (Folders)
- Организовывайте заметки по папкам
- Создание, редактирование, удаление папок
- Перемещение заметок между папками

### 🎨 Новый дизайн
- Тёплая кремовая палитра (Claude AI Mobile style)
- 12 цветов для заметок
- Плавные анимации и hover-эффекты
- Адаптивная Masonry-сетка (1-4 колонки)

---

## 📁 Структура проекта

```
src/
├── theme.js                    ← цвета и палитра
├── hooks/
│   ├── useNotes.js             ← CRUD заметок + изображения
│   ├── useLabels.js            ← CRUD меток
│   └── useFolders.js           ← CRUD папок
├── components/
│   ├── layout/
│   │   ├── Header.jsx          ← шапка + поиск
│   │   └── Sidebar.jsx         ← навигация
│   ├── notes/
│   │   ├── NoteForm.jsx        ← форма создания
│   │   ├── NoteCard.jsx        ← карточка
│   │   └── NoteModal.jsx       ← редактирование
│   └── ui/
│       ├── ColorPicker.jsx     ← выбор цвета
│       ├── LabelPicker.jsx     ← выбор меток
│       ├── ImageUpload.jsx     ← загрузка фото
│       └── EmptyState.jsx      ← заглушки
└── ...
```

---

## 🔥 Firebase

### Коллекции

**notes/**
```js
{
  title: string,
  text: string,
  color: string,       // '#FDFAF5'
  pinned: boolean,
  archived: boolean,   // НОВОЕ
  imageUrl: string,    // НОВОЕ (URL из Storage)
  labelIds: array,     // НОВОЕ (['id1', 'id2'])
  folderId: string,    // НОВОЕ (null = корень)
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**labels/** — НОВОЕ
```js
{
  name: string,
  color: string,       // '#D4763B'
  createdAt: timestamp
}
```

**folders/** — НОВОЕ
```js
{
  name: string,
  icon: string,        // '📁'
  createdAt: timestamp
}
```

### Правила Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Правила Firebase Storage

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /notes/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 🚀 Запуск

Dev-сервер уже работает: **http://localhost:5173**

Или заново:
```bash
cd my-keep
npm run dev
```

---

## 🎨 Цветовая палитра

**Фоны:**
- `#F5F0E8` — основной фон
- `#FDFAF5` — карточки
- `#EDE8DF` — боковая панель

**Акценты:**
- `#D4763B` — оранжевый (основной)
- `#C2662B` — при hover
- `#FAE8D8` — светлый

**Текст:**
- `#1C1917` — основной
- `#78716C` — вторичный
- `#A8A29E` — приглушённый

---

## ⚠️ Важные изменения

1. **Хук useNotes** теперь принимает параметры `(folderId, view)`
2. **NoteForm** требует `labels` и `onCreateLabel` props
3. **NoteCard** требует `labels`, `folders`, `onArchive` props
4. **EmptyState** использует `view` для разных заглушек

---

## 🔧 Настройка Firebase Console

1. **Firestore Database** → Rules:
   ```
   allow read, write: if true;
   ```

2. **Storage** → Rules:
   ```
   match /notes/{allPaths=**} {
     allow read, write: if true;
   }
   ```

3. Создайте коллекции вручную (появятся автоматически при первом использовании):
   - `labels`
   - `folders`

---

My Keep v3 — готов к использованию! 🎉
