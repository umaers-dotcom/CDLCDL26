import { doc, setDoc } from 'firebase/firestore'
import { listDocuments, requireFirestore } from '../firebase/firestoreData'

export async function getPlayers() {
  return listDocuments('members')
}

export async function savePlayer(id, data) {
  const db = requireFirestore()
  await setDoc(doc(db, 'members', id), data, { merge: true })
}
