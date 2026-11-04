import { useMemo, useState } from 'react'
import { Users, Search } from 'lucide-react'
import Badge from '../components/common/Badge'
import useLeagueData from '../useLeagueData'

export default function Players() {
  const { members, rooms } = useLeagueData()
  const [search, setSearch] = useState('')
  const filteredMembers = useMemo(() => members.filter((member) => {
    const roomName = rooms.find((room) => room.id === member.roomId)?.name || ''
    return `${member.name} ${roomName}`.toLowerCase().includes(search.toLowerCase())
  }), [members, rooms, search])

  return (
    <div className="content-stack">
      <div className="page-heading">
        <div><h2>Players</h2><p>Direktori anggota dari seluruh kamar peserta.</p></div>
        <Badge>{members.length} Members</Badge>
      </div>
      <div className="panel">
        <div className="filter-bar">
          <div className="filter-group">
            <label htmlFor="player-search">SEARCH PLAYERS</label>
            <div className="search-box">
              <Search size={16}/>
              <input id="player-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nama atau kamar"/>
            </div>
          </div>
          <span className="filter-note">Showing {filteredMembers.length} members</span>
        </div>
        {filteredMembers.length ? (
          <div className="table-wrap">
            <table><thead><tr><th>NAME</th><th>ROOM</th><th>GRADE</th></tr></thead>
              <tbody>{filteredMembers.map((member) => {
                const room = rooms.find((item) => item.id === member.roomId)
                return <tr key={member.id}><td><strong>{member.name}</strong></td><td>{room ? `Room ${room.name}` : '-'}</td><td>{room ? `Grade ${room.classLevel}` : '-'}</td></tr>
              })}</tbody>
            </table>
          </div>
        ) : <div className="empty-state"><Users size={30}/><strong>Tidak ada anggota yang cocok</strong><p>Tambah atau ubah anggota melalui Admin Panel.</p></div>}
      </div>
    </div>
  )
}
