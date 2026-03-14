# 📝 My Keep v5 — Спецификация исправлений

> **Что чиним в v5:**
> 1. Заметки появляются одновременно и в «Заметках» и в «Архиве»
> 2. Кнопка «Вернуть» удаляет заметку вместо восстановления
> 3. Иконка My Keep — листик с карандашом → красивая в стиле Claude
> 4. Заметки пропали, но метки остались — защита от потери данных
> 5. Удаление меток

---

## 1. Заметки в архиве и в заметках одновременно

**Причина:** Firestore требует составной индекс для запроса `where + orderBy`. Без него запрос падает с ошибкой и `onSnapshot` подписывается не на тот запрос — возвращает все документы без фильтрации.

**Решение — два шага:**

### Шаг 1 — Создать индексы в Firebase Console

Перейди в **Firebase Console → Firestore → Indexes → Composite** и создай:

| Collection | Fields | Order |
|---|---|---|
| `notes` | `archived` ASC, `createdAt` DESC | — |
| `notes` | `archived` ASC, `pinned` DESC, `createdAt` DESC | — |
| `notes` | `folderId` ASC, `archived` ASC, `createdAt` DESC | — |

> **Быстрый способ:** запусти приложение, открой консоль браузера — Firebase сам выдаст ссылку на создание нужного индекса. Просто кликни по ней.

### Шаг 2 — Обновить `src/hooks/useNotes.js`

Убираем `orderBy('pinned')` из запроса (он конфликтует) — сортируем закреплённые на клиенте.

```js
import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, query, orderBy, where, getDocs,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

export function useNotes(folderId = null, view = 'notes') {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;

    if (view === 'archive') {
      // Только архивные
      q = query(
        collection(db, 'notes'),
        where('archived', '==', true),
        orderBy('updatedAt', 'desc')
      );
    } else if (folderId) {
      // Заметки конкретной папки, не архивные
      q = query(
        collection(db, 'notes'),
        where('folderId', '==', folderId),
        where('archived', '==', false),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Главная: только НЕ архивные, folderId = null
      q = query(
        collection(db, 'notes'),
        where('archived', '==', false),
        where('folderId', '==', null),   // ← только корень, без папок
        orderBy('createdAt', 'desc')     // ← сортировка только по дате
      );
    }

    const unsub = onSnapshot(q, (snap) => {
      setNotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [folderId, view]);

  // ... остальные функции без изменений

  return { notes, loading, addNote, updateNote, deleteNote, toggleArchive, togglePin, uploadImage, uploadImageFromUrl };
}
```

### Шаг 3 — Сортировка закреплённых на клиенте в `App.jsx`

```jsx
// Заменяем разбивку на pinned/others:
const allNotes = notes; // notes уже отфильтрованы хуком

// Сортируем на клиенте — закреплённые вверху
const pinned = allNotes.filter((n) => n.pinned);
const others  = allNotes.filter((n) => !n.pinned);
```

---

## 2. Кнопка «Вернуть» удаляет заметку

**Причина:** `toggleArchive` вызывается с `note.archived = true` (заметка в архиве), но логика `!archived` превращает это в `false` — это правильно. Проблема в том, что **после восстановления заметка пропадает из архивного `onSnapshot`** (она больше не `archived: true`), и UI воспринимает это как удаление.

Это ожидаемое поведение Firestore — заметка реально восстанавливается. Проблема в UX: нет никакого подтверждения. Добавляем toast-уведомление.

### `src/hooks/useNotes.js` — добавить колбэк

```js
// toggleArchive теперь принимает колбэк onRestored
const toggleArchive = async (id, archived, onRestored) => {
  await updateDoc(doc(db, 'notes', id), {
    archived: !archived,
    pinned: false,
    updatedAt: serverTimestamp(),
  });
  // Если восстанавливаем — вызываем колбэк
  if (archived && onRestored) onRestored();
};
```

### `src/components/ui/Toast.jsx` — новый компонент

```jsx
import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export default function Toast({ message, onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                    flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl
                    bg-[#1C1917] text-white text-sm font-medium
                    animate-[slideIn_0.2s_ease]">
      <CheckCircle size={16} className="text-[#D4763B]" />
      {message}
    </div>
  );
}
```

### `src/App.jsx` — подключить Toast

```jsx
import Toast from './components/ui/Toast';
import { useState } from 'react';

// Добавь state:
const [toast, setToast] = useState(null);
const showToast = (msg) => setToast(msg);

// Передавай колбэк при вызове toggleArchive из карточки/модалки:
const handleArchive = (id, archived) => {
  toggleArchive(id, archived, archived ? () => showToast('Заметка восстановлена') : null);
};

// В JSX в конце перед закрывающим </div>:
{toast && <Toast message={toast} onHide={() => setToast(null)} />}
```

### Обнови пропы NoteCard и NoteModal

```jsx
// Передавай handleArchive вместо toggleArchive:
<NoteCard ... onArchive={handleArchive} />
<NoteModal ... onArchive={handleArchive} />
```

---

## 3. Иконка My Keep

Меняем эмодзи 📝 на SVG-иконку в стиле Claude AI — тёплый оранжевый, закруглённые формы.

### `src/components/ui/AppIcon.jsx` — новый компонент

```jsx
// Иконка: лист с загнутым углом + мягкая точка — стиль Claude AI Mobile
export default function AppIcon({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Фон — тёплый оранжевый круг как у Claude */}
      <rect width="32" height="32" rx="9" fill="#D4763B" />

      {/* Лист бумаги */}
      <path
        d="M9 8h10l4 4v12a1 1 0 01-1 1H9a1 1 0 01-1-1V9a1 1 0 011-1z"
        fill="white"
        fillOpacity="0.95"
      />

      {/* Загнутый угол */}
      <path
        d="M19 8l4 4h-3a1 1 0 01-1-1V8z"
        fill="#C2662B"
        fillOpacity="0.6"
      />

      {/* Строчки текста */}
      <rect x="11" y="14" width="8" height="1.5" rx="0.75" fill="#D4763B" />
      <rect x="11" y="17" width="6" height="1.5" rx="0.75" fill="#D4763B" fillOpacity="0.6" />
      <rect x="11" y="20" width="7" height="1.5" rx="0.75" fill="#D4763B" fillOpacity="0.4" />
    </svg>
  );
}
```

### Обновить `src/components/layout/Header.jsx`

```jsx
import AppIcon from '../ui/AppIcon';

// Заменить эмодзи 📝 на:
<div className="flex items-center gap-2 min-w-max">
  <AppIcon size={28} />
  <span className="text-base font-semibold text-[#1C1917] hidden sm:block">My Keep</span>
</div>
```

### Обновить `index.html` — favicon

```html
<!-- В <head> заменить стандартный favicon на SVG -->
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>
    <rect width='32' height='32' rx='9' fill='%23D4763B'/>
    <path d='M9 8h10l4 4v12a1 1 0 01-1 1H9a1 1 0 01-1-1V9a1 1 0 011-1z' fill='white'/>
    <path d='M19 8l4 4h-3a1 1 0 01-1-1V8z' fill='%23C2662B' fill-opacity='.6'/>
    <rect x='11' y='14' width='8' height='1.5' rx='.75' fill='%23D4763B'/>
    <rect x='11' y='17' width='6' height='1.5' rx='.75' fill='%23D4763B' fill-opacity='.6'/>
  </svg>
" />
```

---

## 4. Заметки пропали, метки остались

**Причина:** Firestore удаляет документы `notes` если нарушены правила (истёк test mode через 30 дней) или был `writeBatch` с ошибкой. Метки хранятся в отдельной коллекции `labels` — их не затронуло.

**Решение — три уровня защиты:**

### Уровень 1 — Проверить правила Firestore

```
// Firebase Console → Firestore → Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // убедись что это именно так
    }
  }
}
```

> ⚠️ Test mode истекает через **30 дней**. После этого все запросы блокируются — данные в базе остаются, но приложение их не видит. Обнови правила если прошло больше месяца.

### Уровень 2 — Мягкое удаление вместо физического

Вместо `deleteDoc` помечаем заметку как удалённую. Так данные не теряются.

```js
// src/hooks/useNotes.js — заменить deleteNote:
const deleteNote = async (id, imageUrl) => {
  // Физически удаляем картинку из Storage
  if (imageUrl && imageUrl.includes('firebasestorage')) {
    try { await deleteObject(ref(storage, imageUrl)); } catch (_) {}
  }
  // Мягкое удаление — помечаем флагом вместо deleteDoc
  await updateDoc(doc(db, 'notes', id), {
    deleted: true,
    deletedAt: serverTimestamp(),
  });
};
```

Добавь `where('deleted', '!=', true)` в все запросы useNotes, или проще — фильтруй на клиенте:

```js
// В onSnapshot:
const unsub = onSnapshot(q, (snap) => {
  setNotes(
    snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((n) => !n.deleted)   // ← скрываем помеченные удалёнными
  );
  setLoading(false);
});
```

### Уровень 3 — Показать ошибку если Firestore недоступен

```js
// В useNotes — добавить обработку ошибки подписки:
const unsub = onSnapshot(q,
  (snap) => {
    setNotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((n) => !n.deleted));
    setLoading(false);
  },
  (error) => {
    console.error('Firestore error:', error);
    setLoading(false);
    // Показываем пользователю — добавь state error в хук и отображай в App.jsx
  }
);
```

---

## 5. Удаление меток

### `src/hooks/useLabels.js` — обновить deleteLabel

При удалении метки убираем её из всех заметок через `writeBatch`:

```js
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy, getDocs, writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

export function useLabels() {
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'labels'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
      setLabels(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const addLabel = async (name, color = '#D4763B') => {
    if (!name.trim()) return;
    await addDoc(collection(db, 'labels'), {
      name: name.trim(), color, createdAt: serverTimestamp(),
    });
  };

  const updateLabel = async (id, changes) => {
    await updateDoc(doc(db, 'labels', id), changes);
  };

  // Удалить метку + убрать её из всех заметок
  const deleteLabel = async (id) => {
    // Находим все заметки с этой меткой
    const notesSnap = await getDocs(collection(db, 'notes'));
    const affected = notesSnap.docs.filter((d) =>
      d.data().labelIds?.includes(id)
    );

    if (affected.length > 0) {
      const batch = writeBatch(db);
      affected.forEach((noteDoc) => {
        const newLabelIds = noteDoc.data().labelIds.filter((lid) => lid !== id);
        batch.update(doc(db, 'notes', noteDoc.id), { labelIds: newLabelIds });
      });
      await batch.commit();
    }

    // Удаляем саму метку
    await deleteDoc(doc(db, 'labels', id));
  };

  return { labels, addLabel, updateLabel, deleteLabel };
}
```

### Обновить `src/components/layout/Sidebar.jsx` — кнопка удаления меток

```jsx
// В секции меток — добавить кнопку удаления рядом с каждой меткой:
<div className="space-y-1">
  {labels.map((label) => (
    <div key={label.id} className="group flex items-center gap-1">
      <button
        onClick={() => { onNavigate('label', label.id); onClose?.(); }}
        className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl text-sm
                   text-[#78716C] hover:bg-[#E8E0D4] hover:text-[#1C1917] transition"
      >
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: label.color }}
        />
        <span className="flex-1 text-left truncate">{label.name}</span>
      </button>

      {/* Кнопка удаления — появляется при наведении */}
      <button
        onClick={() => onDeleteLabel(label.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full
                   text-[#A8A29E] hover:text-red-500 hover:bg-red-50 transition"
        title="Удалить метку"
      >
        <Trash2 size={13} />
      </button>
    </div>
  ))}
</div>
```

Добавь `Trash2` в импорты и проп `onDeleteLabel` в Sidebar:

```jsx
// Сигнатура Sidebar:
export default function Sidebar({
  folders, labels, view, folderId,
  onNavigate, onAddFolder, onUpdateFolder, onDeleteFolder,
  onDeleteLabel,    // ← новый проп
  isOpen, onClose
})
```

### Обновить `App.jsx` — передать onDeleteLabel

```jsx
<Sidebar
  ...
  onDeleteLabel={deleteLabel}    // ← передаём из useLabels
/>
```

### Также добавить удаление из `LabelPicker.jsx`

```jsx
// В списке меток рядом с каждой добавить крестик:
{labels.map((label) => (
  <div key={label.id} className="flex items-center group">
    <button
      onClick={() => toggle(label.id)}
      className="flex items-center gap-2 flex-1 px-2 py-1.5 rounded-lg hover:bg-[#FAE8D8] transition text-left"
    >
      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />
      <span className="text-sm text-[#1C1917] flex-1">{label.name}</span>
      {selectedIds.includes(label.id) && (
        <span className="text-[#D4763B] text-xs font-bold">✓</span>
      )}
    </button>

    {/* Удалить метку прямо из пикера */}
    <button
      onClick={() => onDeleteLabel?.(label.id)}
      className="opacity-0 group-hover:opacity-100 p-1 text-[#A8A29E] hover:text-red-500 transition"
      title="Удалить метку"
    >
      <X size={12} />
    </button>
  </div>
))}
```

Добавь проп `onDeleteLabel` в LabelPicker и передай `deleteLabel` из хука через NoteForm и NoteModal.

---

## ✅ Итог изменений v5

| Баг | Причина | Решение |
|---|---|---|
| Заметки и в архиве и в заметках | Firestore запрос без индекса возвращает всё | Составные индексы + `where('folderId', '==', null)` |
| «Вернуть» удаляет заметку | Заметка уходит из архивного onSnapshot — выглядит как удаление | Toast «Заметка восстановлена» + колбэк |
| Некрасивая иконка 📝 | Эмодзи | SVG-иконка в стиле Claude: оранжевый фон + лист с линиями |
| Заметки пропали сами | Истёк test mode (30 дней) или ошибка batch | Проверить Rules + мягкое удаление + обработка ошибок |
| Нельзя удалить метку | Функция была, UI не был | Кнопка в Sidebar + в LabelPicker + batch-очистка из заметок |
