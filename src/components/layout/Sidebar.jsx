import { useState } from 'react';
import { Archive, Tag, FolderPlus, Folder, FolderInput, ChevronRight, Trash2, Edit2, Check, X, Home } from 'lucide-react';

export default function Sidebar({
  folders, labels, view, folderId, labelId,
  onNavigate,
  onAddFolder, onUpdateFolder, onDeleteFolder, onExportFolder,
  onDeleteLabel,
  isOpen, onClose
}) {
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
      onClick={() => { onNavigate(id, null); onClose?.(); }}
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
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-14 left-0 bottom-0 z-20 w-64 bg-[#EDE8DF] border-r border-[#E8E0D4]
        flex flex-col py-4 px-3 overflow-y-auto transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>

        <div className="space-y-1 mb-6">
          {navItem('notes', <Home size={17} />, 'Заметки', view === 'notes' && !folderId && !labelId)}
          {navItem('archive', <Archive size={17} />, 'Архив', view === 'archive')}
          {navItem('trash', <Trash2 size={17} />, 'Корзина', view === 'trash')}
        </div>

        {labels.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider px-3 mb-2">
              Метки
            </p>
            <div className="space-y-1">
              {labels.map((label) => (
                <div key={label.id} className="group flex items-center gap-1">
                  <button
                    onClick={() => { onNavigate('label', label.id); onClose?.(); }}
                    className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-xl text-sm transition
                      ${labelId === label.id
                        ? 'bg-[#FAE8D8] text-[#D4763B]'
                        : 'text-[#78716C] hover:bg-[#E8E0D4] hover:text-[#1C1917]'
                      }`}
                  >
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />
                    <span className="flex-1 text-left truncate">{label.name}</span>
                  </button>
                  <button
                    onClick={() => onDeleteLabel(label.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full
                               text-[#A8A29E] hover:text-red-500 hover:bg-red-50 transition"
                    title="Удалить метку"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
                      <button
                        onClick={() => { onExportFolder(folder.id); onNavigate('notes'); onClose?.(); }}
                        className="p-1 text-[#A8A29E] hover:text-[#D4763B] rounded-lg hover:bg-[#FAE8D8]"
                        title="Выгрузить заметки в корень"
                      >
                        <FolderInput size={12} />
                      </button>
                      <button onClick={() => handleEdit(folder)} className="p-1 text-[#A8A29E] hover:text-[#D4763B] rounded-lg hover:bg-[#FAE8D8]">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => onDeleteFolder(folder.id)} className="p-1 text-[#A8A29E] hover:text-red-500 rounded-lg hover:bg-red-50">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

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
