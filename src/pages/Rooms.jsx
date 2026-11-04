
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DoorOpen, ArrowUpRight, Users, Trophy } from 'lucide-react'
import { getRooms } from '../services/roomService'
import Badge from '../components/common/Badge'

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchRooms() {
      try {
        const data = await getRooms()
        setRooms(data)
      } catch (err) {
        console.error('Gagal mengambil data kamar:', err)
        setError(err.message || 'Gagal mengambil data kamar.')
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  if (loading) {
    return <div className="content-stack">Memuat data kamar...</div>
  }

  if (error) {
    return <div className="content-stack">Gagal memuat kamar: {error}</div>
  }

  return (
    <div className="content-stack">
      <div className="page-heading">
        <div>
          <h2>All Rooms</h2>
          <p>Daftar kamar peserta CDL berdasarkan tingkat kelas.</p>
        </div>
        <Badge tone="green">{rooms.length} Rooms</Badge>
      </div>

      {rooms.length === 0 ? (
        <div className="empty-state">
          Belum ada data kamar di Firestore.
        </div>  
      ) : (
        <div className="room-grid">
          {rooms.map((r) => (
            <Link
              to={`/rooms/${r.id}`}
              className="room-card"
              key={r.id}
            >
              <div className="room-card-top">
                <div className="room-symbol">
                  <DoorOpen size={21} />
                </div>
                <Badge>Grade {r.classLevel}</Badge>
              </div>

              <h3>Room {r.name}</h3>

              <div className="room-metrics">
                <span><Users size={15} /> {r.members ?? 0} members</span>
                <span><Trophy size={15} /> {r.wins ?? 0} wins</span>
              </div>

              <div className="room-score">
                <strong>{(r.points ?? 0).toLocaleString('id-ID')}</strong>
                <span>POINTS</span>
              </div>

              <div className="room-link">
                View room <ArrowUpRight size={15} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
