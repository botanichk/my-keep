import { useRef, useState } from 'react';
import { Image, Link, X, Loader, Upload } from 'lucide-react';

export default function ImageUpload({ imageUrl, onUpload, onUploadUrl, onRemove, uploading }) {
  const inputRef = useRef(null);
  const [tab, setTab] = useState('file');
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [showPanel, setShowPanel] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setUrlError('Только изображения!');
    if (file.size > 5 * 1024 * 1024) return setUrlError('Максимум 5 МБ');
    setShowPanel(false);
    onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
      setShowPanel(false);
      onUpload(file);
    }
  };

  const handleUrlSubmit = () => {
    setUrlError('');
    const url = urlInput.trim();
    if (!url) return;
    if (!url.startsWith('http')) {
      setUrlError('Введите корректный URL');
      return;
    }
    // Сохраняем URL напрямую без проверки
    onUploadUrl(url);
    setUrlInput('');
    setShowPanel(false);
  };

  return (
    <div className="relative">
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

      {showPanel && !imageUrl && (
        <div className="absolute bottom-10 left-0 bg-white rounded-2xl shadow-xl border border-[#E8E0D4] z-20 w-72">

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
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
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
