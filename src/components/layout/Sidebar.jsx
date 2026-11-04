import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Trophy, DoorOpen, Users, CalendarDays, Medal, ChartNoAxesCombined, History, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'

const mainLinks = [
  ['/', 'Overview', LayoutDashboard],
  ['/leaderboard', 'Leaderboard', Trophy],
  ['/rooms', 'Rooms', DoorOpen],
  ['/players', 'Players', Users],
  ['/events', 'Events', CalendarDays],
  ['/mvp', 'MVP & Awards', Medal],
  ['/statistics', 'Statistics', ChartNoAxesCombined],
  ['/history', 'History', History],
]
export default function Sidebar() {
  const [open, setOpen] = useState(false)
  return <>
    <button className="mobile-menu" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
    {open && <button className="sidebar-backdrop" onClick={() => setOpen(false)} aria-label="Close menu" />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand">
        <img src="/logo.svg" alt="CDL logo" />
        <div><strong>CAKRATAMA</strong><span>DORMITORY LEAGUE</span></div>
        <button className="close-menu" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18}/></button>
      </div>
      <div className="nav-label">MAIN MENU</div>
      <nav className="nav-list">
        {mainLinks.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18}/><span>{label}</span></NavLink>)}
      </nav>
      <div className="nav-label admin-label">MANAGEMENT</div>
      <nav className="nav-list">
        <NavLink to="/admin" onClick={() => setOpen(false)} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}><ShieldCheck size={18}/><span>Admin Panel</span></NavLink>
      </nav>
      <div className="sidebar-bottom"><div className="season-dot" /> <div><strong>CDL Season 2026/27</strong><span>One league · 13 rooms</span></div></div>
    </aside>
  </>
}
