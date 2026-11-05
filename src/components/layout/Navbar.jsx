import { Bell, Search } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import useLeagueData from '../../useLeagueData'

const titles = {
  '/': 'Overview', '/leaderboard': 'Leaderboard', '/rooms': 'Rooms', '/players': 'Players',
  '/events': 'Events', '/mvp': 'MVP & Awards', '/statistics': 'Statistics', '/history': 'History',
  '/admin': 'Admin Dashboard', '/admin/rooms': 'Manage Rooms', '/admin/members': 'Manage Members',
  '/admin/events': 'Manage Events', '/admin/results': 'Manage Results', '/admin/points': 'Manage Points', '/admin/mvp': 'Manage MVP'
}

export default function Navbar() {
  const { pathname } = useLocation()
  const events = useLeagueData((state) => state.events)
  const title = titles[pathname] || (pathname.startsWith('/rooms/') ? 'Room Details' : pathname.startsWith('/events/') ? 'Event Details' : 'CDL')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcomingEvents = events
    .map((event) => {
      const date = event.date?.toDate ? event.date.toDate() : new Date(event.date)
      return { ...event, eventDate: date }
    })
    .filter((event) => (
      event.status?.toLowerCase() === 'upcoming'
      && !Number.isNaN(event.eventDate.getTime())
      && event.eventDate >= today
    ))
    .sort((a, b) => a.eventDate - b.eventDate)

  return <header className="topbar">
    <div><div className="breadcrumb">CDL <span>/</span> <strong>{title}</strong></div><h1>{title}</h1></div>
    <div className="topbar-actions"><div className="search-box"><Search size={16}/><input placeholder="Search CDL..." aria-label="Search CDL"/></div><div className="notification-menu">
      <button className="icon-button" aria-label={`Notifications${upcomingEvents.length ? `, ${upcomingEvents.length} upcoming events` : ''}`} aria-haspopup="true">
        <Bell size={19}/>
        {upcomingEvents.length > 0 && <i/>}
      </button>
      <div className="notification-dropdown" aria-label="Upcoming events">
        <div className="notification-dropdown-header">
          <strong>Event mendatang</strong>
          <span>{upcomingEvents.length}</span>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="notification-event-list">
            {upcomingEvents.map((event) => (
              <Link className="notification-event" to={`/events/${event.id}`} key={event.id}>
                <strong>{event.title}</strong>
                <span>{event.category} · {event.eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="notification-empty">Belum ada event mendatang.</p>
        )}
      </div>
    </div><div className="avatar">OS</div></div>
  </header>
}
