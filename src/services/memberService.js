import {
  doc,
  increment,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { listDocuments, newDocumentRef, requireFirestore } from '../firebase/firestoreData'

export async function getMembers() {
  return listDocuments('members')
}

export async function addMember(data) {
  const db = requireFirestore()
  const memberRef = newDocumentRef('members')
  const roomRef = doc(db, 'rooms', data.roomId)
  await runTransaction(db, async (transaction) => {
    const room = await transaction.get(roomRef)
    if (!room.exists()) throw new Error('Kamar yang dipilih tidak ditemukan.')
    transaction.set(memberRef, {
      name: data.name,
      roomId: data.roomId,
      createdAt: serverTimestamp(),
    })
    transaction.update(roomRef, { members: increment(1) })
  })
  return memberRef.id
}

export async function updateMember(id, data) {
  const db = requireFirestore()
  const memberRef = doc(db, 'members', id)
  await runTransaction(db, async (transaction) => {
    const member = await transaction.get(memberRef)
    if (!member.exists()) throw new Error('Data anggota tidak ditemukan.')
    const oldRoomId = member.data().roomId
    const newRoomRef = doc(db, 'rooms', data.roomId)
    const oldRoomRef = oldRoomId !== data.roomId ? doc(db, 'rooms', oldRoomId) : null
    const [newRoom, oldRoom] = await Promise.all([
      transaction.get(newRoomRef),
      oldRoomRef ? transaction.get(oldRoomRef) : Promise.resolve(null),
    ])
    if (!newRoom.exists() || (oldRoom && !oldRoom.exists())) {
      throw new Error('Kamar asal atau tujuan tidak ditemukan.')
    }

    transaction.update(memberRef, { name: data.name, roomId: data.roomId })
    if (oldRoomRef) {
      transaction.update(oldRoomRef, {
        members: Math.max(0, Number(oldRoom.data().members || 0) - 1),
      })
      transaction.update(newRoomRef, {
        members: Number(newRoom.data().members || 0) + 1,
      })
    }
  })
}

export async function deleteMember(id) {
  const db = requireFirestore()
  const memberRef = doc(db, 'members', id)
  await runTransaction(db, async (transaction) => {
    const member = await transaction.get(memberRef)
    if (!member.exists()) throw new Error('Data anggota tidak ditemukan.')
    const roomRef = doc(db, 'rooms', member.data().roomId)
    const room = await transaction.get(roomRef)
    transaction.delete(memberRef)
    if (room.exists()) {
      transaction.update(roomRef, {
        members: Math.max(0, Number(room.data().members || 0) - 1),
      })
    }
  })
}
