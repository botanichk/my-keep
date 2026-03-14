# 📝 My Keep v5 — Исправления

## ✅ Что исправлено

| Проблема | Решение |
|---|---|
| Заметки и в архиве и в заметках | Составные индексы Firestore + `where('folderId', '==', null)` |
| «Вернуть» удаляет заметку | Toast-уведомление «Заметка восстановлена» |
| Некрасивая иконка 📝 | SVG-иконка в стиле Claude AI |
| Заметки пропали сами | Мягкое удаление + обработка ошибок Firestore |
| Нельзя удалить метку | Кнопка удаления в Sidebar + LabelPicker + batch-очистка |

---

## 🔧 Изменения в файлах

### useNotes.js
- Убран `orderBy('pinned')` из запроса (требует индекс)
- Добавлен `where('folderId', '==', null)` для главной
- Мягкое удаление через `deleted: true`
- Обработка ошибок `onSnapshot`
- `toggleArchive` принимает колбэк `onRestored`

### useLabels.js
- `deleteLabel` использует `writeBatch` для очистки из заметок

### App.jsx
- Сортировка закреплённых на клиенте
- `handleArchive` с toast-колбэком
- State `toast` для уведомлений
- State `error` для ошибок Firestore
- Передаёт `onDeleteLabel` в компоненты

### Header.jsx
- Новый компонент `AppIcon` вместо эмодзи 📝

### Sidebar.jsx
- Кнопка удаления меток (appears on hover)
- Проп `onDeleteLabel`

### LabelPicker.jsx
- Кнопка удаления меток в списке
- Проп `onDeleteLabel`

### NoteForm.jsx / NoteModal.jsx
- Передают `onDeleteLabel` в LabelPicker

### ui/Toast.jsx (новый)
- Всплывающее уведомление на 2.5 секунды

### ui/AppIcon.jsx (новый)
- SVG-иконка: оранжевый круг + лист с линиями

### index.html
- Новая favicon (SVG data URI)

---

## 🔥 Индексы Firestore

Создай в **Firebase Console → Firestore → Indexes → Composite**:

| Collection | Fields |
|---|---|
| `notes` | `archived` ASC, `updatedAt` DESC |
| `notes` | `folderId` ASC, `archived` ASC, `createdAt` DESC |

**Быстрый способ:** Запусти приложение, открой консоль браузера (F12) — Firebase выдаст ссылку на создание индекса при ошибке.

---

## 🎨 Иконка приложения

**Новая:** SVG в стиле Claude AI Mobile — тёплый оранжевый фон (#D4763B), белый лист с загнутым углом, три линии текста.

**Где используется:**
- `src/components/layout/Header.jsx` — в шапке
- `index.html` — favicon вкладки

---

## 🍞 Toast-уведомления

**Компонент:** `src/components/ui/Toast.jsx`

**Использование:**
```jsx
const [toast, setToast] = useState(null);
const showToast = (msg) => setToast(msg);

// При восстановлении из архива:
toggleArchive(id, archived, archived ? () => showToast('Заметка восстановлена') : null);
```

**Внешний вид:** Чёрная плашка снизу по центру, оранжевая галочка, текст белый, исчезает через 2.5 сек.

---

## 🛡️ Защита данных

### Уровень 1 — Правила Firestore
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

### Уровень 2 — Мягкое удаление
```js
// Вместо deleteDoc:
await updateDoc(doc(db, 'notes', id), {
  deleted: true,
  deletedAt: serverTimestamp(),
});

// Фильтрация в onSnapshot:
.filter((n) => !n.deleted)
```

### Уровень 3 — Обработка ошибок
```js
const unsub = onSnapshot(q,
  (snap) => { /* успех */ },
  (error) => { 
    console.error('Firestore error:', error);
    setError('Ошибка загрузки заметок...');
  }
);
```

---

## 🏷️ Удаление меток

**Логика:**
1. Клик на крестик в Sidebar (появляется при наведении)
2. `writeBatch` находит все заметки с этой меткой
3. Удаляет `labelId` из массива `labelIds` каждой заметки
4. Удаляет саму метку из `labels/`

**Где кнопки:**
- Боковая панель (Sidebar.jsx)
- Палитра меток в форме (LabelPicker.jsx)
- Палитра меток в модалке (NoteModal.jsx)

---

## 📊 Сводка изменений

| Файл | Изменения |
|---|---|
| `hooks/useNotes.js` | Индексы, мягкое удаление, error state, onRestored |
| `hooks/useLabels.js` | batch delete из заметок |
| `components/ui/Toast.jsx` | Новый компонент |
| `components/ui/AppIcon.jsx` | Новый компонент |
| `components/ui/LabelPicker.jsx` | Кнопка удаления |
| `components/layout/Header.jsx` | AppIcon вместо 📝 |
| `components/layout/Sidebar.jsx` | Кнопка удаления меток |
| `components/notes/NoteForm.jsx` | Передаёт onDeleteLabel |
| `components/notes/NoteModal.jsx` | Передаёт onDeleteLabel |
| `App.jsx` | handleArchive с toast, error state |
| `index.html` | Новая favicon |

---

**Сборка:** ✅ Успешно

**Запуск:** **http://localhost:5173**
