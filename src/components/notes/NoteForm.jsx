import { useState, useRef, useEffect } from 'react';
import { Palette, Tag, X } from 'lucide-react';
import ColorPicker from '../ui/ColorPicker';
import LabelPicker from '../ui/LabelPicker';
import ImageUpload from '../ui/ImageUpload';

export default function NoteForm({ onAdd, labels, onCreateLabel, onDeleteLabel, currentFolderId, uploadImage, uploadImageFromUrl }) {
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
    setTitle('');
    setText('');
    setColor('#FDFAF5');
    setLabelIds([]);
    setImageUrl(null);
    setExpanded(false);
    setShowColors(false);
    setShowLabels(false);
  };

  const handleImageUpload = async (file) => {
    setUploading(true);
    const url = await uploadImage(file);
    setImageUrl(url);
    setUploading(false);
  };

  const handleImageUrl = async (url) => {
    setUploading(true);
    try {
      const uploadedUrl = await uploadImageFromUrl(url);
      setImageUrl(uploadedUrl);
    } catch (err) {
      alert('Не удалось загрузить изображение. Попробуйте другую ссылку или сохраните изображение на устройство.');
    }
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

        <textarea
          placeholder="Создать заметку..."
          value={text}
          rows={expanded ? 4 : 1}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setExpanded(true)}
          className={`w-full px-4 py-3 text-sm bg-transparent outline-none resize-none ${textClass}`}
        />

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

        {expanded && (
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-1 relative">

              <ImageUpload
                imageUrl={imageUrl}
                onUpload={handleImageUpload}
                onUploadUrl={handleImageUrl}
                onRemove={() => setImageUrl(null)}
                uploading={uploading}
              />

              <div className="relative">
                <button
                  onClick={() => { setShowColors((v) => !v); setShowLabels(false); }}
                  className={`p-2 rounded-full transition hover:bg-black/10 ${isDark ? 'text-gray-400' : 'text-[#78716C]'}`}
                  title="Цвет"
                >
                  <Palette size={17} />
                </button>
                {showColors && (
                  <div
                    className="absolute bottom-10 left-0 bg-white rounded-2xl shadow-xl border border-[#E8E0D4] z-20"
                    style={{ width: '280px' }}
                  >
                    <ColorPicker current={color} onChange={(c) => { setColor(c); setShowColors(false); }} />
                  </div>
                )}
              </div>

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
                      onDeleteLabel={onDeleteLabel}
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
