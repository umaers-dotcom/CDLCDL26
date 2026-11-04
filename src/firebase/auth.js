import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from './config'

const pendingAdminChecks = new Map()

export function subscribeToAuth(callback, onError = console.error) {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback, onError)
}

export function checkIsAdmin(user) {
  if (!user || !db) return Promise.resolve(false)

  const pendingCheck = pendingAdminChecks.get(user.uid)
  if (pendingCheck) return pendingCheck

  const check = getDoc(doc(db, 'admins', user.uid))
    .then((snapshot) => snapshot.exists() && snapshot.data()?.role === 'admin')
    .finally(() => pendingAdminChecks.delete(user.uid))
  pendingAdminChecks.set(user.uid, check)
  return check
}

export async function loginAdmin(email, password) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase belum dikonfigurasi. Periksa file .env lalu mulai ulang Vite.')
  }

  const credential = await signInWithEmailAndPassword(auth, email, password)

  try {
    if (await checkIsAdmin(credential.user)) return credential
  } catch (error) {
    await signOut(auth)
    throw error
  }

  await signOut(auth)
  const error = new Error('Akun ini belum memiliki akses admin.')
  error.code = 'admin/not-admin'
  throw error
}

export async function logoutAdmin() {
  if (auth) await signOut(auth)
}
