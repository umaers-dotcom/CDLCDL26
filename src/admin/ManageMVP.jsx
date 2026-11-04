import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import AdminLayout from '../components/layout/AdminLayout'
import { addAward, deleteAward } from '../services/awardService'
import useLeagueData from '../useLeagueData'

export default function ManageMVP() {
  const { members, rooms, mvpAwards } = useLeagueData()
  const [memberId, setMemberId] = useState('')
  const [title, setTitle] = useState('MVP of the Week')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('Published')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    try {
      await addAward({ memberId, title, note: note.trim(), status })
      setMemberId('')
      setNote('')
    } catch (submitError) {
      setError(submitError.message || 'Gagal menyimpan penghargaan.')
    }
  }

  async function handleDelete(id) {
    if (window.confirm('Hapus penghargaan ini?')) await deleteAward(id)
  }

  return (
    <AdminLayout title="Manage MVP & Awards" description="Pilih penerima penghargaan berdasarkan hasil dan kontribusi.">
      {error && <div className="room-error">{error}</div>}
      <div className="panel room-form-panel">
        <h3>Tambah penghargaan</h3>
        <form className="room-form" onSubmit={handleSubmit}>
          <div className="room-form-field">
            <label htmlFor="award-title">Kategori penghargaan</label>
            <select id="award-title" value={title} onChange={(event) => setTitle(event.target.value)}>
              {['MVP of the Week', 'Room of the Week', 'Most Consistent', 'Rising Star', 'Best Teamwork'].map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
          <div className="room-form-field">
            <label htmlFor="award-member">Penerima</label>
            <select id="award-member" value={memberId} onChange={(event) => setMemberId(event.target.value)} required>
              <option value="">Pilih anggota</option>
              {members.map((member) => {
                const room = rooms.find((item) => item.id === member.roomId)
                return <option key={member.id} value={member.id}>{member.name}{room ? ` — Room ${room.name}` : ''}</option>
              })}
            </select>
          </div>
          <div className="room-form-field">
            <label htmlFor="award-note">Catatan</label>
            <input id="award-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Kontribusi penerima"/>
          </div>
          <div className="room-form-field">
            <label htmlFor="award-status">Status</label>
            <select id="award-status" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="Published">Published</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <button className="button button-primary" type="submit">Simpan penghargaan</button>
        </form>
      </div>
      <div className="panel">
        <div className="admin-table-heading"><h3>Penghargaan</h3><span>{mvpAwards.length} awards</span></div>
        {mvpAwards.length ? <div className="table-wrap"><table><thead><tr><th>KATEGORI</th><th>PENERIMA</th><th>STATUS</th><th>AKSI</th></tr></thead><tbody>
          {mvpAwards.map((award) => <tr key={award.id}><td>{award.title}</td><td>{award.memberName} {award.roomName ? `· Room ${award.roomName}` : ''}</td><td>{award.status}</td><td><button className="button button-secondary" onClick={() => handleDelete(award.id)} aria-label={`Hapus ${award.title}`}><Trash2 size={15}/> Hapus</button></td></tr>)}
        </tbody></table></div> : <div className="empty-state">Belum ada penghargaan.</div>}
      </div>
    </AdminLayout>
  )
}
