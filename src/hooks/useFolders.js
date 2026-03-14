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
    const notesSnap = await getDocs(
      query(collection(db, 'notes'), where('folderId', '==', id))
    );

    if (!notesSnap.empty) {
      const batch = writeBatch(db);
      notesSnap.docs.forEach((noteDoc) => {
        batch.update(doc(db, 'notes', noteDoc.id), { folderId: null });
      });
      await batch.commit();
    }

    await deleteDoc(doc(db, 'folders', id));
  };

  return { folders, addFolder, updateFolder, deleteFolder };
}
