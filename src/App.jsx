import { useState } from 'react';
import { useNotes } from './hooks/useNotes';
import { useLabels } from './hooks/useLabels';
import { useFolders } from './hooks/useFolders';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import NoteForm from './components/notes/NoteForm';
import NoteCard from './components/notes/NoteCard';
import NoteModal from './components/notes/NoteModal';
import EmptyState from './components/ui/EmptyState';
import Toast from './components/ui/Toast';

export default function App() {
  const [view, setView] = useState('notes');
  const [folderId, setFolderId] = useState(null);
  const [labelId, setLabelId] = useState(null);

  const { notes, loading, error, addNote, updateNote, deleteNote, toggleArchive, togglePin, uploadImage, uploadImageFromUrl } = useNotes(folderId, view);
  const { labels, addLabel, updateLabel, deleteLabel } = useLabels();
  const { folders, addFolder, updateFolder, deleteFolder } = useFolders();

  const [search, setSearch] = useState('');
  const [activeNote, setActiveNote] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => setToast(msg);

  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    const matchesSearch = n.title?.toLowerCase().includes(q) || n.text?.toLowerCase().includes(q);
    const matchesLabel = !labelId || n.labelIds?.includes(labelId);
    return matchesSearch && matchesLabel;
  });

  // Сортировка закреплённых на клиенте
  const pinned = filtered.filter((n) => n.pinned);
  const others = filtered.filter((n) => !n.pinned);

  const handleNavigate = (newView, id) => {
    setView(newView);
    if (newView === 'folder') {
      setFolderId(id);
      setLabelId(null);
    } else if (newView === 'label') {
      setLabelId(id);
      setFolderId(null);
    } else {
      setFolderId(null);
      setLabelId(null);
    }
  };

  const handleArchive = (id, archived) => {
    toggleArchive(id, archived, archived ? () => showToast('Заметка восстановлена') : null);
  };

  const cardProps = (note) => ({
    note,
    labels,
    folders,
    onDelete: deleteNote,
    onUpdate: updateNote,
    onPin: togglePin,
    onArchive: handleArchive,
    onClick: setActiveNote,
    isArchiveView: view === 'archive',
  });

  const getEmptyState = () => {
    if (search) return 'search';
    if (view === 'archive') return 'archive';
    if (view === 'folder') return 'folder';
    if (view === 'label') return 'label';
    return 'notes';
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Header search={search} onSearch={setSearch} onMenuToggle={() => setSidebarOpen(true)} />
      
      <Sidebar
        folders={folders}
        labels={labels}
        view={view}
        folderId={folderId}
        labelId={labelId}
        onNavigate={handleNavigate}
        onAddFolder={addFolder}
        onUpdateFolder={updateFolder}
        onDeleteFolder={deleteFolder}
        onDeleteLabel={deleteLabel}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="pt-20 px-4 pb-12 lg:pl-72 max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {!search && view === 'notes' && !folderId && !labelId && (
          <NoteForm
            onAdd={addNote}
            labels={labels}
            onCreateLabel={addLabel}
            currentFolderId={folderId}
            onDeleteLabel={deleteLabel}
            uploadImage={uploadImage}
            uploadImageFromUrl={uploadImageFromUrl}
          />
        )}

        {loading && (
          <p className="text-center text-[#A8A29E] mt-16 text-sm">Загрузка...</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState view={getEmptyState()} />
        )}

        {pinned.length > 0 && (
          <section className="mb-6">
            <p className="text-xs font-semibold text-[#A8A29E] uppercase tracking-widest mb-3 flex items-center gap-1">
              📌 Закреплённые
            </p>
            <div className="notes-grid">
              {pinned.map((note) => (
                <div key={note.id} className="note-item">
                  <NoteCard {...cardProps(note)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {others.length > 0 && (
          <section>
            {pinned.length > 0 && (
              <p className="text-xs font-semibold text-[#A8A29E] uppercase tracking-widest mb-3">
                Другие
              </p>
            )}
            <div className="notes-grid">
              {others.map((note) => (
                <div key={note.id} className="note-item">
                  <NoteCard {...cardProps(note)} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {activeNote && (
        <NoteModal
          note={activeNote}
          labels={labels}
          folders={folders}
          onClose={() => setActiveNote(null)}
          onUpdate={updateNote}
          onDelete={deleteNote}
          onArchive={handleArchive}
          onCreateLabel={addLabel}
          onDeleteLabel={deleteLabel}
          uploadImage={uploadImage}
        />
      )}

      {toast && <Toast message={toast} onHide={() => setToast(null)} />}
    </div>
  );
}
