# 🔧 Фикс NoteForm — пропало «Добавить изображение»

> Два файла: `NoteForm.jsx` и `App.jsx`

---

## Файл 1 — `src/components/notes/NoteForm.jsx`

### Удалить строку 1 (импорт):
```js
import { useNotes } from '../../hooks/useNotes';
```

### Удалить строку 2:
```js
const { uploadImage, uploadImageFromUrl } = useNotes();
```

### Найти:
```js
export default function NoteForm({ onAdd, labels, onCreateLabel, onDeleteLabel, currentFolderId }) {
```

### Заменить на:
```js
export default function NoteForm({ onAdd, labels, onCreateLabel, onDeleteLabel, currentFolderId, uploadImage, uploadImageFromUrl }) {
```

---

## Файл 2 — `src/App.jsx`

### Найти:
```jsx
<NoteForm
  onAdd={addNote}
  labels={labels}
  onCreateLabel={addLabel}
  currentFolderId={folderId}
  onDeleteLabel={deleteLabel}
/>
```

### Заменить на:
```jsx
<NoteForm
  onAdd={addNote}
  labels={labels}
  onCreateLabel={addLabel}
  currentFolderId={folderId}
  onDeleteLabel={deleteLabel}
  uploadImage={uploadImage}
  uploadImageFromUrl={uploadImageFromUrl}
/>
```

---

Сохранить оба файла → `Ctrl+R` в браузере.
