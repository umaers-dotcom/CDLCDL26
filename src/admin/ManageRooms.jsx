
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DoorOpen,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
} from 'lucide-react'

import AdminLayout from '../components/layout/AdminLayout'
import Badge from '../components/common/Badge'

import {
  getRooms,
  addRoom,
  updateRoom,
  deleteRoom,
} from '../services/roomService'

export default function ManageRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)

  const [name, setName] = useState('')
  const [classLevel, setClassLevel] = useState('9')

  async function fetchRooms() {
    try {
      setLoading(true)
      setError('')

      const data = await getRooms()
      setRooms(data)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Gagal mengambil data kamar.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  function openAddForm() {
    setEditingRoom(null)
    setName('')
    setClassLevel('9')
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function openEditForm(room) {
    setEditingRoom(room)
    setName(room.name || '')
    setClassLevel(String(room.classLevel || 9))
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingRoom(null)
    setName('')
    setClassLevel('9')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const cleanName = name.trim()

    if (!cleanName) {
      setError('Nama kamar wajib diisi.')
      return
    }

    const duplicate = rooms.some(
      (room) =>
        room.name?.toLowerCase() === cleanName.toLowerCase() &&
        room.id !== editingRoom?.id
    )

    if (duplicate) {
      setError('Nama kamar tersebut sudah terdaftar.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const roomData = {
        name: cleanName,
        classLevel: Number(classLevel),
      }

      if (editingRoom) {
        await updateRoom(editingRoom.id, roomData)
        setSuccess('Data kamar berhasil diperbarui.')
      } else {
        await addRoom(roomData)
        setSuccess('Kamar baru berhasil ditambahkan.')
      }

      closeForm()
      await fetchRooms()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Gagal menyimpan data kamar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(room) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus kamar ${room.name}?`
    )

    if (!confirmed) return

    try {
      setError('')
      setSuccess('')

      await deleteRoom(room.id)

      setSuccess(`Kamar ${room.name} berhasil dihapus.`)
      await fetchRooms()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Gagal menghapus kamar.')
    }
  }

  return (
    <AdminLayout
      title="Manage Rooms"
      description="Kelola seluruh kamar peserta Cakratama Dormitory League."
    >
      <div className="content-stack">

        {/* HEADER */}
        <div className="admin-section-heading">
          <div>
            <h3>Room Management</h3>
            <p>Daftar kamar yang terdaftar di database CDL.</p>
          </div>

          <div className="room-action-group">
            <button
              className="button button-secondary"
              onClick={fetchRooms}
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
              Tambah Kamar
            </button>
          </div>
        </div>

        {/* NOTIFICATION */}
        {success && (
          <div className="room-success">
            {success}
          </div>
        )}

        {error && !showForm && (
          <div className="room-error">
            {error}
          </div>
        )}

        {/* FORM TAMBAH / EDIT */}
        {showForm && (
          <div className="panel room-form-panel">
            <div className="admin-table-heading">
              <div>
                <h3>
                  {editingRoom ? 'Edit Kamar' : 'Tambah Kamar Baru'}
                </h3>
                <p>
                  Masukkan informasi kamar peserta CDL.
                </p>
              </div>

              <button
                className="button button-secondary"
                onClick={closeForm}
                type="button"
              >
                <X size={16} />
                Tutup
              </button>
            </div>

            <form onSubmit={handleSubmit} className="room-form">
              <div className="room-form-field">
                <label htmlFor="roomName">Nama Kamar</label>
                <input
                  id="roomName"
                  type="text"
                  placeholder="Contoh: 3.1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="room-form-field">
                <label htmlFor="classLevel">Tingkat Kelas</label>
                <select
                  id="classLevel"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                >
                  <option value="7">Grade 7</option>
                  <option value="8">Grade 8</option>
                  <option value="9">Grade 9</option>
                </select>
              </div>

              {!editingRoom && (
                <p className="room-form-note">
                  Poin, anggota, dan kemenangan akan dimulai dari 0.
                </p>
              )}

              {error && (
                <div className="room-error">{error}</div>
              )}

              <div className="room-form-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={closeForm}
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
                    : editingRoom
                      ? 'Simpan Perubahan'
                      : 'Tambah Kamar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STATISTICS */}
        <div className="admin-stats">
          <div>
            <span>TOTAL ROOMS</span>
            <strong>{rooms.length}</strong>
          </div>

          <div>
            <span>GRADE 9</span>
            <strong>
              {rooms.filter((r) => Number(r.classLevel) === 9).length}
            </strong>
          </div>

          <div>
            <span>GRADE 8 & 7</span>
            <strong>
              {rooms.filter((r) =>
                [7, 8].includes(Number(r.classLevel))
              ).length}
            </strong>
          </div>
        </div>

        {/* TABLE */}
        <div className="panel">
          <div className="admin-table-heading">
            <div>
              <h3>All Rooms</h3>
              <p>{rooms.length} kamar ditemukan</p>
            </div>
          </div>

          {loading ? (
            <div className="admin-empty-state">
              Memuat data kamar...
            </div>
          ) : rooms.length === 0 ? (
            <div className="admin-empty-state">
              <DoorOpen size={32} />
              <strong>Belum ada kamar</strong>
              <p>Belum ada data kamar di Firestore.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ROOM</th>
                    <th>GRADE</th>
                    <th>MEMBERS</th>
                    <th>WINS</th>
                    <th>POINTS</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id}>
                      <td>
                        <div className="admin-room-name">
                          <span className="admin-room-icon">
                            <DoorOpen size={17} />
                          </span>
                          <strong>{room.name || room.id}</strong>
                        </div>
                      </td>

                      <td>Grade {room.classLevel ?? '-'}</td>
                      <td>{room.members ?? 0}</td>
                      <td>{room.wins ?? 0}</td>

                      <td>
                        <strong>
                          {(room.points ?? 0).toLocaleString('id-ID')}
                        </strong>
                      </td>

                      <td>
                        <Badge tone="green">Active</Badge>
                      </td>

                      <td>
                        <div className="room-row-actions">
                          <button
                            type="button"
                            className="room-icon-button"
                            title="Edit kamar"
                            onClick={() => openEditForm(room)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="room-icon-button room-delete-button"
                            title="Hapus kamar"
                            onClick={() => handleDelete(room)}
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

        <Link to="/rooms" className="back-link">
          ← Lihat halaman publik
        </Link>
      </div>
    </AdminLayout>
  )
}
