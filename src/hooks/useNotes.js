import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, query, orderBy, where, getDocs,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

export function useNotes(folderId = null, view = 'notes') {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let q;

    if (view === 'trash') {
      // Корзина — удалённые заметки
      q = query(
        collection(db, 'notes'),
        where('deleted', '==', true),
        orderBy('deletedAt', 'desc')
      );
    } else if (view === 'archive') {
      // Только архивные
      q = query(
        collection(db, 'notes'),
        where('archived', '==', true),
        orderBy('updatedAt', 'desc')
      );
    } else if (folderId) {
      // Заметки конкретной папки, не архивные
      q = query(
        collection(db, 'notes'),
        where('folderId', '==', folderId),
        where('archived', '==', false),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Главная: только НЕ архивные, без фильтрации по folderId
      // Фильтруем folderId === null на клиенте
      q = query(
        collection(db, 'notes'),
        where('archived', '==', false),
        orderBy('createdAt', 'desc')
      );
    }

    const unsub = onSnapshot(q,
      (snap) => {
        setNotes(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((n) => {
              if (view === 'trash') return n.deleted === true;
              if (n.deleted) return false;
              if (view === 'archive') return n.archived === true;
              if (folderId) return n.folderId === folderId;
              return !n.folderId && n.archived === false;
            })
        );
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore error:', err);
        setLoading(false);
        setError('Ошибка загрузки заметок. Проверьте правила Firestore.');
      }
    );
    return unsub;
  }, [folderId, view]);

  const addNote = async ({ title, text, color, imageUrl, labelIds, folderId }) => {
    if (!title?.trim() && !text?.trim() && !imageUrl) return;
    await addDoc(collection(db, 'notes'), {
      title: title?.trim() || '',
      text: text?.trim() || '',
      color: color || '#FDFAF5',
      pinned: false,
      archived: false,
      imageUrl: imageUrl || null,
      labelIds: labelIds || [],
      folderId: folderId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateNote = async (id, changes) => {
    await updateDoc(doc(db, 'notes', id), {
      ...changes,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteNote = async (id, imageUrl) => {
    if (imageUrl && imageUrl.includes('firebasestorage')) {
      try { await deleteObject(ref(storage, imageUrl)); } catch (_) {}
    }
    // Мягкое удаление
    await updateDoc(doc(db, 'notes', id), {
      deleted: true,
      deletedAt: serverTimestamp(),
    });
  };

  const toggleArchive = async (id, archived, onRestored) => {
    await updateDoc(doc(db, 'notes', id), {
      archived: !archived,
      pinned: false,
      updatedAt: serverTimestamp(),
    });
    if (archived && onRestored) onRestored();
  };

  const togglePin = async (id, pinned) => {
    await updateDoc(doc(db, 'notes', id), { pinned: !pinned });
  };

  // Восстановить из корзины
  const restoreNote = async (id) => {
    await updateDoc(doc(db, 'notes', id), {
      deleted: false,
      deletedAt: null,
      updatedAt: serverTimestamp(),
    });
  };

  // Удалить навсегда (физически)
  const deleteNotePermanently = async (id, imageUrl) => {
    if (imageUrl && imageUrl.includes('firebasestorage')) {
      try { await deleteObject(ref(storage, imageUrl)); } catch (_) {}
    }
    await deleteDoc(doc(db, 'notes', id));
  };

  // Очистить всю корзину
  const clearTrash = async () => {
    const snap = await getDocs(
      query(collection(db, 'notes'), where('deleted', '==', true))
    );
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(doc(db, 'notes', d.id)));
    await batch.commit();
  };

  const uploadImage = async (file) => {
    const path = `notes/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const uploadImageFromUrl = (url) => url;

  return {
    notes, loading, error,
    addNote, updateNote, deleteNote,
    toggleArchive, togglePin,
    restoreNote, deleteNotePermanently, clearTrash,
    uploadImage, uploadImageFromUrl
  };
}
