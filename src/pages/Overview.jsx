import { DoorOpen, CalendarCheck, Medal, Users, ArrowUpRight, CalendarDays } from 'lucide-react'
import StatCard from '../components/dashboard/StatCard'
import LeaderboardPreview from '../components/dashboard/LeaderboardPreview'
import MVPCard from '../components/dashboard/MVPCard'
import Badge from '../components/common/Badge'
import useLeagueData from '../useLeagueData'
import { Link } from 'react-router-dom'
export default function Overview() {
  const { rooms, members, events } = useLeagueData()
  const totalPoints = rooms.reduce((sum, room) => sum + room.points, 0)
  const completedEvents = events.filter((event) => event.status === 'Completed').length
  return <div className="content-stack">
    <section className="welcome-card"><div><Badge tone="white">DEMO LEAGUE · 2026/27</Badge><h2>Welcome to <span>CDL.</span></h2><p>One league. {rooms.length} rooms. One journey to the top.</p><div className="welcome-meta"><span><span className="live-dot"/> League overview</span><span>•</span><span>Combined leaderboard</span></div></div><div className="welcome-art"><TrophyArt/></div></section>
    <div className="section-title"><div><h2>League Overview</h2><p>Ringkasan kompetisi Cakratama Dormitory League.</p></div><span className="updated-label">FIRESTORE DATA</span></div>
    <div className="stats-grid">
      <StatCard label="Total Rooms" value={rooms.length} note="Across Grade 7–9" icon={DoorOpen}/>
      <StatCard label="Total Members" value={members.length} note="Registered participants" icon={Users} color="violet"/>
      <StatCard label="Events" value={events.length} note={`${completedEvents} completed · ${events.length - completedEvents} upcoming`} icon={CalendarCheck} color="green"/>
      <StatCard label="Total Points" value={totalPoints.toLocaleString('id-ID')} note="Firestore leaderboard" icon={Medal} color="orange"/>
    </div>
    <div className="dashboard-grid"><LeaderboardPreview/><MVPCard/></div>
    <div className="panel">
      <div className="panel-head"><div><h3>Recent & Upcoming Events</h3><p>Aktivitas kompetisi terbaru</p></div><Link to="/events" className="text-link">All events <ArrowUpRight size={15}/></Link></div>
      <div className="event-list">{events.map(e => <div className="event-row" key={e.id}><div className="event-date"><CalendarDays size={18}/><span>{new Date(e.date).toLocaleDateString('id-ID',{day:'2-digit',month:'short'})}</span></div><div className="event-info"><strong>{e.title}</strong><span>{e.category}</span></div><Badge tone={e.status === 'Upcoming' ? 'blue' : 'green'}>{e.status}</Badge></div>)}</div>
    </div>
  </div>
}
function TrophyArt(){return <div className="trophy-art"><div className="trophy-glow"/><div className="trophy-cup">🏆</div><span className="spark spark-one">✦</span><span className="spark spark-two">✧</span><span className="spark spark-three">✦</span></div>}
