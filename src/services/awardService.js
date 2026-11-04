import { deleteDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { createDocument, requireFirestore } from '../firebase/firestoreData'

export async function addAward(data) {
  const db = requireFirestore()
  const memberSnapshot = await getDoc(doc(db, 'members', data.memberId))
  if (!memberSnapshot.exists()) throw new Error('Anggota yang dipilih tidak ditemukan.')
  const member = memberSnapshot.data()
  const roomSnapshot = await getDoc(doc(db, 'rooms', member.roomId))
  if (!roomSnapshot.exists()) throw new Error('Kamar anggota tidak ditemukan.')
  const room = roomSnapshot.data()

  return createDocument('mvpAwards', {
    title: data.title,
    memberId: data.memberId,
    memberName: member.name,
    roomId: member.roomId,
    roomName: room.name,
    note: data.note,
    status: data.status,
    createdAt: serverTimestamp(),
  })
}

export async function deleteAward(id) {
  const db = requireFirestore()
  await deleteDoc(doc(db, 'mvpAwards', id))
}
