
import { useEffect, useState } from 'react'
import {
  Users,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
} from 'lucide-react'

import AdminLayout from '../components/layout/AdminLayout'
import Badge from '../components/common/Badge'

import { getRooms } from '../services/roomService'
import {
  getMembers,
  addMember,
  updateMember,
  deleteMember,
} from '../services/memberService'

export default function ManageMembers() {
  const [members, setMembers] = useState([])
  const [rooms, setRooms] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState(null)

  const [name, setName] = useState('')
  const [roomId, setRoomId] = useState('')

  async function fetchData() {
    try {
      setLoading(true)
      setError('')

      const [memberData, roomData] = await Promise.all([
        getMembers(),
        getRooms(),
      ])

      setMembers(memberData)
      setRooms(roomData)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Gagal mengambil data anggota.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  function openAddForm() {
    setEditingMember(null)
    setName('')
    setRoomId(rooms[0]?.id || '')
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function openEditForm(member) {
    setEditingMember(member)
    setName(member.name || '')
    setRoomId(member.roomId || '')
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingMember(null)
    setName('')
    setRoomId('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const cleanName = name.trim()

    if (!cleanName || !roomId) {
      setError('Nama anggota dan kamar wajib dipilih.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const memberData = {
        name: cleanName,
        roomId,
      }

      if (editingMember) {
        await updateMember(editingMember.id, memberData)
        setSuccess('Data anggota berhasil diperbarui.')
      } else {
        await addMember(memberData)
        setSuccess('Anggota baru berhasil ditambahkan.')
      }

      closeForm()
      await fetchData()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Gagal menyimpan data anggota.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(member) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus anggota ${member.name}?`
    )

    if (!confirmed) return

    try {
      setError('')
      setSuccess('')

      await deleteMember(member.id)

      setSuccess(`${member.name} berhasil dihapus.`)
      await fetchData()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Gagal menghapus anggota.')
    }
  }

  function getRoomName(id) {
    return rooms.find((room) => room.id === id)?.name || 'Kamar tidak ditemukan'
  }

  return (
    <AdminLayout
      title="Manage Members"
      description="Kelola anggota dan penempatan kamar peserta CDL."
    >
      <div className="content-stack">

        {/* HEADER */}
        <div className="admin-section-heading">
          <div>
            <h3>Member Management</h3>
            <p>Daftar seluruh anggota yang terdaftar di CDL.</p>
          </div>

          <div className="room-action-group">
            <button
              className="button button-secondary"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              className="button button-primary"
              onClick={openAddForm}
              disabled={rooms.length === 0}
            >
              <Plus size={16} />
              Tambah Anggota
            </button>
          </div>
        </div>

        {success && (
          <div className="room-success">{success}</div>
        )}

        {error && !showForm && (
          <div className="room-error">{error}</div>
        )}

        {/* FORM */}
        {showForm && (
          <div className="panel room-form-panel">
            <div className="admin-table-heading">
              <div>
                <h3>
                  {editingMember ? 'Edit Anggota' : 'Tambah Anggota Baru'}
                </h3>
                <p>Masukkan nama dan pilih kamar anggota.</p>
              </div>

              <button
                type="button"
                className="button button-secondary"
                onClick={closeForm}
              >
                <X size={16} />
                Tutup
              </button>
            </div>

            <form className="room-form" onSubmit={handleSubmit}>
              <div className="room-form-field">
                <label htmlFor="memberName">Nama Anggota</label>
                <input
                  id="memberName"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="room-form-field">
                <label htmlFor="memberRoom">Pilih Kamar</label>
                <select
                  id="memberRoom"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  required
                >
                  <option value="">Pilih kamar</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Kamar {room.name} — Grade {room.classLevel}
                    </option>
                  ))}
                </select>
              </div>

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
                    : editingMember
                      ? 'Simpan Perubahan'
                      : 'Tambah Anggota'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STATISTICS */}
        <div className="admin-stats">
          <div>
            <span>TOTAL MEMBERS</span>
            <strong>{members.length}</strong>
          </div>

          <div>
            <span>TOTAL ROOMS</span>
            <strong>{rooms.length}</strong>
          </div>

          <div>
            <span>UNASSIGNED</span>
            <strong>
              {members.filter((member) =>
                !rooms.some((room) => room.id === member.roomId)
              ).length}
            </strong>
          </div>
        </div>

        {/* TABLE */}
        <div className="panel">
          <div className="admin-table-heading">
            <div>
              <h3>All Members</h3>
              <p>{members.length} anggota ditemukan</p>
            </div>
          </div>

          {loading ? (
            <div className="admin-empty-state">
              Memuat data anggota...
            </div>
          ) : error && members.length === 0 ? (
            <div className="admin-empty-state">{error}</div>
          ) : members.length === 0 ? (
            <div className="admin-empty-state">
              <Users size={32} />
              <strong>Belum ada anggota</strong>
              <p>Tambahkan anggota pertama untuk memulai.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>NO.</th>
                    <th>NAME</th>
                    <th>ROOM</th>
                    <th>GRADE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>
                  {members.map((member, index) => {
                    const room = rooms.find(
                      (item) => item.id === member.roomId
                    )

                    return (
                      <tr key={member.id}>
                        <td>{index + 1}</td>

                        <td>
                          <div className="admin-room-name">
                            <span className="admin-room-icon">
                              <Users size={17} />
                            </span>
                            <strong>{member.name}</strong>
                          </div>
                        </td>

                        <td>{getRoomName(member.roomId)}</td>
                        <td>Grade {room?.classLevel ?? '-'}</td>

                        <td>
                          {room ? (
                            <Badge tone="green">Active</Badge>
                          ) : (
                            <Badge tone="red">Unassigned</Badge>
                          )}
                        </td>

                        <td>
                          <div className="room-row-actions">
                            <button
                              type="button"
                              className="room-icon-button"
                              title="Edit anggota"
                              onClick={() => openEditForm(member)}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              className="room-icon-button room-delete-button"
                              title="Hapus anggota"
                              onClick={() => handleDelete(member)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
