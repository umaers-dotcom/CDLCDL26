import { addDoc, collection, doc, getDocs } from 'firebase/firestore'
import { db } from './config'

export async function listDocuments(collectionName) {
  if (!db) throw new Error('Firebase belum dikonfigurasi.')
  const snapshot = await getDocs(collection(db, collectionName))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}

export function newDocumentRef(collectionName) {
  if (!db) throw new Error('Firebase belum dikonfigurasi.')
  return doc(collection(db, collectionName))
}

export async function createDocument(collectionName, data) {
  if (!db) throw new Error('Firebase belum dikonfigurasi.')
  return addDoc(collection(db, collectionName), data)
}

export function requireFirestore() {
  if (!db) throw new Error('Firebase belum dikonfigurasi.')
  return db
}
