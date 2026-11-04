
import { useEffect, useState } from 'react'
import {
  CalendarDays,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
} from 'lucide-react'

import AdminLayout from '../components/layout/AdminLayout'
import {
  getEvents,
  addEvent,
  updateEvent,
  deleteEvent,
} from '../services/eventService'

export default function ManageEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('Upcoming')

  async function fetchEvents() {
    try {
      setLoading(true)
      setError('')

      const data = await getEvents()
      setEvents(data)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Gagal mengambil data event.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  function resetForm() {
    setShowForm(false)
    setEditingEvent(null)
    setTitle('')
    setCategory('')
    setDate('')
    setStatus('Upcoming')
  }

  function openAddForm() {
    setEditingEvent(null)
    setTitle('')
    setCategory('')
    setDate('')
    setStatus('Upcoming')
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function openEditForm(event) {
    setEditingEvent(event)
    setTitle(event.title || '')
    setCategory(event.category || '')
    setDate(event.date || '')
    setStatus(event.status || 'Upcoming')
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!title.trim() || !category.trim() || !date || !status) {
      setError('Semua informasi event wajib diisi.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const eventData = {
        title: title.trim(),
        category: category.trim(),
        date,
        status,
      }

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData)
        setSuccess('Event berhasil diperbarui.')
      } else {
        await addEvent(eventData)
        setSuccess('Event baru berhasil ditambahkan.')
      }

      resetForm()
      await fetchEvents()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Gagal menyimpan event.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(event) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus event "${event.title}"?`
    )

    if (!confirmed) return

    try {
      setError('')
      setSuccess('')

      await deleteEvent(event.id)

      setSuccess(`Event "${event.title}" berhasil dihapus.`)
      await fetchEvents()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Gagal menghapus event.')
    }
  }

  function getStatusClass(value) {
    const normalized = value?.toLowerCase()

    if (normalized === 'completed') return 'event-status completed'
    if (normalized === 'ongoing') return 'event-status ongoing'

    return 'event-status upcoming'
  }

  return (
    <AdminLayout
      title="Manage Events"
      description="Kelola jadwal dan status kompetisi mingguan."
    >
      <div className="content-stack">
        <div className="admin-section-heading">
          <div>
            <h3>Event Management</h3>
            <p>Daftar event kompetisi Cakratama Dormitory League.</p>
          </div>

          <div className="room-action-group">
            <button
              className="button button-secondary"
              onClick={fetchEvents}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              className="button button-primary"
              onClick={openAddForm}
            >
              <Plus size={16} />
              Tambah Event
            </button>
          </div>
        </div>

        {success && <div className="room-success">{success}</div>}

        {error && !showForm && (
          <div className="room-error">{error}</div>
        )}

        {showForm && (
          <div className="panel room-form-panel">
            <div className="admin-table-heading">
              <div>
                <h3>{editingEvent ? 'Edit Event' : 'Tambah Event Baru'}</h3>
                <p>Masukkan informasi event kompetisi.</p>
              </div>

              <button
                type="button"
                className="button button-secondary"
                onClick={resetForm}
              >
                <X size={16} />
                Tutup
              </button>
            </div>

            <form className="room-form" onSubmit={handleSubmit}>
              <div className="room-form-field">
                <label htmlFor="eventTitle">Nama Event</label>
                <input
                  id="eventTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Futsal Competition"
                  required
                />
              </div>

              <div className="room-form-field">
                <label htmlFor="eventCategory">Kategori</label>
                <input
                  id="eventCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Contoh: Sports"
                  required
                />
              </div>

              <div className="room-form-field">
                <label htmlFor="eventDate">Tanggal Event</label>
                <input
                  id="eventDate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="room-form-field">
                <label htmlFor="eventStatus">Status</label>
                <select
                  id="eventStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {error && (
                <div className="room-error">{error}</div>
              )}

              <div className="room-form-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="button button-primary"
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving
                    ? 'Menyimpan...'
                    : editingEvent
                      ? 'Simpan Perubahan'
                      : 'Tambah Event'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="admin-stats">
          <div>
            <span>TOTAL EVENTS</span>
            <strong>{events.length}</strong>
          </div>

          <div>
            <span>UPCOMING</span>
            <strong>
              {events.filter((e) => e.status === 'Upcoming').length}
            </strong>
          </div>

          <div>
            <span>COMPLETED</span>
            <strong>
              {events.filter((e) => e.status === 'Completed').length}
            </strong>
          </div>
        </div>

        <div className="panel">
          <div className="admin-table-heading">
            <div>
              <h3>All Events</h3>
              <p>{events.length} event ditemukan</p>
            </div>
          </div>

          {loading ? (
            <div className="admin-empty-state">Memuat data event...</div>
          ) : error && events.length === 0 ? (
            <div className="admin-empty-state">{error}</div>
          ) : events.length === 0 ? (
            <div className="admin-empty-state">
              <CalendarDays size={32} />
              <strong>Belum ada event</strong>
              <p>Tambahkan event pertama CDL.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>NO.</th>
                    <th>EVENT</th>
                    <th>CATEGORY</th>
                    <th>DATE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {events.map((event, index) => (
                    <tr key={event.id}>
                      <td>{index + 1}</td>
                      <td><strong>{event.title}</strong></td>
                      <td>{event.category}</td>
                      <td>{event.date}</td>
                      <td>
                        <span className={getStatusClass(event.status)}>
                          {event.status}
                        </span>
                      </td>
                      <td>
                        <div className="room-row-actions">
                          <button
                            type="button"
                            className="room-icon-button"
                            title="Edit event"
                            onClick={() => openEditForm(event)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="room-icon-button room-delete-button"
                            title="Hapus event"
                            onClick={() => handleDelete(event)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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
