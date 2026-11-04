import { useEffect, useRef, useState } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import { db } from './firebase/config'
import { checkIsAdmin, subscribeToAuth } from './firebase/auth'

const initialData = {
  rooms: [],
  members: [],
  events: [],
  results: [],
  pointTransactions: [],
  mvpAwards: [],
  pointSettings: { winPoints: 3 },
}

const selectAll = (state) => state

export default function useLeagueData(selector = selectAll) {
  const selectorRef = useRef(selector)
  selectorRef.current = selector
  const [selectedState, setSelectedState] = useState(() => selector(initialData))

  useEffect(() => {
    let active = true
    let authChangeId = 0
    let unsubscribeData = []
    let data = { ...initialData }

    if (!db) {
      window.dispatchEvent(new CustomEvent('cdl-firestore-error', {
        detail: { key: 'config', message: 'Firebase belum dikonfigurasi. Isi .env lalu mulai ulang Vite.' },
      }))
      return () => {
        active = false
      }
    }

    function clearDataSubscriptions() {
      unsubscribeData.forEach((unsubscribe) => unsubscribe())
      unsubscribeData = []
    }

    function watchCollection(name, key, isAdmin, publishedOnly = false) {
      let collectionRef = collection(db, name)
      if (publishedOnly && !isAdmin) {
        collectionRef = query(collectionRef, where('status', 'in', ['Published', 'published']))
      }

      const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
        if (!active) return
        window.dispatchEvent(new CustomEvent('cdl-firestore-error', {
          detail: { key: name, message: '' },
        }))
        data = {
          ...data,
          [key]: snapshot.docs.map((item) => {
            const value = { id: item.id, ...item.data() }
            if (
              (key === 'results' || key === 'mvpAwards')
              && value.status === 'published'
            ) {
              value.status = 'Published'
            }
            return value
          }),
        }
        setSelectedState(selectorRef.current(data))
      }, (error) => {
        console.error(`Gagal memuat koleksi ${name}:`, error)
        window.dispatchEvent(new CustomEvent('cdl-firestore-error', {
          detail: { key: name, message: error.message },
        }))
      })
      unsubscribeData.push(unsubscribe)
    }

    function watchSettings() {
      const unsubscribe = onSnapshot(doc(db, 'pointSettings', 'default'), (snapshot) => {
        if (!active) return
        window.dispatchEvent(new CustomEvent('cdl-firestore-error', {
          detail: { key: 'pointSettings', message: '' },
        }))
        data = {
          ...data,
          pointSettings: snapshot.exists() ? snapshot.data() : { winPoints: 3 },
        }
        setSelectedState(selectorRef.current(data))
      }, (error) => {
        console.error('Gagal memuat pengaturan poin:', error)
        window.dispatchEvent(new CustomEvent('cdl-firestore-error', {
          detail: { key: 'pointSettings', message: error.message },
        }))
      })
      unsubscribeData.push(unsubscribe)
    }

    const unsubscribeAuth = subscribeToAuth(async (user) => {
      const currentChangeId = ++authChangeId
      clearDataSubscriptions()
      let isAdmin = false
      if (user) {
        try {
          isAdmin = await checkIsAdmin(user)
        } catch (error) {
          console.error('Gagal memeriksa hak akses data:', error)
        }
      }
      if (!active || currentChangeId !== authChangeId) return

      data = { ...initialData }
      watchCollection('rooms', 'rooms', isAdmin)
      watchCollection('members', 'members', isAdmin)
      watchCollection('events', 'events', isAdmin)
      watchCollection('results', 'results', isAdmin, true)
      watchCollection('points', 'pointTransactions', isAdmin)
      watchCollection('mvpAwards', 'mvpAwards', isAdmin, true)
      if (isAdmin) watchSettings()
      setSelectedState(selectorRef.current(data))
    }, (error) => {
      console.error('Gagal memantau autentikasi untuk data Firestore:', error)
    })

    return () => {
      active = false
      unsubscribeAuth()
      clearDataSubscriptions()
    }
  }, [])

  return selectedState
}
