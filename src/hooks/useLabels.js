import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

export function useLabels() {
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'labels'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
      setLabels(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const addLabel = async (name, color = '#D4763B') => {
    if (!name.trim()) return;
    await addDoc(collection(db, 'labels'), {
      name: name.trim(),
      color,
      createdAt: serverTimestamp(),
    });
  };

  const updateLabel = async (id, changes) => {
    await updateDoc(doc(db, 'labels', id), changes);
  };

  // Удалить метку + убрать её из всех заметок
  const deleteLabel = async (id) => {
    const notesSnap = await getDocs(collection(db, 'notes'));
    const affected = notesSnap.docs.filter((d) =>
      d.data().labelIds?.includes(id)
    );

    if (affected.length > 0) {
      const batch = writeBatch(db);
      affected.forEach((noteDoc) => {
        const newLabelIds = noteDoc.data().labelIds.filter((lid) => lid !== id);
        batch.update(doc(db, 'notes', noteDoc.id), { labelIds: newLabelIds });
      });
      await batch.commit();
    }

    await deleteDoc(doc(db, 'labels', id));
  };

  return { labels, addLabel, updateLabel, deleteLabel };
}
