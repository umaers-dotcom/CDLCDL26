
import { useEffect, useState } from 'react'
import {
  createResult,
  getResults,
  publishResult,
} from '../services/resultService'
import { Plus, RefreshCw, ClipboardList, Send } from 'lucide-react'

import AdminLayout from '../components/layout/AdminLayout'
import { getEvents } from '../services/eventService'
import { getRooms } from '../services/roomService'

export default function ManageResults() {
  const [events, setEvents] = useState([])
  const [rooms, setRooms] = useState([])
  const [results, setResults] = useState([])

  const [eventId, setEventId] = useState('')
  const [roomA, setRoomA] = useState('')
  const [roomB, setRoomB] = useState('')
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [pointsA, setPointsA] = useState('')
  const [pointsB, setPointsB] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishingId, setPublishingId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadData() {
    try {
      setLoading(true)
      setError('')

      const [eventData, roomData, resultsData] = await Promise.all([
        getEvents(),
        getRooms(),
        getResults(),
      ])

      setEvents(eventData)
      setRooms(roomData)
      setResults(resultsData)
    } catch (err) {
      console.error('GAGAL MEMUAT MANAGE RESULTS:', err)
      setError(err.message || 'Gagal memuat data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!eventId || !roomA || !roomB) {
      setError('Event dan kedua kamar wajib dipilih.')
      return
    }

    if (roomA === roomB) {
      setError('Pilih dua kamar yang berbeda.')
      return
    }

    const parsedScoreA = Number(scoreA)
    const parsedScoreB = Number(scoreB)
    const parsedPointsA = Number(pointsA)
    const parsedPointsB = Number(pointsB)

    if (
      !Number.isSafeInteger(parsedScoreA) || parsedScoreA < 0 ||
      !Number.isSafeInteger(parsedScoreB) || parsedScoreB < 0 ||
      !Number.isSafeInteger(parsedPointsA) || parsedPointsA < 0 ||
      !Number.isSafeInteger(parsedPointsB) || parsedPointsB < 0
    ) {
      setError('Skor dan poin harus berupa bilangan bulat minimal 0.')
      return
    }

    const selectedEvent = events.find((item) => item.id === eventId)
    const selectedRoomA = rooms.find((item) => item.id === roomA)
    const selectedRoomB = rooms.find((item) => item.id === roomB)

    if (!selectedEvent || !selectedRoomA || !selectedRoomB) {
      setError('Data event atau kamar tidak ditemukan.')
      return
    }

    try {
      setSaving(true)

      await createResult({
        eventId,
        eventTitle: selectedEvent.title,
        roomAId: roomA,
        roomAName: selectedRoomA.name,
        roomBId: roomB,
        roomBName: selectedRoomB.name,
        scoreA: parsedScoreA,
        scoreB: parsedScoreB,
        pointsA: parsedPointsA,
        pointsB: parsedPointsB,
      })

      setSuccess('Hasil pertandingan berhasil disimpan sebagai Pending.')

      setEventId('')
      setRoomA('')
      setRoomB('')
      setScoreA('')
      setScoreB('')
      setPointsA('')
      setPointsB('')

      await loadData()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Gagal menyimpan hasil pertandingan.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish(result) {
    const confirmed = window.confirm(
      `Publikasikan hasil ${result.roomAName} vs ${result.roomBName}?\n\n` +
      `Poin yang diberikan:\n` +
      `${result.roomAName}: ${result.pointsA}\n` +
      `${result.roomBName}: ${result.pointsB}\n\n` +
      `Poin akan langsung ditambahkan ke leaderboard.`
    )

    if (!confirmed) return

    try {
      setPublishingId(result.id)
      setError('')
      setSuccess('')

      await publishResult(result.id)

      setSuccess('Hasil berhasil dipublikasikan dan poin telah diperbarui.')
      await loadData()
    } catch (err) {
      console.error('GAGAL MEMPUBLIKASIKAN HASIL:', err)
      setError(err.message || 'Gagal mempublikasikan hasil.')
    } finally {
      setPublishingId('')
    }
  }

  return (
    <AdminLayout
      title="Manage Results"
      description="Input hasil pertandingan dan atur poin setiap kamar."
    >
      <div className="content-stack">
        <div className="admin-section-heading">
          <div>
            <h3>Input Match Result</h3>
            <p>Hasil baru akan disimpan sebagai Pending.</p>
          </div>

          <button
            className="button button-secondary"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && <div className="room-error">{error}</div>}
        {success && <div className="room-success">{success}</div>}

        <div className="panel room-form-panel">
          <form className="room-form" onSubmit={handleSubmit}>
            <div className="room-form-field">
              <label>Event</label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                required
              >
                <option value="">Pilih event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="room-form-field">
              <label>Kamar A</label>
              <select
                value={roomA}
                onChange={(e) => setRoomA(e.target.value)}
                required
              >
                <option value="">Pilih kamar pertama</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="room-form-field">
              <label>Kamar B</label>
              <select
                value={roomB}
                onChange={(e) => setRoomB(e.target.value)}
                required
              >
                <option value="">Pilih kamar kedua</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="room-form-field">
              <label>Skor Kamar A</label>
              <input
                type="number"
                min="0"
                step="1"
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                placeholder="Contoh: 3"
                required
              />
            </div>

            <div className="room-form-field">
              <label>Skor Kamar B</label>
              <input
                type="number"
                min="0"
                step="1"
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                placeholder="Contoh: 1"
                required
              />
            </div>

            <div className="room-form-field">
              <label>Poin Kamar A</label>
              <input
                type="number"
                min="0"
                step="1"
                value={pointsA}
                onChange={(e) => setPointsA(e.target.value)}
                placeholder="Poin yang diberikan"
                required
              />
            </div>

            <div className="room-form-field">
              <label>Poin Kamar B</label>
              <input
                type="number"
                min="0"
                step="1"
                value={pointsB}
                onChange={(e) => setPointsB(e.target.value)}
                placeholder="Poin yang diberikan"
                required
              />
            </div>

            <div className="room-form-actions">
              <button
                type="submit"
                className="button button-primary"
                disabled={saving || loading}
              >
                <Plus size={16} />
                {saving ? 'Menyimpan...' : 'Simpan Hasil'}
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="admin-table-heading">
            <div>
              <h3>Match Results</h3>
              <p>{results.length} hasil pertandingan</p>
            </div>
          </div>

          {loading ? (
            <div className="admin-empty-state">Memuat hasil...</div>
          ) : results.length === 0 ? (
            <div className="admin-empty-state">
              <ClipboardList size={32} />
              <strong>Belum ada hasil pertandingan</strong>
              <p>Hasil yang disimpan akan muncul di sini.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>EVENT</th>
                    <th>PERTANDINGAN</th>
                    <th>SKOR</th>
                    <th>POIN</th>
                    <th>STATUS</th>
                    <th>AKSI</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((result) => (
                    <tr key={result.id}>
                      <td>{result.eventTitle}</td>
                      <td>
                        {result.roomAName} vs {result.roomBName}
                      </td>
                      <td>
                        {result.scoreA} - {result.scoreB}
                      </td>
                      <td>
                        {result.pointsA} - {result.pointsB}
                      </td>
                      <td>
                        <span className="event-status upcoming">
                          {result.status}
                        </span>
                      </td>
                      <td>
                        {result.status === 'Pending' ? (
                          <button
                            type="button"
                            className="button button-primary"
                            onClick={() => handlePublish(result)}
                            disabled={Boolean(publishingId)}
                          >
                            <Send size={14} />
                            {publishingId === result.id
                              ? 'Memproses...'
                              : 'Publikasikan'}
                          </button>
                        ) : (
                          <span>Sudah dipublikasikan</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
