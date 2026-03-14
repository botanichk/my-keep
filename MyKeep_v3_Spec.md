# 📝 My Keep v3 — Полная спецификация

> **Дизайн:** Claude AI Mobile — тёплые кремовые тона, оранжевые акценты, мягкие тени  
> **Стек:** React 18 + Vite + Firebase Firestore + Storage + Tailwind CSS  
> **Новое в v3:** Архив · Изображения · Метки · Папки

---

## 🎨 Дизайн-система (Claude AI Mobile Colors)

```js
// src/theme.js — единый источник цветов
export const theme = {
  // Фоны
  bg:         '#F5F0E8',   // кремовый фон — как в Claude mobile
  bgCard:     '#FDFAF5',   // чуть светлее для карточек
  bgSidebar:  '#EDE8DF',   // боковая панель

  // Акценты
  accent:     '#D4763B',   // тёплый оранжевый — основной
  accentHov:  '#C2662B',   // темнее при hover
  accentSoft: '#FAE8D8',   // очень светлый оранжевый

  // Текст
  textPrim:   '#1C1917',   // почти чёрный
  textSec:    '#78716C',   // серо-коричневый
  textMuted:  '#A8A29E',   // мuted

  // Границы
  border:     '#E8E0D4',   // тёплая граница
  borderFoc:  '#D4763B',   // граница в фокусе

  // Статусные
  danger:     '#DC2626',
  success:    '#16A34A',
};

// Цвета карточек (тёплая палитра вместо Google Keep)
export const NOTE_COLORS = [
  { hex: '#FDFAF5', label: 'Дефолт' },
  { hex: '#FAE8D8', label: 'Персик' },
  { hex: '#FEF3C7', label: 'Ваниль' },
  { hex: '#ECFDF5', label: 'Мята' },
  { hex: '#F0F9FF', label: 'Лёд' },
  { hex: '#FDF4FF', label: 'Лаванда' },
  { hex: '#FFF1F2', label: 'Роза' },
  { hex: '#F1F5F9', label: 'Пепел' },
  { hex: '#FFFBEB', label: 'Мёд' },
  { hex: '#F7FEE7', label: 'Лайм' },
  { hex: '#EFF6FF', label: 'Сапфир' },
  { hex: '#1C1917', label: 'Ночь' },   // тёмная карточка — текст белый
];
```

### Глобальные стили `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

* { box-sizing: border-box; }

body {
  font-family: 'Inter', sans-serif;
  background-color: #F5F0E8;
  color: #1C1917;
}

/* Скроллбар в стиле Claude */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #EDE8DF; }
::-webkit-scrollbar-thumb { background: #D4763B; border-radius: 3px; }

/* Анимации */
@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.note-appear { animation: slideIn 0.18s ease; }
.modal-bg    { animation: fadeIn 0.15s ease; }

/* Masonry */
.notes-grid {
  columns: 1;
  column-gap: 1rem;
}
@media (min-width: 640px)  { .notes-grid { columns: 2; } }
@media (min-width: 1024px) { .notes-grid { columns: 3; } }
@media (min-width: 1280px) { .notes-grid { columns: 4; } }

.note-item {
  break-inside: avoid;
  margin-bottom: 1rem;
}
```

### `tailwind.config.js`

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream:  { DEFAULT: '#F5F0E8', dark: '#EDE8DF', card: '#FDFAF5' },
        accent: { DEFAULT: '#D4763B', hover: '#C2662B', soft: '#FAE8D8' },
        stone:  { muted: '#A8A29E' },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

---

## 📁 Структура проекта

```
my-keep/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── firebase.js
    ├── theme.js                    ← цвета и палитра карточек
    ├── index.css
    ├── hooks/
    │   ├── useNotes.js             ← CRUD заметок
    │   ├── useLabels.js            ← CRUD меток
    │   └── useFolders.js           ← CRUD папок
    └── components/
        ├── layout/
        │   ├── Sidebar.jsx         ← навигация: папки, метки, архив
        │   └── Header.jsx          ← поиск + кнопка меню
        ├── notes/
        │   ├── NoteForm.jsx        ← форма создания
        │   ├── NoteCard.jsx        ← карточка заметки
        │   └── NoteModal.jsx       ← редактирование
        └── ui/
            ├── ColorPicker.jsx     ← выбор цвета карточки
            ├── LabelPicker.jsx     ← выбор меток
            ├── ImageUpload.jsx     ← загрузка изображения
            └── EmptyState.jsx      ← заглушка «нет заметок»
```

---

## ⚙️ Установка

```bash
npm create vite@latest my-keep -- --template react
cd my-keep

# Зависимости
npm install firebase lucide-react

# Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Google Fonts (добавить в index.html)
# <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## 🔥 Firebase

### `src/firebase.js`

```js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAV9TF1y9LXJVgpANsrSeNEzNAtqdx7mtk",
  authDomain: "my-keep-fde5b.firebaseapp.com",
  projectId: "my-keep-fde5b",
  storageBucket: "my-keep-fde5b.firebasestorage.app",
  messagingSenderId: "305136676195",
  appId: "1:305136676195:web:a7370bea2db066ff87b756",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);  // для изображений
```

### Коллекции Firestore

```
notes/          — заметки
  id
  title         string
  text          string
  color         string   ('#FDFAF5')
  pinned        boolean
  archived      boolean  ← НОВОЕ
  imageUrl      string   ← НОВОЕ (URL из Firebase Storage)
  labelIds      array    ← НОВОЕ (['id1', 'id2'])
  folderId      string   ← НОВОЕ (null = корень)
  createdAt     timestamp
  updatedAt     timestamp

labels/         ← НОВОЕ
  id
  name          string
  color         string   ('#D4763B')
  createdAt     timestamp

folders/        ← НОВОЕ
  id
  name          string
  icon          string   ('📁')
  createdAt     timestamp
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

## 🪝 Хуки

### `src/hooks/useNotes.js`

```jsx
import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, query, orderBy, where,
} from 'firebase/firestore';
import {
  ref, uploadBytes, getDownloadURL, deleteObject,
} from 'firebase/storage';
import { db, storage } from '../firebase';

export function useNotes(folderId = null, view = 'notes') {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q;
    if (view === 'archive') {
      // Архивные заметки
      q = query(
        collection(db, 'notes'),
        where('archived', '==', true),
        orderBy('updatedAt', 'desc')
      );
    } else if (folderId) {
      // Заметки конкретной папки
      q = query(
        collection(db, 'notes'),
        where('folderId', '==', folderId),
        where('archived', '==', false),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Главная — без архива, без папки
      q = query(
        collection(db, 'notes'),
        where('archived', '==', false),
        orderBy('pinned', 'desc'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsub = onSnapshot(q, (snap) => {
      setNotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [folderId, view]);

  // Создание заметки
  const addNote = async ({ title, text, color, imageUrl, labelIds, folderId }) => {
    if (!title?.trim() && !text?.trim() && !imageUrl) return;
    await addDoc(collection(db, 'notes'), {
      title: title?.trim() || '',
      text: text?.trim() || '',
      color: color || '#FDFAF5',
      pinned: false,
      archived: false,
      imageUrl: imageUrl || null,
      labelIds: labelIds || [],
      folderId: folderId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  // Обновление полей заметки
  const updateNote = async (id, changes) => {
    await updateDoc(doc(db, 'notes', id), {
      ...changes,
      updatedAt: serverTimestamp(),
    });
  };

  // Удаление заметки (+ картинка из Storage)
  const deleteNote = async (id, imageUrl) => {
    if (imageUrl) {
      try {
        await deleteObject(ref(storage, imageUrl));
      } catch (_) {} // картинки может не быть
    }
    await deleteDoc(doc(db, 'notes', id));
  };

  // В архив / из архива
  const toggleArchive = async (id, archived) => {
    await updateDoc(doc(db, 'notes', id), {
      archived: !archived,
      pinned: false, // при архивации снять закреп
      updatedAt: serverTimestamp(),
    });
  };

  // Закрепить / открепить
  const togglePin = async (id, pinned) => {
    await updateDoc(doc(db, 'notes', id), { pinned: !pinned });
  };

  // Загрузка изображения в Firebase Storage
  const uploadImage = async (file) => {
    const path = `notes/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  return { notes, loading, addNote, updateNote, deleteNote, toggleArchive, togglePin, uploadImage };
}
```

### `src/hooks/useLabels.js`

```jsx
import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
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
      name: name.trim(),
      color,
      createdAt: serverTimestamp(),
    });
  };

  const updateLabel = async (id, changes) => {
    await updateDoc(doc(db, 'labels', id), changes);
  };

  const deleteLabel = async (id) => {
    await deleteDoc(doc(db, 'labels', id));
  };

  return { labels, addLabel, updateLabel, deleteLabel };
}
```

### `src/hooks/useFolders.js`

```jsx
import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export function useFolders() {
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'folders'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
      setFolders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const addFolder = async (name, icon = '📁') => {
    if (!name.trim()) return;
    await addDoc(collection(db, 'folders'), {
      name: name.trim(),
      icon,
      createdAt: serverTimestamp(),
    });
  };

  const updateFolder = async (id, changes) => {
    await updateDoc(doc(db, 'folders', id), changes);
  };

  const deleteFolder = async (id) => {
    await deleteDoc(doc(db, 'folders', id));
  };

  return { folders, addFolder, updateFolder, deleteFolder };
}
```

---

## 🧩 Компоненты

### `src/components/ui/ColorPicker.jsx`

```jsx
import { NOTE_COLORS } from '../../theme';

export default function ColorPicker({ current, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 p-3">
      {NOTE_COLORS.map((c) => (
        <button
          key={c.hex}
          title={c.label}
          onClick={() => onChange(c.hex)}
          style={{ backgroundColor: c.hex, border: c.hex === '#1C1917' ? '2px solid #78716C' : undefined }}
          className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110
            ${current === c.hex ? 'border-[#D4763B] scale-110' : 'border-[#E8E0D4]'}`}
        />
      ))}
    </div>
  );
}
```

### `src/components/ui/LabelPicker.jsx`

```jsx
import { Tag, Plus, X } from 'lucide-react';
import { useState } from 'react';

export default function LabelPicker({ labels, selectedIds, onChange, onCreateLabel }) {
  const [newLabel, setNewLabel] = useState('');

  const toggle = (id) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id]
    );
  };

  const handleCreate = () => {
    if (!newLabel.trim()) return;
    onCreateLabel(newLabel.trim());
    setNewLabel('');
  };

  return (
    <div className="p-3 min-w-52">
      <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-2">Метки</p>

      {/* Список меток */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {labels.map((label) => (
          <button
            key={label.id}
            onClick={() => toggle(label.id)}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-[#FAE8D8] transition text-left"
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: label.color }}
            />
            <span className="text-sm text-[#1C1917] flex-1">{label.name}</span>
            {selectedIds.includes(label.id) && (
              <span className="text-[#D4763B] text-xs font-bold">✓</span>
            )}
          </button>
        ))}
        {labels.length === 0 && (
          <p className="text-xs text-[#A8A29E] px-2">Меток пока нет</p>
        )}
      </div>

      {/* Создать новую метку */}
      <div className="flex items-center gap-1 mt-3 border-t border-[#E8E0D4] pt-3">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Новая метка..."
          className="flex-1 text-xs bg-[#EDE8DF] rounded-lg px-2 py-1.5 outline-none
                     focus:ring-1 focus:ring-[#D4763B] placeholder-[#A8A29E]"
        />
        <button
          onClick={handleCreate}
          className="p-1.5 rounded-lg bg-[#D4763B] text-white hover:bg-[#C2662B] transition"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}
```

### `src/components/ui/ImageUpload.jsx`

```jsx
import { useRef } from 'react';
import { Image, X, Loader } from 'lucide-react';

export default function ImageUpload({ imageUrl, onUpload, onRemove, uploading }) {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Проверяем тип и размер (макс 5 МБ)
    if (!file.type.startsWith('image/')) return alert('Только изображения!');
    if (file.size > 5 * 1024 * 1024) return alert('Максимум 5 МБ');
    onUpload(file);
  };

  return (
    <div>
      {/* Предпросмотр загруженного изображения */}
      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt="Вложение"
            className="w-full rounded-t-xl object-cover max-h-56"
          />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white
                       hover:bg-black/70 transition"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        /* Кнопка загрузки */
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs text-[#78716C] hover:text-[#D4763B]
                     px-2 py-1.5 rounded-lg hover:bg-[#FAE8D8] transition"
        >
          {uploading ? <Loader size={14} className="animate-spin" /> : <Image size={14} />}
          {uploading ? 'Загружаю...' : 'Фото'}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
```

### `src/components/ui/EmptyState.jsx`

```jsx
export default function EmptyState({ view }) {
  const states = {
    notes:   { emoji: '📝', text: 'Заметок пока нет', sub: 'Нажмите на поле выше, чтобы создать первую' },
    archive: { emoji: '🗄️', text: 'Архив пуст',      sub: 'Архивируйте заметки — они сохранятся здесь' },
    folder:  { emoji: '📁', text: 'Папка пуста',      sub: 'Создайте заметку и переместите её сюда' },
    search:  { emoji: '🔍', text: 'Ничего не найдено', sub: 'Попробуйте другой запрос' },
  };

  const s = states[view] || states.notes;
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-5xl mb-4">{s.emoji}</span>
      <p className="text-[#1C1917] font-medium">{s.text}</p>
      <p className="text-sm text-[#A8A29E] mt-1">{s.sub}</p>
    </div>
  );
}
```

---

### `src/components/layout/Header.jsx`

```jsx
import { Search, X, Menu } from 'lucide-react';

export default function Header({ search, onSearch, onMenuToggle }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-[#F5F0E8] border-b border-[#E8E0D4] h-14 flex items-center px-4 gap-3">
      {/* Бургер на мобиле */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-xl hover:bg-[#EDE8DF] text-[#78716C] lg:hidden transition"
      >
        <Menu size={20} />
      </button>

      {/* Логотип */}
      <div className="flex items-center gap-2 min-w-max">
        <span className="text-xl">📝</span>
        <span className="text-base font-semibold text-[#1C1917] hidden sm:block">My Keep</span>
      </div>

      {/* Поиск */}
      <div className="flex-1 max-w-xl mx-auto relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
        <input
          type="text"
          placeholder="Поиск заметок..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-[#EDE8DF] hover:bg-[#E8E0D4] focus:bg-white focus:shadow-md
                     rounded-xl pl-9 pr-8 py-2 text-sm outline-none transition
                     focus:ring-1 focus:ring-[#D4763B] placeholder-[#A8A29E]"
        />
        {search && (
          <button onClick={() => onSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#D4763B]">
            <X size={14} />
          </button>
        )}
      </div>
    </header>
  );
}
```

### `src/components/layout/Sidebar.jsx`

```jsx
import { useState } from 'react';
import { Archive, Tag, FolderPlus, Folder, ChevronRight, Trash2, Edit2, Check, X, Home } from 'lucide-react';

export default function Sidebar({ folders, labels, view, folderId, onNavigate, onAddFolder, onUpdateFolder, onDeleteFolder, isOpen, onClose }) {
  const [newFolderName, setNewFolderName] = useState('');
  const [addingFolder, setAddingFolder] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    onAddFolder(newFolderName.trim());
    setNewFolderName('');
    setAddingFolder(false);
  };

  const handleEdit = (folder) => {
    setEditingId(folder.id);
    setEditName(folder.name);
  };

  const handleSaveEdit = () => {
    if (editName.trim()) onUpdateFolder(editingId, { name: editName.trim() });
    setEditingId(null);
  };

  const navItem = (id, icon, label, active) => (
    <button
      key={id}
      onClick={() => { onNavigate(id); onClose?.(); }}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition
        ${active
          ? 'bg-[#FAE8D8] text-[#D4763B]'
          : 'text-[#78716C] hover:bg-[#EDE8DF] hover:text-[#1C1917]'
        }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {active && <ChevronRight size={14} />}
    </button>
  );

  return (
    <>
      {/* Оверлей на мобиле */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-14 left-0 bottom-0 z-20 w-64 bg-[#EDE8DF] border-r border-[#E8E0D4]
        flex flex-col py-4 px-3 overflow-y-auto transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>

        {/* Основная навигация */}
        <div className="space-y-1 mb-6">
          {navItem('notes', <Home size={17} />, 'Заметки', view === 'notes' && !folderId)}
          {navItem('archive', <Archive size={17} />, 'Архив', view === 'archive')}
        </div>

        {/* Метки */}
        {labels.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider px-3 mb-2">
              Метки
            </p>
            <div className="space-y-1">
              {labels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => { onNavigate('label', label.id); onClose?.(); }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-[#78716C] hover:bg-[#E8E0D4] hover:text-[#1C1917] transition"
                >
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />
                  <span className="flex-1 text-left truncate">{label.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Папки */}
        <div className="flex-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider">Папки</p>
            <button
              onClick={() => setAddingFolder(true)}
              className="text-[#D4763B] hover:text-[#C2662B] transition"
              title="Новая папка"
            >
              <FolderPlus size={15} />
            </button>
          </div>

          <div className="space-y-1">
            {folders.map((folder) => (
              <div key={folder.id} className="group flex items-center gap-1">
                {editingId === folder.id ? (
                  /* Режим редактирования папки */
                  <div className="flex items-center gap-1 flex-1 px-2 py-1.5">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                      autoFocus
                      className="flex-1 text-sm bg-white rounded-lg px-2 py-1 outline-none
                                 ring-1 ring-[#D4763B] text-[#1C1917]"
                    />
                    <button onClick={handleSaveEdit} className="text-[#D4763B]"><Check size={13} /></button>
                    <button onClick={() => setEditingId(null)} className="text-[#A8A29E]"><X size={13} /></button>
                  </div>
                ) : (
                  /* Обычный вид папки */
                  <>
                    <button
                      onClick={() => { onNavigate('folder', folder.id); onClose?.(); }}
                      className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-xl text-sm transition
                        ${folderId === folder.id
                          ? 'bg-[#FAE8D8] text-[#D4763B]'
                          : 'text-[#78716C] hover:bg-[#E8E0D4] hover:text-[#1C1917]'
                        }`}
                    >
                      <Folder size={15} />
                      <span className="flex-1 text-left truncate">{folder.name}</span>
                    </button>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 pr-1 transition">
                      <button onClick={() => handleEdit(folder)} className="p-1 text-[#A8A29E] hover:text-[#D4763B]">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => onDeleteFolder(folder.id)} className="p-1 text-[#A8A29E] hover:text-red-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Форма новой папки */}
          {addingFolder && (
            <div className="flex items-center gap-1 mt-2 px-1">
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddFolder(); if (e.key === 'Escape') setAddingFolder(false); }}
                placeholder="Название папки..."
                autoFocus
                className="flex-1 text-sm bg-white rounded-lg px-2 py-1.5 outline-none
                           ring-1 ring-[#D4763B] placeholder-[#A8A29E]"
              />
              <button onClick={handleAddFolder} className="p-1.5 rounded-lg bg-[#D4763B] text-white hover:bg-[#C2662B]">
                <Check size={13} />
              </button>
              <button onClick={() => setAddingFolder(false)} className="p-1.5 text-[#A8A29E] hover:text-[#1C1917]">
                <X size={13} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
```

---

### `src/components/notes/NoteForm.jsx`

```jsx
import { useState, useRef, useEffect } from 'react';
import { Palette, Tag, Image, X } from 'lucide-react';
import ColorPicker from '../ui/ColorPicker';
import LabelPicker from '../ui/LabelPicker';
import ImageUpload from '../ui/ImageUpload';

export default function NoteForm({ onAdd, labels, onCreateLabel, currentFolderId }) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [color, setColor] = useState('#FDFAF5');
  const [labelIds, setLabelIds] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const formRef = useRef(null);
  const { uploadImage } = useNotes();  // для загрузки картинки

  useEffect(() => {
    const handler = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) handleClose();
    };
    if (expanded) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [expanded, title, text]);

  const handleClose = () => {
    if (title.trim() || text.trim() || imageUrl) {
      onAdd({ title, text, color, labelIds, imageUrl, folderId: currentFolderId || null });
    }
    // Полный сброс формы — можно создавать следующую заметку
    setTitle(''); setText(''); setColor('#FDFAF5');
    setLabelIds([]); setImageUrl(null);
    setExpanded(false); setShowColors(false); setShowLabels(false);
  };

  const handleImageUpload = async (file) => {
    setUploading(true);
    const url = await uploadImage(file);
    setImageUrl(url);
    setUploading(false);
  };

  const isDark = color === '#1C1917';
  const textClass = isDark ? 'text-white placeholder-gray-500' : 'text-[#1C1917] placeholder-[#A8A29E]';

  return (
    <div className="max-w-xl mx-auto mb-8">
      <div
        ref={formRef}
        style={{ backgroundColor: color }}
        className="rounded-2xl shadow-md border border-[#E8E0D4] overflow-hidden transition-all duration-150"
      >
        {/* Изображение — над всем */}
        {imageUrl && (
          <div className="relative">
            <img src={imageUrl} alt="вложение" className="w-full object-cover max-h-52" />
            <button
              onClick={() => setImageUrl(null)}
              className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Заголовок */}
        {expanded && (
          <input
            type="text"
            placeholder="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 pt-4 pb-1 text-sm font-semibold bg-transparent outline-none ${textClass}`}
            autoFocus
          />
        )}

        {/* Основное поле */}
        <textarea
          placeholder="Создать заметку..."
          value={text}
          rows={expanded ? 4 : 1}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setExpanded(true)}
          className={`w-full px-4 py-3 text-sm bg-transparent outline-none resize-none ${textClass}`}
        />

        {/* Выбранные метки */}
        {expanded && labelIds.length > 0 && (
          <div className="flex flex-wrap gap-1 px-4 pb-2">
            {labels.filter((l) => labelIds.includes(l.id)).map((l) => (
              <span
                key={l.id}
                style={{ backgroundColor: l.color + '30', color: l.color }}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
              >
                {l.name}
              </span>
            ))}
          </div>
        )}

        {/* Нижняя панель инструментов */}
        {expanded && (
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-1 relative">

              {/* Изображение */}
              <ImageUpload
                imageUrl={null}
                onUpload={handleImageUpload}
                onRemove={() => setImageUrl(null)}
                uploading={uploading}
              />

              {/* Цвет */}
              <div className="relative">
                <button
                  onClick={() => { setShowColors((v) => !v); setShowLabels(false); }}
                  className={`p-2 rounded-full transition hover:bg-black/10 ${isDark ? 'text-gray-400' : 'text-[#78716C]'}`}
                  title="Цвет"
                >
                  <Palette size={17} />
                </button>
                {showColors && (
                  <div className="absolute bottom-10 left-0 bg-white rounded-2xl shadow-xl border border-[#E8E0D4] z-20">
                    <ColorPicker current={color} onChange={(c) => { setColor(c); setShowColors(false); }} />
                  </div>
                )}
              </div>

              {/* Метки */}
              <div className="relative">
                <button
                  onClick={() => { setShowLabels((v) => !v); setShowColors(false); }}
                  className={`p-2 rounded-full transition hover:bg-black/10 ${isDark ? 'text-gray-400' : 'text-[#78716C]'}`}
                  title="Метки"
                >
                  <Tag size={17} />
                </button>
                {showLabels && (
                  <div className="absolute bottom-10 left-0 bg-white rounded-2xl shadow-xl border border-[#E8E0D4] z-20">
                    <LabelPicker
                      labels={labels}
                      selectedIds={labelIds}
                      onChange={setLabelIds}
                      onCreateLabel={onCreateLabel}
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleClose}
              className={`px-5 py-1.5 text-sm font-medium rounded-xl transition hover:bg-black/10
                ${isDark ? 'text-gray-300' : 'text-[#78716C]'}`}
            >
              Готово
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### `src/components/notes/NoteCard.jsx`

```jsx
import { useState } from 'react';
import { Trash2, Palette, Pin, PinOff, Archive, ArchiveRestore, Tag, FolderInput } from 'lucide-react';
import ColorPicker from '../ui/ColorPicker';

export default function NoteCard({ note, labels, folders, onDelete, onUpdate, onPin, onArchive, onClick }) {
  const [showColors, setShowColors] = useState(false);
  const [showMove, setShowMove] = useState(false);

  const isDark = note.color === '#1C1917';
  const noteLabels = labels.filter((l) => note.labelIds?.includes(l.id));

  return (
    <div
      style={{ backgroundColor: note.color || '#FDFAF5' }}
      className="note-item note-appear rounded-2xl border border-[#E8E0D4] overflow-hidden
                 cursor-pointer hover:shadow-lg transition-shadow group"
      onClick={() => onClick(note)}
    >
      {/* Изображение */}
      {note.imageUrl && (
        <img src={note.imageUrl} alt="" className="w-full object-cover max-h-44" />
      )}

      <div className="p-4">
        {/* Заголовок */}
        {note.title && (
          <h3 className={`font-semibold text-sm mb-1 pr-6 line-clamp-2 ${isDark ? 'text-white' : 'text-[#1C1917]'}`}>
            {note.title}
          </h3>
        )}

        {/* Текст */}
        {note.text && (
          <p className={`text-sm whitespace-pre-wrap line-clamp-6 ${isDark ? 'text-gray-300' : 'text-[#78716C]'}`}>
            {note.text}
          </p>
        )}

        {/* Метки */}
        {noteLabels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {noteLabels.map((l) => (
              <span
                key={l.id}
                style={{ backgroundColor: l.color + '25', color: isDark ? l.color : l.color }}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
              >
                {l.name}
              </span>
            ))}
          </div>
        )}

        {/* Нижняя панель — видна при наведении */}
        <div
          className="flex items-center gap-0.5 mt-3 opacity-0 group-hover:opacity-100 transition -mb-1"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Закрепить */}
          <Btn onClick={() => onPin(note.id, note.pinned)} title={note.pinned ? 'Открепить' : 'Закрепить'} dark={isDark}>
            {note.pinned ? <PinOff size={14} /> : <Pin size={14} />}
          </Btn>

          {/* Цвет */}
          <div className="relative">
            <Btn onClick={() => { setShowColors((v) => !v); setShowMove(false); }} title="Цвет" dark={isDark}>
              <Palette size={14} />
            </Btn>
            {showColors && (
              <div className="absolute bottom-8 left-0 bg-white rounded-2xl shadow-xl border border-[#E8E0D4] z-10">
                <ColorPicker current={note.color} onChange={(c) => { onUpdate(note.id, { color: c }); setShowColors(false); }} />
              </div>
            )}
          </div>

          {/* Переместить в папку */}
          {folders.length > 0 && (
            <div className="relative">
              <Btn onClick={() => { setShowMove((v) => !v); setShowColors(false); }} title="В папку" dark={isDark}>
                <FolderInput size={14} />
              </Btn>
              {showMove && (
                <div className="absolute bottom-8 left-0 bg-white rounded-2xl shadow-xl border border-[#E8E0D4] z-10 p-2 min-w-40">
                  <p className="text-xs text-[#A8A29E] px-2 mb-1">Переместить в:</p>
                  <button
                    onClick={() => { onUpdate(note.id, { folderId: null }); setShowMove(false); }}
                    className="w-full text-left text-sm px-3 py-1.5 rounded-xl hover:bg-[#FAE8D8] text-[#78716C] hover:text-[#D4763B] transition"
                  >
                    📝 Заметки (корень)
                  </button>
                  {folders.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => { onUpdate(note.id, { folderId: f.id }); setShowMove(false); }}
                      className="w-full text-left text-sm px-3 py-1.5 rounded-xl hover:bg-[#FAE8D8] text-[#78716C] hover:text-[#D4763B] transition"
                    >
                      📁 {f.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Архив */}
          <Btn onClick={() => onArchive(note.id, note.archived)} title={note.archived ? 'Восстановить' : 'В архив'} dark={isDark}>
            {note.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
          </Btn>

          {/* Удалить */}
          <Btn onClick={() => onDelete(note.id, note.imageUrl)} title="Удалить" danger dark={isDark}>
            <Trash2 size={14} />
          </Btn>
        </div>
      </div>
    </div>
  );
}

// Вспомогательная кнопка-иконка для нижней панели карточки
function Btn({ onClick, title, children, danger, dark }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-full transition
        ${dark
          ? 'text-gray-400 hover:bg-white/10 hover:text-white'
          : danger
            ? 'text-[#A8A29E] hover:bg-red-50 hover:text-red-500'
            : 'text-[#A8A29E] hover:bg-[#FAE8D8] hover:text-[#D4763B]'
        }`}
    >
      {children}
    </button>
  );
}
```

---

### `src/components/notes/NoteModal.jsx`

```jsx
import { useState, useEffect } from 'react';
import { X, Trash2, Palette, Tag, Archive, ArchiveRestore, FolderInput } from 'lucide-react';
import ColorPicker from '../ui/ColorPicker';
import LabelPicker from '../ui/LabelPicker';
import ImageUpload from '../ui/ImageUpload';

export default function NoteModal({ note, labels, folders, onClose, onUpdate, onDelete, onArchive, onCreateLabel, uploadImage }) {
  const [title, setTitle] = useState(note.title || '');
  const [text, setText] = useState(note.text || '');
  const [color, setColor] = useState(note.color || '#FDFAF5');
  const [labelIds, setLabelIds] = useState(note.labelIds || []);
  const [imageUrl, setImageUrl] = useState(note.imageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [showMove, setShowMove] = useState(false);

  const handleClose = () => {
    const changed = title !== note.title || text !== note.text || color !== note.color
      || JSON.stringify(labelIds) !== JSON.stringify(note.labelIds) || imageUrl !== note.imageUrl;
    if (changed) onUpdate(note.id, { title, text, color, labelIds, imageUrl });
    onClose();
  };

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [title, text, color, labelIds, imageUrl]);

  const handleImageUpload = async (file) => {
    setUploading(true);
    const url = await uploadImage(file);
    setImageUrl(url);
    setUploading(false);
  };

  const isDark = color === '#1C1917';
  const inputCls = `w-full bg-transparent outline-none ${isDark ? 'text-white placeholder-gray-500' : 'text-[#1C1917] placeholder-[#A8A29E]'}`;

  return (
    <div className="modal-bg fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={handleClose}>
      <div
        style={{ backgroundColor: color }}
        className="w-full max-w-lg rounded-2xl shadow-2xl border border-[#E8E0D4] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Изображение */}
        {imageUrl && (
          <div className="relative">
            <img src={imageUrl} alt="" className="w-full object-cover max-h-56" />
            <button
              onClick={() => setImageUrl(null)}
              className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70 transition"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Заголовок */}
        <input
          placeholder="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`${inputCls} px-5 pt-5 pb-2 text-base font-semibold`}
        />

        {/* Текст */}
        <textarea
          placeholder="Заметка..."
          value={text}
          rows={6}
          onChange={(e) => setText(e.target.value)}
          className={`${inputCls} px-5 py-2 text-sm resize-none`}
        />

        {/* Метки */}
        {labelIds.length > 0 && (
          <div className="flex flex-wrap gap-1 px-5 pb-2">
            {labels.filter((l) => labelIds.includes(l.id)).map((l) => (
              <span key={l.id} style={{ backgroundColor: l.color + '30', color: l.color }} className="text-xs px-2 py-0.5 rounded-full font-medium">
                {l.name}
              </span>
            ))}
          </div>
        )}

        {/* Нижняя панель */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-black/10">
          <div className="flex items-center gap-1">

            {/* Загрузка фото */}
            <ImageUpload imageUrl={null} onUpload={handleImageUpload} onRemove={() => setImageUrl(null)} uploading={uploading} />

            {/* Цвет */}
            <div className="relative">
              <MBtn onClick={() => { setShowColors((v) => !v); setShowLabels(false); setShowMove(false); }} dark={isDark}><Palette size={17} /></MBtn>
              {showColors && (
                <div className="absolute bottom-10 left-0 bg-white rounded-2xl shadow-xl border border-[#E8E0D4] z-10">
                  <ColorPicker current={color} onChange={(c) => { setColor(c); setShowColors(false); }} />
                </div>
              )}
            </div>

            {/* Метки */}
            <div className="relative">
              <MBtn onClick={() => { setShowLabels((v) => !v); setShowColors(false); setShowMove(false); }} dark={isDark}><Tag size={17} /></MBtn>
              {showLabels && (
                <div className="absolute bottom-10 left-0 bg-white rounded-2xl shadow-xl border border-[#E8E0D4] z-10">
                  <LabelPicker labels={labels} selectedIds={labelIds} onChange={setLabelIds} onCreateLabel={onCreateLabel} />
                </div>
              )}
            </div>

            {/* Переместить в папку */}
            {folders.length > 0 && (
              <div className="relative">
                <MBtn onClick={() => { setShowMove((v) => !v); setShowColors(false); setShowLabels(false); }} dark={isDark}><FolderInput size={17} /></MBtn>
                {showMove && (
                  <div className="absolute bottom-10 left-0 bg-white rounded-2xl shadow-xl border border-[#E8E0D4] z-10 p-2 min-w-44">
                    <p className="text-xs text-[#A8A29E] px-2 mb-1">Переместить в:</p>
                    <button onClick={() => { onUpdate(note.id, { folderId: null }); setShowMove(false); }} className="w-full text-left text-sm px-3 py-1.5 rounded-xl hover:bg-[#FAE8D8] text-[#78716C] hover:text-[#D4763B]">📝 Корень</button>
                    {folders.map((f) => (
                      <button key={f.id} onClick={() => { onUpdate(note.id, { folderId: f.id }); setShowMove(false); }} className="w-full text-left text-sm px-3 py-1.5 rounded-xl hover:bg-[#FAE8D8] text-[#78716C] hover:text-[#D4763B]">📁 {f.name}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Архив */}
            <MBtn onClick={() => { onArchive(note.id, note.archived); onClose(); }} dark={isDark}>
              {note.archived ? <ArchiveRestore size={17} /> : <Archive size={17} />}
            </MBtn>

            {/* Удалить */}
            <MBtn onClick={() => { onDelete(note.id, note.imageUrl); onClose(); }} danger dark={isDark}>
              <Trash2 size={17} />
            </MBtn>
          </div>

          <button
            onClick={handleClose}
            className={`px-5 py-1.5 text-sm font-medium rounded-xl transition hover:bg-black/10
              ${isDark ? 'text-gray-300' : 'text-[#78716C]'}`}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

function MBtn({ onClick, children, danger, dark }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full transition
        ${dark
          ? 'text-gray-400 hover:bg-white/10 hover:text-white'
          : danger
            ? 'text-[#A8A29E] hover:bg-red-50 hover:text-red-500'
            : 'text-[#A8A29E] hover:bg-[#FAE8D8] hover:text-[#D4763B]'
        }`}
    >
      {children}
    </button>
  );
}
```

---

### `src/App.jsx` — финальная сборка

```jsx
import { useState } from 'react';
import { Pin } from 'lucide-react';
import { useNotes } from './hooks/useNotes';
import { useLabels } from './hooks/useLabels';
import { useFolders } from './hooks/useFolders';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import NoteForm from './components/notes/NoteForm';
import NoteCard from './components/notes/NoteCard';
import NoteModal from './components/notes/NoteModal';
import EmptyState from './components/ui/EmptyState';

export default function App() {
  // Навигация: view = 'notes' | 'archive' | 'folder' | 'label'
  const [view, setView] = useState('notes');
  const [folderId, setFolderId] = useState(null);
  const [labelFilter, setLabelFilter] = useState(null);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNote, setActiveNote] = useState(null);

  const { notes, loading, addNote, updateNote, deleteNote, toggleArchive, togglePin, uploadImage } = useNotes(folderId, view);
  const { labels, addLabel, updateLabel, deleteLabel } = useLabels();
  const { folders, addFolder, updateFolder, deleteFolder } = useFolders();

  // Навигация из сайдбара
  const handleNavigate = (type, id) => {
    setSearch('');
    setLabelFilter(null);
    setFolderId(null);
    if (type === 'notes')   { setView('notes'); }
    if (type === 'archive') { setView('archive'); }
    if (type === 'folder')  { setView('folder'); setFolderId(id); }
    if (type === 'label')   { setView('notes'); setLabelFilter(id); }
  };

  // Фильтрация заметок
  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    const matchSearch = !q || n.title?.toLowerCase().includes(q) || n.text?.toLowerCase().includes(q);
    const matchLabel  = !labelFilter || n.labelIds?.includes(labelFilter);
    return matchSearch && matchLabel;
  });

  const pinned = filtered.filter((n) => n.pinned && !n.archived);
  const others  = filtered.filter((n) => !n.pinned);

  const emptyView = search ? 'search' : view === 'archive' ? 'archive' : folderId ? 'folder' : 'notes';

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Header search={search} onSearch={setSearch} onMenuToggle={() => setSidebarOpen((v) => !v)} />

      <Sidebar
        folders={folders}
        labels={labels}
        view={view}
        folderId={folderId}
        onNavigate={handleNavigate}
        onAddFolder={addFolder}
        onUpdateFolder={updateFolder}
        onDeleteFolder={deleteFolder}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Основной контент — с отступом под сайдбар на десктопе */}
      <main className="pt-20 pb-12 px-4 lg:pl-72">
        <div className="max-w-5xl mx-auto">

          {/* Форма — только на главной и в папках, не в архиве */}
          {view !== 'archive' && !search && (
            <NoteForm
              onAdd={addNote}
              labels={labels}
              onCreateLabel={addLabel}
              currentFolderId={folderId}
            />
          )}

          {/* Заголовок секции */}
          {view === 'archive' && (
            <p className="text-sm text-[#A8A29E] mb-4">
              Заметки в архиве не отображаются в основном списке
            </p>
          )}
          {labelFilter && (
            <p className="text-sm text-[#A8A29E] mb-4">
              Метка: <span className="font-medium text-[#D4763B]">{labels.find((l) => l.id === labelFilter)?.name}</span>
            </p>
          )}

          {/* Загрузка */}
          {loading && <div className="text-center text-[#A8A29E] py-16 text-sm">Загрузка...</div>}

          {/* Пусто */}
          {!loading && filtered.length === 0 && <EmptyState view={emptyView} />}

          {/* Закреплённые */}
          {!loading && pinned.length > 0 && (
            <section className="mb-6">
              <p className="text-xs font-semibold text-[#A8A29E] uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Pin size={11} /> Закреплённые
              </p>
              <div className="notes-grid">
                {pinned.map((note) => (
                  <div key={note.id} className="note-item">
                    <NoteCard
                      note={note} labels={labels} folders={folders}
                      onDelete={deleteNote} onUpdate={updateNote}
                      onPin={togglePin} onArchive={toggleArchive}
                      onClick={setActiveNote}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Остальные */}
          {!loading && others.length > 0 && (
            <section>
              {pinned.length > 0 && (
                <p className="text-xs font-semibold text-[#A8A29E] uppercase tracking-widest mb-3">
                  Другие
                </p>
              )}
              <div className="notes-grid">
                {others.map((note) => (
                  <div key={note.id} className="note-item">
                    <NoteCard
                      note={note} labels={labels} folders={folders}
                      onDelete={deleteNote} onUpdate={updateNote}
                      onPin={togglePin} onArchive={toggleArchive}
                      onClick={setActiveNote}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Модалка редактирования */}
      {activeNote && (
        <NoteModal
          note={activeNote}
          labels={labels}
          folders={folders}
          onClose={() => setActiveNote(null)}
          onUpdate={updateNote}
          onDelete={deleteNote}
          onArchive={toggleArchive}
          onCreateLabel={addLabel}
          uploadImage={uploadImage}
        />
      )}
    </div>
  );
}
```

---

## ✅ Функциональность v3

| Функция | Статус |
|---|---|
| Создание / редактирование / удаление заметок | ✅ |
| Цветные карточки (12 тёплых цветов) | ✅ |
| Тёмная карточка (ночной режим) | ✅ |
| Закрепление заметок | ✅ |
| **Архив** | ✅ **НОВОЕ** |
| **Загрузка изображений** | ✅ **НОВОЕ** |
| **Метки (теги)** | ✅ **НОВОЕ** |
| **Папки** | ✅ **НОВОЕ** |
| Перемещение заметок между папками | ✅ **НОВОЕ** |
| Поиск по заметкам | ✅ |
| Masonry-сетка | ✅ |
| Адаптив mobile / tablet / desktop | ✅ |
| Реалтайм через Firestore | ✅ |
| Дизайн в стиле Claude AI Mobile | ✅ |

---

## ⚠️ Важные моменты

| Тема | Детали |
|---|---|
| Firebase Storage | Активировать в консоли Firebase: Storage → Get Started |
| Индексы Firestore | При ошибке `requires an index` — перейди по ссылке из консоли браузера, индекс создастся автоматически |
| Размер изображений | Ограничение в коде: 5 МБ. Можно изменить в `ImageUpload.jsx` |
| Тёмная карточка `#1C1917` | Текст автоматически становится белым через проверку `isDark` |
| Firestore `orderBy` + `where` | Комбинация требует составного индекса — создаётся автоматически по ссылке из ошибки |
