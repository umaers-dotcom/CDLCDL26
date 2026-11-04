import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { newDocumentRef, requireFirestore } from '../firebase/firestoreData'

export async function getPointData() {
  const db = requireFirestore()
  const [transactions, settings] = await Promise.all([
    getDocs(query(collection(db, 'points'), orderBy('createdAt', 'desc'))),
    getDoc(doc(db, 'pointSettings', 'default')),
  ])
  return {
    transactions: transactions.docs.map((item) => ({ id: item.id, ...item.data() })),
    settings: settings.exists() ? settings.data() : { winPoints: 3 },
  }
}

export async function savePointSettings(winPoints) {
  const db = requireFirestore()
  await setDoc(doc(db, 'pointSettings', 'default'), {
    winPoints,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function addManualPoints({ roomId, amount, reason }) {
  const db = requireFirestore()
  const roomRef = doc(db, 'rooms', roomId)
  const pointRef = newDocumentRef('points')
  await runTransaction(db, async (transaction) => {
    const room = await transaction.get(roomRef)
    if (!room.exists()) throw new Error('Kamar tidak ditemukan.')
    const currentPoints = Number(room.data().points || 0)
    if (!Number.isSafeInteger(currentPoints + amount) || currentPoints + amount < 0) {
      throw new Error('Total poin kamar tidak boleh kurang dari 0.')
    }

    transaction.update(roomRef, { points: currentPoints + amount })
    transaction.set(pointRef, {
      roomId,
      roomName: room.data().name,
      amount,
      type: 'manual',
      reason: reason.trim(),
      createdAt: serverTimestamp(),
    })
  })
}
