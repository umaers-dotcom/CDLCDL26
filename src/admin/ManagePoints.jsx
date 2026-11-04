
import { useEffect, useState } from 'react'

import AdminLayout from '../components/layout/AdminLayout'
import {
  addManualPoints,
  getPointData,
  savePointSettings,
} from '../services/pointService'
import { getRooms } from '../services/roomService'

export default function ManagePoints() {
  const [rooms, setRooms] = useState([])
  const [transactions, setTransactions] = useState([])
  const [winPoints, setWinPoints] = useState(3)

  const [roomId, setRoomId] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadData() {
    try {
      setLoading(true)
      setError('')

      const [roomData, pointData] = await Promise.all([getRooms(), getPointData()])
      setRooms(Array.isArray(roomData) ? roomData : [])
      setTransactions(pointData.transactions)
      setWinPoints(pointData.settings.winPoints ?? 3)
    } catch (err) {
      console.error('Gagal memuat data poin Firestore:', err)
      setError(err.message || 'Gagal mengambil data poin.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleSaveSettings(e) {
    e.preventDefault()
    setMessage('')
    setError('')

    const value = Number(winPoints)

    if (!Number.isSafeInteger(value) || value < 0) {
      setError('Poin kemenangan harus berupa bilangan bulat minimal 0.')
      return
    }

    try {
      setSaving(true)

      await savePointSettings(value)
      setMessage('Pengaturan poin berhasil disimpan.')
    } catch (err) {
      setError(err.message || 'Gagal menyimpan pengaturan.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddPoints(e) {
    e.preventDefault()
    setMessage('')
    setError('')

    const value = Number(amount)

    if (!roomId || !Number.isSafeInteger(value) || value === 0) {
      setError('Pilih kamar dan masukkan jumlah poin yang valid.')
      return
    }

    if (!reason.trim()) {
      setError('Alasan pemberian poin wajib diisi.')
      return
    }

    try {
      setSaving(true)

      await addManualPoints({
        roomId,
        amount: value,
        reason: reason.trim(),
      })

      setMessage('Poin kamar berhasil diperbarui.')

      setRoomId('')
      setAmount('')
      setReason('')

      await loadData()
    } catch (err) {
      setError(err.message || 'Gagal memperbarui poin.')
    } finally {
      setSaving(false)
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return '-'

    const date = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp)

    return date.toLocaleString('id-ID')
  }

  return (
    <AdminLayout
      title="Manage Points"
      description="Atur poin kemenangan, berikan poin manual, dan pantau riwayat transaksi."
    >
      {message && <div className="room-success">{message}</div>}
      {error && <div className="room-error">{error}</div>}

      <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
        <h3>Pengaturan Poin Kemenangan</h3>
        <p>Atur nilai poin default untuk kemenangan pertandingan.</p>

        <form onSubmit={handleSaveSettings}>
          <div className="room-form-field">
            <label>Poin untuk kemenangan</label>
            <input
              type="number"
              min="0"
              step="1"
              value={winPoints}
              onChange={(e) => setWinPoints(e.target.value)}
              required
            />
          </div>

          <button className="button" type="submit" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </form>
      </div>

      <div className="panel" style={{ padding: 24, marginBottom: 24 }}>
        <h3>Tambah / Kurangi Poin Manual</h3>
        <p>
          Masukkan jumlah positif untuk menambah poin atau negatif untuk
          mengurangi poin.
        </p>

        <form onSubmit={handleAddPoints} className="room-form">
          <div className="room-form-field">
            <label>Pilih Kamar</label>

            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
              disabled={loading || rooms.length === 0}
            >
              <option value="">
                {loading
                  ? 'Memuat daftar kamar...'
                  : rooms.length === 0
                    ? 'Belum ada kamar tersedia'
                    : 'Pilih kamar'}
              </option>

              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name || 'Kamar tanpa nama'}
                </option>
              ))}
            </select>

            {!loading && rooms.length === 0 && (
              <small>
                Data kamar belum berhasil dimuat. Coba klik Refresh Data.
              </small>
            )}
          </div>

          <div className="room-form-field">
            <label>Jumlah Poin (+ atau -)</label>
            <input
              type="number"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Contoh: 10 atau -5"
              required
            />
          </div>

          <div className="room-form-field">
            <label>Alasan</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Bonus kebersihan kamar"
              required
            />
          </div>

          <div className="room-form-actions">
            <button
              className="button"
              type="submit"
              disabled={saving || loading || rooms.length === 0}
            >
              {saving ? 'Memproses...' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>

      <div className="panel" style={{ padding: 24 }}>
        <div className="admin-table-heading">
          <h3>Riwayat Transaksi Poin</h3>

          <button
            className="button"
            type="button"
            onClick={loadData}
            disabled={loading}
          >
            {loading ? 'Memuat...' : 'Refresh Data'}
          </button>
        </div>

        {loading ? (
          <div className="empty-state">Memuat data...</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            Belum ada transaksi poin.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Kamar</th>
                  <th>Jumlah Poin</th>
                  <th>Jenis</th>
                  <th>Alasan</th>
                  <th>Tanggal</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.roomName || item.roomId}</td>
                    <td
                      style={{
                        fontWeight: 700,
                        color: item.amount >= 0 ? '#15803d' : '#dc2626',
                      }}
                    >
                      {item.amount > 0 ? '+' : ''}
                      {item.amount}
                    </td>
                    <td>{item.type || '-'}</td>
                    <td>{item.reason || '-'}</td>
                    <td>{formatDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
