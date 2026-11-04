import { Bell, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
const titles = {
  '/': 'Overview', '/leaderboard': 'Leaderboard', '/rooms': 'Rooms', '/players': 'Players',
  '/events': 'Events', '/mvp': 'MVP & Awards', '/statistics': 'Statistics', '/history': 'History',
  '/admin': 'Admin Dashboard', '/admin/rooms': 'Manage Rooms', '/admin/members': 'Manage Members',
  '/admin/events': 'Manage Events', '/admin/results': 'Manage Results', '/admin/points': 'Manage Points', '/admin/mvp': 'Manage MVP'
}
export default function Navbar() {
  const { pathname } = useLocation()
  const title = titles[pathname] || (pathname.startsWith('/rooms/') ? 'Room Details' : pathname.startsWith('/events/') ? 'Event Details' : 'CDL')
  return <header className="topbar">
    <div><div className="breadcrumb">CDL <span>/</span> <strong>{title}</strong></div><h1>{title}</h1></div>
    <div className="topbar-actions"><div className="search-box"><Search size={16}/><input placeholder="Search CDL..." aria-label="Search CDL"/></div><button className="icon-button" aria-label="Notifications"><Bell size={19}/><i/></button><div className="avatar">OS</div></div>
  </header>
}
