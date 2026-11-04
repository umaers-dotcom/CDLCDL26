import { Link } from 'react-router-dom'
import { DoorOpen, Users, CalendarDays, ClipboardCheck, Medal, Settings2, ArrowUpRight } from 'lucide-react'
import AdminLayout from '../components/layout/AdminLayout'
import useLeagueData from '../useLeagueData'

const links = [
  ['Rooms', 'Kelola kamar', '/admin/rooms', DoorOpen],
  ['Members', 'Kelola anggota kamar', '/admin/members', Users],
  ['Events', 'Buat dan atur event', '/admin/events', CalendarDays],
  ['Results', 'Input dan publikasikan hasil', '/admin/results', ClipboardCheck],
  ['Points', 'Riwayat transaksi poin', '/admin/points', Settings2],
  ['MVP & Awards', 'Kelola penghargaan', '/admin/mvp', Medal],
]

export default function AdminDashboard() {
  const { rooms, members, events, results } = useLeagueData()
  const pendingResults = results.filter((result) => result.status === 'Pending').length
  return <AdminLayout title="Admin Dashboard" description="Pusat pengelolaan kompetisi Cakratama Dormitory League.">
    <div className="admin-stats">
      <div><span>ROOMS</span><strong>{rooms.length}</strong></div>
      <div><span>MEMBERS</span><strong>{members.length}</strong></div>
      <div><span>EVENTS</span><strong>{events.length}</strong></div>
      <div><span>RESULTS PENDING</span><strong>{pendingResults}</strong></div>
    </div>
    <div className="admin-menu-grid">{links.map(([title, desc, to, Icon]) => <Link to={to} className="admin-menu-card" key={to}><span className="admin-menu-icon"><Icon size={21}/></span><h3>{title}</h3><p>{desc}</p><ArrowUpRight size={17} className="admin-arrow"/></Link>)}</div>
    <div className="warning-note">Data pengelolaan tersimpan di Firebase Firestore dan digunakan bersama oleh seluruh pengguna.</div>
  </AdminLayout>
}
