
import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import Sidebar from './components/layout/Sidebar'
import Navbar from './components/layout/Navbar'

import Overview from './pages/Overview'
import Leaderboard from './pages/Leaderboard'
import Rooms from './pages/Rooms'
import RoomDetail from './pages/RoomDetail'
import Players from './pages/Players'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import MVP from './pages/MVP'
import Statistics from './pages/Statistics'
import History from './pages/History'
import Login from './pages/login'

import AdminDashboard from './admin/AdminDashboard'
import ManageRooms from './admin/ManageRooms'
import ManageMembers from './admin/ManageMembers'
import ManageEvents from './admin/ManageEvents'
import ManageResults from './admin/ManageResults'
import ManagePoints from './admin/ManagePoints'
import ManageMVP from './admin/ManageMVP'

import { checkIsAdmin, subscribeToAuth } from './firebase/auth'

function ProtectedAdmin({ isAdmin, children }) {
  if (!isAdmin) {
    return <Navigate to="/login" replace />
  }

  return children
}

function PublicLayout({ isAdmin, firestoreError }) {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-shell">
        <Navbar />

        <main className="page-container">
          {firestoreError && (
            <div className="room-error" role="alert">
              Gagal memuat data Firestore: {firestoreError}
            </div>
          )}
          <Routes>
            {/* PUBLIC PAGES */}
            <Route path="/" element={<Overview />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:roomId" element={<RoomDetail />} />
            <Route path="/players" element={<Players />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:eventId" element={<EventDetail />} />
            <Route path="/mvp" element={<MVP />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/history" element={<History />} />

            {/* ADMIN PAGES */}
            <Route
              path="/admin"
              element={
                <ProtectedAdmin isAdmin={isAdmin}>
                  <AdminDashboard />
                </ProtectedAdmin>
              }
            />

            <Route
              path="/admin/rooms"
              element={
                <ProtectedAdmin isAdmin={isAdmin}>
                  <ManageRooms />
                </ProtectedAdmin>
              }
            />

            <Route
              path="/admin/members"
              element={
                <ProtectedAdmin isAdmin={isAdmin}>
                  <ManageMembers />
                </ProtectedAdmin>
              }
            />

            <Route
              path="/admin/events"
              element={
                <ProtectedAdmin isAdmin={isAdmin}>
                  <ManageEvents />
                </ProtectedAdmin>
              }
            />

            <Route
              path="/admin/results"
              element={
                <ProtectedAdmin isAdmin={isAdmin}>
                  <ManageResults />
                </ProtectedAdmin>
              }
            />

            <Route
              path="/admin/points"
              element={
                <ProtectedAdmin isAdmin={isAdmin}>
                  <ManagePoints />
                </ProtectedAdmin>
              }
            />

            <Route
              path="/admin/mvp"
              element={
                <ProtectedAdmin isAdmin={isAdmin}>
                  <ManageMVP />
                </ProtectedAdmin>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <footer className="footer">
            © {new Date().getFullYear()} Cakratama Dormitory League
            <span> • </span>
            Compete · Contribute · Conquer
          </footer>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [firestoreErrors, setFirestoreErrors] = useState({})

  useEffect(() => {
    function handleFirestoreError(event) {
      const { key, message } = event.detail
      setFirestoreErrors((current) => {
        const next = { ...current }
        if (message) next[key] = message
        else delete next[key]
        return next
      })
    }

    window.addEventListener('cdl-firestore-error', handleFirestoreError)
    return () => window.removeEventListener('cdl-firestore-error', handleFirestoreError)
  }, [])

  useEffect(() => {
    let active = true
    let checkId = 0

    const unsubscribe = subscribeToAuth(async (user) => {
      if (!active) return
      const currentCheckId = ++checkId
      setIsAdmin(false)
      setAuthLoading(true)

      if (!user) {
        setAuthLoading(false)
        return
      }

      try {
        const adminStatus = await checkIsAdmin(user)
        if (active && currentCheckId === checkId) setIsAdmin(adminStatus)
      } catch (error) {
        console.error('Gagal memeriksa akses admin:', error)
        if (active && currentCheckId === checkId) setIsAdmin(false)
      } finally {
        if (active && currentCheckId === checkId) setAuthLoading(false)
      }
    }, (error) => {
      console.error('Gagal memantau status autentikasi:', error)
      checkId += 1
      if (active) {
        setIsAdmin(false)
        setAuthLoading(false)
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  if (authLoading) {
    return <div className="auth-loading">Memeriksa status login...</div>
  }

  const firestoreError = Object.values(firestoreErrors).join(' · ')

  return (
    <Routes>
      <Route
        path="/login"
        element={isAdmin ? <Navigate to="/admin" replace /> : <Login />}
      />

      <Route
        path="/*"
        element={<PublicLayout isAdmin={isAdmin} firestoreError={firestoreError} />}
      />
    </Routes>
  )
}
