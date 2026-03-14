# 📝 My Keep v4 — Спецификация исправлений

> **Что меняем в v4:**
> 1. Кнопка «Вернуть из архива» — видна прямо на карточке в архиве
> 2. ColorPicker — горизонтальная строка вместо сетки
> 3. Удаление папок работает корректно (заметки переносятся в корень)
> 4. Загрузка изображений — локально + по URL из браузера

---

## 1. ColorPicker — горизонтальный `src/components/ui/ColorPicker.jsx`

Фиксированная ширина `280px` на компоненте + `flexShrink: 0` и `minWidth` на каждом кружке — без этого Tailwind `flex` позволяет контейнеру сжаться и кружки переносятся в несколько рядов.

```jsx
import { NOTE_COLORS } from '../../theme';
import { Check } from 'lucide-react';

export default function ColorPicker({ current, onChange }) {
  return (
    <div
      style={{ width: '280px' }}           // фиксированная ширина — ключевое
      className="flex flex-row items-center gap-2 px-3 py-3 overflow-x-auto"
    >
      {NOTE_COLORS.map((c) => (
        <button
          key={c.hex}
          title={c.label}
          onClick={() => onChange(c.hex)}
          style={{
            backgroundColor: c.hex,
            minWidth: '28px',              // не сжимается
            minHeight: '28px',
            flexShrink: 0,                 // запрещаем сжатие
          }}
          className={`relative rounded-full border-2 transition-transform hover:scale-110
            ${current === c.hex
              ? 'border-[#D4763B] scale-110'
              : c.hex === '#1C1917' ? 'border-[#78716C]' : 'border-[#E8E0D4]'
            }`}
        >
          {current === c.hex && (
            <Check
              size={12}
              className={`absolute inset-0 m-auto
                ${c.hex === '#1C1917' ? 'text-white' : 'text-[#D4763B]'}`}
            />
          )}
        </button>
      ))}
    </div>
  );
}
```

> **Важно:** также добавь `style={{ width: '280px' }}` на обёртку попапа во всех трёх местах где открывается ColorPicker — иначе попап сожмёт компонент изнутри.

---

## 2. Карточка с кнопкой восстановления `src/components/notes/NoteCard.jsx`

Ключевое изменение: в режиме архива показываем `ArchiveRestore` вместо `Archive`, и убираем лишние кнопки (закреп не нужен в архиве).

```jsx
import { useState } from 'react';
import { Trash2, Palette, Pin, PinOff, Archive, ArchiveRestore, FolderInput } from 'lucide-react';
import ColorPicker from '../ui/ColorPicker';

export default function NoteCard({
  note, labels, folders,
  onDelete, onUpdate, onPin, onArchive, onClick,
  isArchiveView = false,   // ← НОВЫЙ проп — передаём true когда view === 'archive'
}) {
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
        {note.title && (
          <h3 className={`font-semibold text-sm mb-1 pr-6 line-clamp-2 ${isDark ? 'text-white' : 'text-[#1C1917]'}`}>
            {note.title}
          </h3>
        )}
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
                style={{ backgroundColor: l.color + '25', color: l.color }}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
              >
                {l.name}
              </span>
            ))}
          </div>
        )}

        {/* Панель действий */}
        <div
          className="flex items-center gap-0.5 mt-3 opacity-0 group-hover:opacity-100 transition -mb-1"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── РЕЖИМ АРХИВА: большая кнопка «Вернуть» + удалить ── */}
          {isArchiveView ? (
            <>
              <button
                onClick={() => onArchive(note.id, note.archived)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition
                  ${isDark
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-[#FAE8D8] text-[#D4763B] hover:bg-[#F5D9C4]'
                  }`}
              >
                <ArchiveRestore size={13} />
                Вернуть
              </button>
              <Btn
                onClick={() => onDelete(note.id, note.imageUrl)}
                title="Удалить навсегда"
                danger dark={isDark}
              >
                <Trash2 size={14} />
              </Btn>
            </>
          ) : (
            /* ── ОБЫЧНЫЙ РЕЖИМ ── */
            <>
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
                  <div
                    className="absolute bottom-9 left-0 bg-white rounded-2xl shadow-xl border border-[#E8E0D4] z-10"
                    style={{ width: '280px' }}
                  >
                    <ColorPicker
                      current={note.color}
                      onChange={(c) => { onUpdate(note.id, { color: c }); setShowColors(false); }}
                    />
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
                    <div className="absolute bottom-9 left-0 bg-white rounded-2xl shadow-xl border border-[#E8E0D4] z-10 p-2 min-w-44">
                      <p className="text-xs text-[#A8A29E] px-2 mb-1">Переместить в:</p>
                      <button
                        onClick={() => { onUpdate(note.id, { folderId: null }); setShowMove(false); }}
                        className="w-full text-left text-sm px-3 py-1.5 rounded-xl hover:bg-[#FAE8D8] text-[#78716C] hover:text-[#D4763B] transition"
                      >
                        📝 Корень
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

              {/* В архив */}
              <Btn onClick={() => onArchive(note.id, note.archived)} title="В архив" dark={isDark}>
                <Archive size={14} />
              </Btn>

              {/* Удалить */}
              <Btn onClick={() => onDelete(note.id, note.imageUrl)} title="Удалить" danger dark={isDark}>
                <Trash2 size={14} />
              </Btn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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

## 3. Удаление папок `src/hooks/useFolders.js`

При удалении папки — все заметки внутри переносятся в корень (`folderId: null`).

```js
import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy, where, getDocs, writeBatch,
} from 'firebase/firestore';
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
      name: name.trim(), icon, createdAt: serverTimestamp(),
    });
  };

  const updateFolder = async (id, changes) => {
    await updateDoc(doc(db, 'folders', id), changes);
  };

  // Удаление папки: сначала переносим заметки в корень, потом удаляем папку
  const deleteFolder = async (id) => {
    // Находим все заметки в этой папке
    const notesSnap = await getDocs(
      query(collection(db, 'notes'), where('folderId', '==', id))
    );

    if (!notesSnap.empty) {
      // Batch write — переносим все заметки в корень одной операцией
      const batch = writeBatch(db);
      notesSnap.docs.forEach((noteDoc) => {
        batch.update(doc(db, 'notes', noteDoc.id), { folderId: null });
      });
      await batch.commit();
    }

    // Теперь удаляем саму папку
    await deleteDoc(doc(db, 'folders', id));
  };

  return { folders, addFolder, updateFolder, deleteFolder };
}
```

---

## 4. Загрузка изображений `src/components/ui/ImageUpload.jsx`

Два режима: локальный файл + URL из интернета. Переключение табами.

```jsx
import { useRef, useState } from 'react';
import { Image, Link, X, Loader, Upload } from 'lucide-react';

export default function ImageUpload({ imageUrl, onUpload, onUploadUrl, onRemove, uploading }) {
  const inputRef = useRef(null);
  const [tab, setTab] = useState('file');       // 'file' | 'url'
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [showPanel, setShowPanel] = useState(false);

  // Загрузка локального файла
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setUrlError('Только изображения!');
    if (file.size > 5 * 1024 * 1024) return setUrlError('Максимум 5 МБ');
    setShowPanel(false);
    onUpload(file);
  };

  // Drag & drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
      setShowPanel(false);
      onUpload(file);
    }
  };

  // Загрузка по URL
  const handleUrlSubmit = async () => {
    setUrlError('');
    const url = urlInput.trim();
    if (!url) return;

    // Простая проверка что это URL картинки
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url) || url.startsWith('https://');
    if (!isImage && !url.startsWith('http')) {
      setUrlError('Введите корректный URL');
      return;
    }

    // Проверяем что картинка грузится
    const img = new window.Image();
    img.onload  = () => { onUploadUrl(url); setUrlInput(''); setShowPanel(false); };
    img.onerror = () => setUrlError('Не удалось загрузить изображение по этому URL');
    img.src = url;
  };

  return (
    <div className="relative">
      {/* Превью загруженного изображения */}
      {imageUrl ? (
        <div className="relative inline-block">
          <img src={imageUrl} alt="вложение" className="h-8 w-12 object-cover rounded-lg border border-[#E8E0D4]" />
          <button
            onClick={onRemove}
            className="absolute -top-1.5 -right-1.5 p-0.5 bg-white rounded-full border border-[#E8E0D4]
                       text-[#A8A29E] hover:text-red-500 transition shadow-sm"
          >
            <X size={11} />
          </button>
        </div>
      ) : (
        /* Кнопка открытия панели */
        <button
          onClick={() => setShowPanel((v) => !v)}
          disabled={uploading}
          className="flex items-center gap-1.5 text-xs text-[#78716C] hover:text-[#D4763B]
                     px-2 py-1.5 rounded-lg hover:bg-[#FAE8D8] transition"
          title="Добавить изображение"
        >
          {uploading
            ? <><Loader size={14} className="animate-spin" /> Загружаю...</>
            : <><Image size={14} /> Фото</>
          }
        </button>
      )}

      {/* Панель выбора способа */}
      {showPanel && !imageUrl && (
        <div className="absolute bottom-10 left-0 bg-white rounded-2xl shadow-xl border border-[#E8E0D4] z-20 w-72">

          {/* Табы */}
          <div className="flex border-b border-[#E8E0D4]">
            <button
              onClick={() => setTab('file')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-tl-2xl transition
                ${tab === 'file' ? 'bg-[#FAE8D8] text-[#D4763B]' : 'text-[#78716C] hover:bg-[#F5F0E8]'}`}
            >
              <Upload size={13} /> С устройства
            </button>
            <button
              onClick={() => { setTab('url'); setUrlError(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-tr-2xl transition
                ${tab === 'url' ? 'bg-[#FAE8D8] text-[#D4763B]' : 'text-[#78716C] hover:bg-[#F5F0E8]'}`}
            >
              <Link size={13} /> По ссылке
            </button>
          </div>

          <div className="p-3">
            {tab === 'file' ? (
              /* Зона drag & drop + кнопка выбора файла */
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 py-5 px-3
                           border-2 border-dashed border-[#E8E0D4] rounded-xl cursor-pointer
                           hover:border-[#D4763B] hover:bg-[#FAE8D8] transition"
              >
                <Upload size={22} className="text-[#A8A29E]" />
                <p className="text-xs text-[#78716C] text-center">
                  Перетащите сюда или <span className="text-[#D4763B] font-medium">выберите файл</span>
                </p>
                <p className="text-xs text-[#A8A29E]">JPG, PNG, GIF, WebP — до 5 МБ</p>
              </div>
            ) : (
              /* Поле ввода URL */
              <div className="space-y-2">
                <p className="text-xs text-[#78716C]">Вставьте прямую ссылку на изображение:</p>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setUrlError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  placeholder="https://example.com/image.jpg"
                  autoFocus
                  className="w-full text-xs bg-[#F5F0E8] rounded-xl px-3 py-2 outline-none
                             focus:ring-1 focus:ring-[#D4763B] placeholder-[#A8A29E] text-[#1C1917]"
                />
                {urlError && (
                  <p className="text-xs text-red-500">{urlError}</p>
                )}
                <button
                  onClick={handleUrlSubmit}
                  className="w-full py-2 rounded-xl bg-[#D4763B] text-white text-xs font-medium
                             hover:bg-[#C2662B] transition"
                >
                  Добавить
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Скрытый input для файла */}
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

---

## 5. Обновление хука `src/hooks/useNotes.js`

Добавляем `uploadImageFromUrl` — для URL не нужно загружать в Storage, просто сохраняем ссылку напрямую.

```js
// Загрузка файла в Firebase Storage → возвращает URL
const uploadImage = async (file) => {
  const path = `notes/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

// Загрузка по внешнему URL — ничего не грузим, просто возвращаем ссылку
const uploadImageFromUrl = (url) => url;

return {
  notes, loading,
  addNote, updateNote, deleteNote,
  toggleArchive, togglePin,
  uploadImage,
  uploadImageFromUrl,   // ← добавляем
};
```

---

## 6. Обновление `NoteForm.jsx` — подключаем оба метода

```jsx
// Добавь в деструктуризацию useNotes:
const { uploadImage, uploadImageFromUrl } = useNotes();

// Замени handleImageUpload на:
const handleImageUpload = async (file) => {
  setUploading(true);
  const url = await uploadImage(file);
  setImageUrl(url);
  setUploading(false);
};

const handleImageUrl = (url) => {
  setImageUrl(uploadImageFromUrl(url));
};

// В JSX передай оба метода в ImageUpload:
<ImageUpload
  imageUrl={imageUrl}
  onUpload={handleImageUpload}
  onUploadUrl={handleImageUrl}    // ← новый проп
  onRemove={() => setImageUrl(null)}
  uploading={uploading}
/>
```

Также найди попап ColorPicker в JSX и добавь `style={{ width: '280px' }}`:

```jsx
{showColors && (
  <div
    className="absolute bottom-10 left-0 bg-white rounded-2xl shadow-xl border border-[#E8E0D4] z-20"
    style={{ width: '280px' }}     // ← фиксируем ширину
  >
    <ColorPicker current={color} onChange={(c) => { setColor(c); setShowColors(false); }} />
  </div>
)}
```

---

## 7. Обновление `NoteModal.jsx` — аналогично

```jsx
// Добавь handleImageUrl:
const handleImageUrl = (url) => setImageUrl(url);

// В JSX:
<ImageUpload
  imageUrl={imageUrl}
  onUpload={handleImageUpload}
  onUploadUrl={handleImageUrl}    // ← новый проп
  onRemove={() => setImageUrl(null)}
  uploading={uploading}
/>
```

Также найди попап ColorPicker в JSX и добавь `style={{ width: '280px' }}`:

```jsx
{showColors && (
  <div
    className="absolute bottom-10 left-0 bg-white rounded-2xl shadow-xl border border-[#E8E0D4] z-10"
    style={{ width: '280px' }}     // ← фиксируем ширину
  >
    <ColorPicker current={color} onChange={(c) => { setColor(c); setShowColors(false); }} />
  </div>
)}
```

---

## 8. Передаём `isArchiveView` в `App.jsx`

```jsx
// В секции рендера карточек — добавляем проп isArchiveView:
<NoteCard
  note={note}
  labels={labels}
  folders={folders}
  onDelete={deleteNote}
  onUpdate={updateNote}
  onPin={togglePin}
  onArchive={toggleArchive}
  onClick={setActiveNote}
  isArchiveView={view === 'archive'}   // ← вот это
/>
```

---

## 9. То же в `NoteModal.jsx` — кнопка восстановления

В модалке тоже показываем правильную кнопку архив/восстановить:

```jsx
// Замени кнопку архива в нижней панели модалки:
<MBtn
  onClick={() => { onArchive(note.id, note.archived); onClose(); }}
  title={note.archived ? 'Восстановить из архива' : 'В архив'}
  dark={isDark}
>
  {note.archived ? <ArchiveRestore size={17} /> : <Archive size={17} />}
</MBtn>
```

---

## ✅ Итог изменений v4

| Баг / Фича | Решение |
|---|---|
| Нет кнопки «Вернуть из архива» | `isArchiveView` проп → показываем `ArchiveRestore` + подпись «Вернуть» |
| ColorPicker вертикальный | `width: 280px` на попапе + `flexShrink: 0` и `minWidth: 28px` на кружках — без фиксированной ширины родителя Tailwind `flex` сжимает контейнер |
| Удаление папки ломало заметки | `writeBatch` переносит заметки в корень перед удалением |
| Только локальная загрузка фото | Два таба: «С устройства» + «По ссылке» с валидацией |
| URL-изображения не в Storage | Внешние URL сохраняются напрямую без загрузки |
