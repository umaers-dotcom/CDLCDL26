import { Link } from 'react-router-dom'
import { ArrowUpRight, Trophy } from 'lucide-react'
import useLeagueData from '../../useLeagueData'
export default function LeaderboardPreview({ limit = 5 }) {
  const allRooms = useLeagueData((state) => state.rooms)
  const rooms = [...allRooms].sort((a,b) => b.points-a.points).slice(0, limit)
  return <section className="panel">
    <div className="panel-head"><div><h3>Top Rooms</h3><p>Posisi teratas di liga gabungan</p></div><Link to="/leaderboard" className="text-link">View leaderboard <ArrowUpRight size={15}/></Link></div>
    <div className="table-wrap"><table><thead><tr><th>RANK</th><th>ROOM</th><th>CLASS</th><th>WINS</th><th className="align-right">POINTS</th></tr></thead><tbody>
      {rooms.map((room, i) => <tr key={room.id}><td><span className={`rank-number ${i < 3 ? `rank-${i+1}` : ''}`}>{i+1}</span></td><td><strong>Room {room.name}</strong></td><td><span className="class-pill">Grade {room.classLevel}</span></td><td>{room.wins}</td><td className="align-right points-cell">{room.points.toLocaleString('id-ID')} pts</td></tr>)}
    </tbody></table></div>
    <div className="panel-foot"><Trophy size={15}/> All {allRooms.length} rooms compete in one overall league.</div>
  </section>
}
