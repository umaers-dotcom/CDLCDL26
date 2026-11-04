import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { createDocument, newDocumentRef, requireFirestore } from '../firebase/firestoreData'

export async function getResults() {
  const db = requireFirestore()
  const snapshot = await getDocs(query(collection(db, 'results'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((item) => {
    const result = { id: item.id, ...item.data() }
    if (result.status === 'published') result.status = 'Published'
    return result
  })
}

export async function createResult(data) {
  return createDocument('results', {
    ...data,
    status: 'Pending',
    createdAt: serverTimestamp(),
  })
}

export async function publishResult(resultId) {
  const db = requireFirestore()
  const resultRef = doc(db, 'results', resultId)
  const [pointRefA, pointRefB] = [newDocumentRef('points'), newDocumentRef('points')]

  await runTransaction(db, async (transaction) => {
    const resultSnapshot = await transaction.get(resultRef)
    if (!resultSnapshot.exists()) throw new Error('Hasil pertandingan tidak ditemukan.')
    const result = resultSnapshot.data()
    if (result.status !== 'Pending') throw new Error('Hasil ini sudah dipublikasikan.')

    const roomARef = doc(db, 'rooms', result.roomAId)
    const roomBRef = doc(db, 'rooms', result.roomBId)
    const [roomA, roomB] = await Promise.all([
      transaction.get(roomARef),
      transaction.get(roomBRef),
    ])
    if (!roomA.exists() || !roomB.exists()) {
      throw new Error('Data kamar pertandingan tidak ditemukan.')
    }

    const roomAData = roomA.data()
    const roomBData = roomB.data()
    const roomAUpdates = { points: Number(roomAData.points || 0) + result.pointsA }
    const roomBUpdates = { points: Number(roomBData.points || 0) + result.pointsB }
    if (result.scoreA > result.scoreB) roomAUpdates.wins = Number(roomAData.wins || 0) + 1
    if (result.scoreB > result.scoreA) roomBUpdates.wins = Number(roomBData.wins || 0) + 1

    transaction.update(roomARef, roomAUpdates)
    transaction.update(roomBRef, roomBUpdates)
    transaction.update(resultRef, {
      status: 'Published',
      publishedAt: serverTimestamp(),
    })
    transaction.set(pointRefA, {
      roomId: result.roomAId,
      roomName: roomAData.name,
      amount: result.pointsA,
      type: 'match',
      reason: result.eventTitle,
      resultId,
      createdAt: serverTimestamp(),
    })
    transaction.set(pointRefB, {
      roomId: result.roomBId,
      roomName: roomBData.name,
      amount: result.pointsB,
      type: 'match',
      reason: result.eventTitle,
      resultId,
      createdAt: serverTimestamp(),
    })
  })
}
