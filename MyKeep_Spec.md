# 📝 My Keep — Спецификация клона Google Keep

> **Стек:** React 18 + Vite + Firebase Firestore + Tailwind CSS  
> **Цель:** Полнофункциональный клон Google Keep с созданием, редактированием, удалением и цветовыми метками заметок  
> **Версия:** 2.0

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
    ├── index.css
    ├── hooks/
    │   └── useNotes.js          ← вся логика работы с Firestore
    └── components/
        ├── Header.jsx            ← шапка с поиском
        ├── NoteForm.jsx          ← форма создания (раскрывается по клику)
        ├── NoteCard.jsx          ← карточка заметки
        ├── NoteModal.jsx         ← модалка редактирования
        └── ColorPicker.jsx       ← выбор цвета карточки
```

---

## ⚙️ Установка зависимостей

```bash
# 1. Создать проект
npm create vite@latest my-keep -- --template react
cd my-keep

# 2. Основные зависимости
npm install firebase lucide-react

# 3. Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 🔧 Конфигурационные файлы

### `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Google Sans', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

body {
  background-color: #fff;
  color: #202124;
}

/* Плавное появление карточек */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.note-appear {
  animation: fadeIn 0.2s ease;
}
```

---

## 🔥 Firebase

### `src/firebase.js`

```js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAV9TF1y9LXJVgpANsrSeNEzNAtqdx7mtk",
  authDomain: "my-keep-fde5b.firebaseapp.com",
  projectId: "my-keep-fde5b",
  storageBucket: "my-keep-fde5b.firebasestorage.app",
  messagingSenderId: "305136676195",
  appId: "1:305136676195:web:a7370bea2db066ff87b756",
  measurementId: "G-K1KQRW06X7",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### Правила Firestore (Firebase Console → Firestore → Rules)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow read, write: if true;
    }
  }
}
```

---

## 🪝 Хук: `src/hooks/useNotes.js`

Вся бизнес-логика вынесена в один хук — компоненты просто вызывают функции.

```jsx
import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Подписка на коллекцию — обновляется в реальном времени
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setNotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub; // отписка при размонтировании
  }, []);

  // Создание заметки
  const addNote = async ({ title, text, color }) => {
    if (!title.trim() && !text.trim()) return;
    await addDoc(collection(db, 'notes'), {
      title: title.trim(),
      text: text.trim(),
      color: color || '#ffffff',
      pinned: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  // Обновление заметки (заголовок, текст, цвет, закреп)
  const updateNote = async (id, changes) => {
    await updateDoc(doc(db, 'notes', id), {
      ...changes,
      updatedAt: serverTimestamp(),
    });
  };

  // Удаление заметки
  const deleteNote = async (id) => {
    await deleteDoc(doc(db, 'notes', id));
  };

  // Закрепление / открепление
  const togglePin = async (id, pinned) => {
    await updateDoc(doc(db, 'notes', id), { pinned: !pinned });
  };

  return { notes, loading, addNote, updateNote, deleteNote, togglePin };
}
```

---

## 🧩 Компоненты

### `src/components/Header.jsx`

Шапка с логотипом и строкой поиска.

```jsx
import { Search, X } from 'lucide-react';

export default function Header({ search, onSearch }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-200 h-16 flex items-center px-4 gap-4">
      {/* Логотип */}
      <div className="flex items-center gap-2 min-w-max">
        <span className="text-2xl">📝</span>
        <span className="text-xl font-medium text-gray-700 hidden sm:block">My Keep</span>
      </div>

      {/* Строка поиска */}
      <div className="flex-1 max-w-2xl mx-auto relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск заметок"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white focus:shadow-md
                     rounded-lg pl-10 pr-10 py-2.5 text-sm outline-none transition"
        />
        {/* Кнопка очистки поиска */}
        {search && (
          <button
            onClick={() => onSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
```

---

### `src/components/ColorPicker.jsx`

Палитра цветов карточки — как в Google Keep.

```jsx
// Доступные цвета (Google Keep palette)
export const COLORS = [
  { hex: '#ffffff', label: 'Белый' },
  { hex: '#faafa8', label: 'Томат' },
  { hex: '#f39f76', label: 'Фламинго' },
  { hex: '#fff8b8', label: 'Банан' },
  { hex: '#e2f6d3', label: 'Шалфей' },
  { hex: '#b4ddd3', label: 'Мята' },
  { hex: '#d4e4ed', label: 'Туман' },
  { hex: '#aeccdc', label: 'Шторм' },
  { hex: '#d3bfdb', label: 'Лаванда' },
  { hex: '#f6e2dd', label: 'Пудра' },
  { hex: '#e9e3d4', label: 'Песок' },
  { hex: '#efeff1', label: 'Туман' },
];

export default function ColorPicker({ current, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 p-2">
      {COLORS.map((c) => (
        <button
          key={c.hex}
          title={c.label}
          onClick={() => onChange(c.hex)}
          style={{ backgroundColor: c.hex }}
          className={`w-7 h-7 rounded-full border-2 transition hover:scale-110
            ${current === c.hex ? 'border-gray-700' : 'border-gray-300'}`}
        />
      ))}
    </div>
  );
}
```

---

### `src/components/NoteForm.jsx`

⚠️ **Это главный исправленный компонент** — форма раскрывается по клику, как в Google Keep. Каждое создание заметки сбрасывает форму, позволяя добавлять сколько угодно заметок.

```jsx
import { useState, useRef, useEffect } from 'react';
import { Palette, X } from 'lucide-react';
import ColorPicker from './ColorPicker';

export default function NoteForm({ onAdd }) {
  // expanded — раскрыта ли форма
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [showColors, setShowColors] = useState(false);
  const formRef = useRef(null);

  // Закрываем форму по клику вне неё
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (formRef.current && !formRef.current.contains(e.target)) {
        handleClose();
      }
    };
    if (expanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded, title, text]);

  // Сохранить и сбросить форму
  const handleClose = () => {
    if (title.trim() || text.trim()) {
      onAdd({ title, text, color });
    }
    // Сброс — это ключевое! Форма готова к новой заметке
    setTitle('');
    setText('');
    setColor('#ffffff');
    setExpanded(false);
    setShowColors(false);
  };

  return (
    <div className="max-w-xl mx-auto mb-8">
      <div
        ref={formRef}
        style={{ backgroundColor: color }}
        className="rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all"
      >
        {/* Заголовок — показываем только когда раскрыто */}
        {expanded && (
          <div className="flex items-center px-4 pt-3">
            <input
              type="text"
              placeholder="Заголовок"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 text-sm font-medium bg-transparent outline-none placeholder-gray-400"
              autoFocus
            />
          </div>
        )}

        {/* Основное поле — клик разворачивает форму */}
        <textarea
          placeholder="Создать заметку..."
          value={text}
          rows={expanded ? 4 : 1}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setExpanded(true)}
          className="w-full px-4 py-3 text-sm bg-transparent outline-none resize-none placeholder-gray-500"
        />

        {/* Нижняя панель с кнопками */}
        {expanded && (
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-1">
              {/* Кнопка выбора цвета */}
              <div className="relative">
                <button
                  onClick={() => setShowColors((v) => !v)}
                  className="p-2 rounded-full hover:bg-black/10 text-gray-500 hover:text-gray-700 transition"
                  title="Цвет фона"
                >
                  <Palette size={18} />
                </button>
                {/* Всплывающая палитра */}
                {showColors && (
                  <div className="absolute bottom-10 left-0 bg-white rounded-xl shadow-xl border border-gray-200 z-10 p-1">
                    <ColorPicker current={color} onChange={(c) => { setColor(c); setShowColors(false); }} />
                  </div>
                )}
              </div>
            </div>

            {/* Кнопка «Готово» */}
            <button
              onClick={handleClose}
              className="px-5 py-1.5 text-sm font-medium text-gray-700 rounded-lg
                         hover:bg-black/10 transition"
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

### `src/components/NoteCard.jsx`

Карточка с hover-эффектами и панелью действий.

```jsx
import { useState } from 'react';
import { Trash2, Palette, Pin, PinOff } from 'lucide-react';
import ColorPicker from './ColorPicker';

export default function NoteCard({ note, onDelete, onUpdate, onPin, onClick }) {
  const [showColors, setShowColors] = useState(false);

  const handleColorChange = (color) => {
    onUpdate(note.id, { color });
    setShowColors(false);
  };

  return (
    <div
      style={{ backgroundColor: note.color || '#ffffff' }}
      className="note-appear rounded-xl border border-gray-200 p-4 cursor-pointer
                 hover:shadow-lg transition-shadow relative group"
      onClick={() => onClick(note)}
    >
      {/* Заголовок */}
      {note.title && (
        <h3 className="font-medium text-sm text-gray-800 mb-1 pr-6 line-clamp-1">
          {note.title}
        </h3>
      )}

      {/* Текст */}
      {note.text && (
        <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-6">
          {note.text}
        </p>
      )}

      {/* Нижняя панель — видна при наведении */}
      <div
        className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition"
        onClick={(e) => e.stopPropagation()} // не открывать модалку
      >
        {/* Закрепить */}
        <button
          onClick={() => onPin(note.id, note.pinned)}
          className="p-1.5 rounded-full hover:bg-black/10 text-gray-500 hover:text-gray-700"
          title={note.pinned ? 'Открепить' : 'Закрепить'}
        >
          {note.pinned ? <PinOff size={15} /> : <Pin size={15} />}
        </button>

        {/* Цвет */}
        <div className="relative">
          <button
            onClick={() => setShowColors((v) => !v)}
            className="p-1.5 rounded-full hover:bg-black/10 text-gray-500 hover:text-gray-700"
            title="Цвет фона"
          >
            <Palette size={15} />
          </button>
          {showColors && (
            <div className="absolute bottom-8 left-0 bg-white rounded-xl shadow-xl border border-gray-200 z-10 p-1">
              <ColorPicker current={note.color} onChange={handleColorChange} />
            </div>
          )}
        </div>

        {/* Удалить */}
        <button
          onClick={() => onDelete(note.id)}
          className="p-1.5 rounded-full hover:bg-black/10 text-gray-500 hover:text-red-500 ml-auto"
          title="Удалить"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
```

---

### `src/components/NoteModal.jsx`

Модалка редактирования — открывается по клику на карточку.

```jsx
import { useState, useEffect, useRef } from 'react';
import { X, Trash2, Palette } from 'lucide-react';
import ColorPicker from './ColorPicker';

export default function NoteModal({ note, onClose, onUpdate, onDelete }) {
  const [title, setTitle] = useState(note.title || '');
  const [text, setText] = useState(note.text || '');
  const [color, setColor] = useState(note.color || '#ffffff');
  const [showColors, setShowColors] = useState(false);

  // Сохраняем при закрытии, только если что-то изменилось
  const handleClose = () => {
    if (title !== note.title || text !== note.text || color !== note.color) {
      onUpdate(note.id, { title, text, color });
    }
    onClose();
  };

  // Закрытие по Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [title, text, color]);

  return (
    /* Затемнённый фон */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleClose}
    >
      {/* Само модальное окно */}
      <div
        style={{ backgroundColor: color }}
        className="w-full max-w-lg rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <input
          type="text"
          placeholder="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-5 pt-5 pb-2 text-base font-medium bg-transparent outline-none placeholder-gray-400"
        />

        {/* Текст */}
        <textarea
          placeholder="Заметка..."
          value={text}
          rows={6}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-5 py-2 text-sm bg-transparent outline-none resize-none placeholder-gray-500"
        />

        {/* Нижняя панель */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-black/10">
          <div className="flex items-center gap-1">
            {/* Палитра цветов */}
            <div className="relative">
              <button
                onClick={() => setShowColors((v) => !v)}
                className="p-2 rounded-full hover:bg-black/10 text-gray-500"
                title="Цвет фона"
              >
                <Palette size={18} />
              </button>
              {showColors && (
                <div className="absolute bottom-10 left-0 bg-white rounded-xl shadow-xl border border-gray-200 z-10 p-1">
                  <ColorPicker current={color} onChange={(c) => { setColor(c); setShowColors(false); }} />
                </div>
              )}
            </div>

            {/* Удалить прямо из модалки */}
            <button
              onClick={() => { onDelete(note.id); onClose(); }}
              className="p-2 rounded-full hover:bg-black/10 text-gray-500 hover:text-red-500"
              title="Удалить"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Закрыть */}
          <button
            onClick={handleClose}
            className="px-5 py-1.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-black/10 transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### `src/App.jsx`

Корневой компонент — собирает всё вместе.

```jsx
import { useState } from 'react';
import { Pin } from 'lucide-react';
import { useNotes } from './hooks/useNotes';
import Header from './components/Header';
import NoteForm from './components/NoteForm';
import NoteCard from './components/NoteCard';
import NoteModal from './components/NoteModal';

export default function App() {
  const { notes, loading, addNote, updateNote, deleteNote, togglePin } = useNotes();
  const [search, setSearch] = useState('');
  const [activeNote, setActiveNote] = useState(null); // заметка открытая в модалке

  // Фильтрация по строке поиска
  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    return n.title?.toLowerCase().includes(q) || n.text?.toLowerCase().includes(q);
  });

  // Разделяем закреплённые и обычные
  const pinned = filtered.filter((n) => n.pinned);
  const others = filtered.filter((n) => !n.pinned);

  const cardProps = (note) => ({
    note,
    onDelete: deleteNote,
    onUpdate: updateNote,
    onPin: togglePin,
    onClick: setActiveNote,
  });

  return (
    <div className="min-h-screen bg-white">
      <Header search={search} onSearch={setSearch} />

      <main className="pt-20 px-4 pb-12 max-w-5xl mx-auto">
        {/* Форма создания */}
        {!search && <NoteForm onAdd={addNote} />}

        {loading && (
          <p className="text-center text-gray-400 mt-16 text-sm">Загрузка...</p>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-400 mt-16 text-sm">
            {search ? 'Ничего не найдено' : 'Заметок пока нет — создайте первую!'}
          </p>
        )}

        {/* Закреплённые заметки */}
        {pinned.length > 0 && (
          <section className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
              <Pin size={12} /> Закреплённые
            </p>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {pinned.map((note) => (
                <div key={note.id} className="break-inside-avoid mb-4">
                  <NoteCard {...cardProps(note)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Остальные заметки */}
        {others.length > 0 && (
          <section>
            {pinned.length > 0 && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Другие
              </p>
            )}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {others.map((note) => (
                <div key={note.id} className="break-inside-avoid mb-4">
                  <NoteCard {...cardProps(note)} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Модалка редактирования */}
      {activeNote && (
        <NoteModal
          note={activeNote}
          onClose={() => setActiveNote(null)}
          onUpdate={updateNote}
          onDelete={deleteNote}
        />
      )}
    </div>
  );
}
```

---

## 🚀 Запуск

```bash
npm run dev
# → http://localhost:5173
```

---

## ✅ Функциональность

| Функция | Статус |
|---|---|
| Создание заметок (неограниченно) | ✅ |
| Форма раскрывается по клику | ✅ |
| Редактирование в модалке | ✅ |
| Удаление | ✅ |
| Цветные карточки (12 цветов) | ✅ |
| Закрепление заметок | ✅ |
| Поиск по заметкам | ✅ |
| Masonry-сетка (как Keep) | ✅ |
| Реалтайм через Firestore | ✅ |
| Адаптив (mobile/tablet/desktop) | ✅ |

---

## ⚠️ Частые ошибки

| Ошибка | Решение |
|---|---|
| Нельзя создать вторую заметку | Форма не сбрасывалась — в новом коде `handleClose()` очищает state |
| `Missing permissions` | Firestore Rules → `allow read, write: if true` |
| Tailwind не работает | Проверь `content` в `tailwind.config.js` |
| Заметки не грузятся | Проверь `projectId` в `firebase.js` |
| `serverTimestamp` = null при отображении | Это нормально сразу после записи — Firestore подтягивает за ~1 сек |
