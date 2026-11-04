
import { useMemo, useState } from 'react'
import useLeagueData from '../useLeagueData'
import Badge from '../components/common/Badge'
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react'

export default function Leaderboard() {
  const [grade, setGrade] = useState('all')
  const [period, setPeriod] = useState('Overall')
  const allRooms = useLeagueData((state) => state.rooms)

  const rooms = useMemo(
    () => allRooms
      .filter(r => grade === 'all' || String(r.classLevel) === grade)
      .sort((a, b) => b.points - a.points),
    [allRooms, grade]
  )

  const podium = rooms.slice(0, 3)

  return (
    <div className="content-stack leaderboard-page">

      <div className="page-heading">
        <div>
          <h2>Overall Leaderboard</h2>
          <p>Semua kamar bersaing dalam satu liga gabungan.</p>
        </div>
        <Badge tone="green">{rooms.length} Active Rooms</Badge>
      </div>

      {/* PODIUM */}
      <section className="podium-section">
        <div className="podium-heading">
          <div>
            <span className="podium-eyebrow">THE CHAMPIONS</span>
            <h3>Top Performing Rooms</h3>
            <p>Kamar dengan perolehan poin tertinggi.</p>
          </div>
          <Trophy size={28} />
        </div>

        <div className="podium-grid">
          {podium.map((room, i) => (
            <div className={`podium-card podium-${i + 1}`} key={room.id}>
              <div className="podium-medal">
                {i === 0 ? <Crown size={25}/> : <Medal size={25}/>}
              </div>

              <span className="podium-rank">
                {i === 0 ? '1ST PLACE' : i === 1 ? '2ND PLACE' : '3RD PLACE'}
              </span>

              <h3>Room {room.name}</h3>
              <span className="podium-grade">
                Grade {room.classLevel}
              </span>

              <strong className="podium-points">
                {room.points.toLocaleString('id-ID')}
              </strong>
              <span className="podium-unit">TOTAL POINTS</span>
            </div>
          ))}
        </div>
      </section>

      {/* FILTER */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>CLASS</label>
          <select value={grade} onChange={e => setGrade(e.target.value)}>
            <option value="all">All grades</option>
            <option value="7">Grade 7</option>
            <option value="8">Grade 8</option>
            <option value="9">Grade 9</option>
          </select>
        </div>

        <div className="filter-group">
          <label>PERIOD</label>
          <select value={period} onChange={e => setPeriod(e.target.value)}>
            <option>Overall</option>
            <option>This month</option>
            <option>This week</option>
          </select>
        </div>

        <span className="filter-note">
          Showing {rooms.length} rooms · {period}
        </span>
      </div>

      {/* RANKING TABLE */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Room Rankings</h3>
            <p>Ranking berdasarkan total poin</p>
          </div>
          <Badge>FIRESTORE DATA</Badge>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>RANK</th>
                <th>ROOM</th>
                <th>GRADE</th>
                <th>WINS</th>
                <th>MEMBERS</th>
                <th className="align-right">TOTAL POINTS</th>
              </tr>
            </thead>

            <tbody>
              {rooms.map((r, i) => (
                <tr key={r.id}>
                  <td>
                    <span className={`rank-number ${i < 3 ? `rank-${i + 1}` : ''}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td><strong>Room {r.name}</strong></td>
                  <td><span className="class-pill">Grade {r.classLevel}</span></td>
                  <td>{r.wins}</td>
                  <td>{r.members}</td>
                  <td className="align-right points-cell">
                    {r.points.toLocaleString('id-ID')} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel-foot">
          <TrendingUp size={15}/>
          All competing rooms are ranked in one overall league.
        </div>
      </div>

      <p className="demo-note">
        Data leaderboard dimuat langsung dari Firestore.
      </p>

    </div>
  )
}
