import { useState, useEffect } from 'react';
import { X, Trash2, Palette, Tag, Archive, ArchiveRestore, FolderInput } from 'lucide-react';
import ColorPicker from '../ui/ColorPicker';
import LabelPicker from '../ui/LabelPicker';
import ImageUpload from '../ui/ImageUpload';

export default function NoteModal({ 
  note, labels, folders, 
  onClose, onUpdate, onDelete, onArchive, 
  onCreateLabel, onDeleteLabel,
  uploadImage 
}) {
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

  const handleImageUrl = (url) => setImageUrl(url);

  const isDark = color === '#1C1917';
  const inputCls = `w-full bg-transparent outline-none ${isDark ? 'text-white placeholder-gray-500' : 'text-[#1C1917] placeholder-[#A8A29E]'}`;

  return (
    <div className="modal-bg fixed inset-0 z-50 flex items-end items-center justify-center bg-black/40 p-0" onClick={handleClose}>
      <div
        style={{ backgroundColor: color }}
        className="w-full max-w-2xl rounded-none md:rounded-2xl shadow-2xl border border-[#E8E0D4] overflow-hidden h-[100dvh] md:h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
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

        <input
          placeholder="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`${inputCls} px-5 pt-5 pb-2 text-base font-semibold`}
        />

        <textarea
          placeholder="Заметка..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={`${inputCls} px-5 py-2 text-sm resize-none flex-1 overflow-y-auto`}
        />

        {labelIds.length > 0 && (
          <div className="flex flex-wrap gap-1 px-5 pb-2">
            {labels.filter((l) => labelIds.includes(l.id)).map((l) => (
              <span key={l.id} style={{ backgroundColor: l.color + '30', color: l.color }} className="text-xs px-2 py-0.5 rounded-full font-medium">
                {l.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 border-t border-black/10">
          <div className="flex items-center gap-1">

            <ImageUpload
              imageUrl={imageUrl}
              onUpload={handleImageUpload}
              onUploadUrl={handleImageUrl}
              onRemove={() => setImageUrl(null)}
              uploading={uploading}
            />

            <div className="relative">
              <MBtn onClick={() => { setShowColors((v) => !v); setShowLabels(false); setShowMove(false); }} dark={isDark}><Palette size={17} /></MBtn>
              {showColors && (
                <div
                  className="absolute bottom-10 left-0 bg-white rounded-2xl shadow-xl border border-[#E8E0D4] z-10"
                  style={{ width: '280px' }}
                >
                  <ColorPicker current={color} onChange={(c) => { setColor(c); setShowColors(false); }} />
                </div>
              )}
            </div>

            <div className="relative">
              <MBtn onClick={() => { setShowLabels((v) => !v); setShowColors(false); setShowMove(false); }} dark={isDark}><Tag size={17} /></MBtn>
              {showLabels && (
                <div className="absolute bottom-10 left-0 bg-white rounded-2xl shadow-xl border border-[#E8E0D4] z-10">
                  <LabelPicker 
                    labels={labels} 
                    selectedIds={labelIds} 
                    onChange={setLabelIds} 
                    onCreateLabel={onCreateLabel}
                    onDeleteLabel={onDeleteLabel}
                  />
                </div>
              )}
            </div>

            {folders.length > 0 && (
              <div className="relative">
                <MBtn onClick={() => { setShowMove((v) => !v); setShowColors(false); setShowLabels(false); }} dark={isDark}><FolderInput size={17} /></MBtn>
                {showMove && (
                  <div className="absolute bottom-10 left-0 bg-white rounded-2xl shadow-xl border border-[#E8E0D4] z-10 p-2 min-w-40">
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

            <MBtn
              onClick={() => { onArchive(note.id, note.archived); onClose(); }}
              title={note.archived ? 'Восстановить из архива' : 'В архив'}
              dark={isDark}
            >
              {note.archived ? <ArchiveRestore size={17} /> : <Archive size={17} />}
            </MBtn>

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

function MBtn({ onClick, title, children, danger, dark }) {
  return (
    <button
      onClick={onClick}
      title={title}
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
