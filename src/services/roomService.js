import { collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { createDocument, listDocuments, requireFirestore } from '../firebase/firestoreData'

export async function getRooms() {
  return listDocuments('rooms')
}

export async function addRoom(data) {
  const room = await createDocument('rooms', {
    name: data.name,
    classLevel: Number(data.classLevel),
    points: 0,
    members: 0,
    wins: 0,
    createdAt: serverTimestamp(),
  })
  return room.id
}

export async function updateRoom(id, data) {
  const db = requireFirestore()
  await updateDoc(doc(db, 'rooms', id), {
    name: data.name,
    classLevel: Number(data.classLevel),
  })
}

export async function deleteRoom(id) {
  const db = requireFirestore()
  const [members, results] = await Promise.all([
    listDocuments('members'),
    listDocuments('results'),
  ])
  if (members.some((member) => member.roomId === id)) {
    throw new Error('Pindahkan atau hapus anggota kamar sebelum menghapus kamar ini.')
  }
  if (results.some((result) => result.roomAId === id || result.roomBId === id)) {
    throw new Error('Kamar sudah tercatat pada hasil pertandingan dan tidak dapat dihapus.')
  }
  await deleteDoc(doc(db, 'rooms', id))
}
