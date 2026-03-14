# 🔧 Фикс App.jsx — заметки везде сразу

> Одна причина, два изменения в файле `src/App.jsx`

---

## В чём проблема

`useNotes()` вызывается без аргументов — хук не знает какой экран открыт и всегда грузит всё подряд.

---

## Изменение 1 — переставить строки выше

Найди в `App.jsx` вот эти три строки:

```js
const [view, setView] = useState('notes');
const [folderId, setFolderId] = useState(null);
const [labelId, setLabelId] = useState(null);
```

Вырежи их (`Ctrl+X`) и вставь **перед** строкой с `useNotes` — чтобы стало вот так:

```js
const [view, setView] = useState('notes');
const [folderId, setFolderId] = useState(null);
const [labelId, setLabelId] = useState(null);

const { notes, loading, error, addNote, updateNote, deleteNote, toggleArchive, togglePin, uploadImage, uploadImageFromUrl } = useNotes(folderId, view);
```

---

## Изменение 2 — добавить аргументы в useNotes

Найди:
```js
} = useNotes();
```

Замени на:
```js
} = useNotes(folderId, view);
```

---

## Готово

Сохрани файл → `Ctrl+R` в браузере.
