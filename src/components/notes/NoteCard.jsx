import { useState } from 'react';
import { Trash2, Palette, Pin, PinOff, Archive, ArchiveRestore, FolderInput } from 'lucide-react';
import ColorPicker from '../ui/ColorPicker';

export default function NoteCard({
  note, labels, folders,
  onDelete, onUpdate, onPin, onArchive, onClick,
  isArchiveView = false,
  isTrashView = false,
  onRestore,
  onDeletePermanently,
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
      {note.imageUrl && (
        <img src={note.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full object-cover max-h-44" />
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

        <div
          className="flex items-center gap-0.5 mt-3 opacity-0 group-hover:opacity-100 transition -mb-1"
          onClick={(e) => e.stopPropagation()}
        >
          {isTrashView ? (
            /* ── РЕЖИМ КОРЗИНЫ ── */
            <>
              <button
                onClick={() => onRestore(note.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition
                  ${isDark
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-[#FAE8D8] text-[#D4763B] hover:bg-[#F5D9C4]'
                  }`}
              >
                <ArchiveRestore size={13} />
                Восстановить
              </button>
              <Btn
                onClick={() => onDeletePermanently(note.id, note.imageUrl)}
                title="Удалить навсегда"
                danger dark={isDark}
              >
                <Trash2 size={14} />
              </Btn>
            </>
          ) : isArchiveView ? (
            /* ── РЕЖИМ АРХИВА ── */
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
              <Btn onClick={() => onPin(note.id, note.pinned)} title={note.pinned ? 'Открепить' : 'Закрепить'} dark={isDark}>
                {note.pinned ? <PinOff size={14} /> : <Pin size={14} />}
              </Btn>

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

              <Btn onClick={() => onArchive(note.id, note.archived)} title="В архив" dark={isDark}>
                <Archive size={14} />
              </Btn>

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
