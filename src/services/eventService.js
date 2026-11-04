import { deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { createDocument, listDocuments, requireFirestore } from '../firebase/firestoreData'

export async function getEvents() {
  return listDocuments('events')
}

export async function addEvent(data) {
  return createDocument('events', {
    title: data.title,
    category: data.category,
    date: data.date,
    status: data.status,
    description: data.description || '',
    createdAt: serverTimestamp(),
  })
}

export async function updateEvent(id, data) {
  const db = requireFirestore()
  await updateDoc(doc(db, 'events', id), {
    title: data.title,
    category: data.category,
    date: data.date,
    status: data.status,
  })
}

export async function deleteEvent(id) {
  const db = requireFirestore()
  await deleteDoc(doc(db, 'events', id))
}
