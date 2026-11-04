import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { LogOut, ShieldCheck } from 'lucide-react'
import { logoutAdmin } from '../../firebase/auth'
export default function AdminLayout({ title, description, children }) {
  const navigate = useNavigate()
  const [logoutError, setLogoutError] = useState('')
  async function handleLogout() {
    try {
    await logoutAdmin()
    navigate('/login', { replace: true })
    } catch (error) {
    console.error('Logout Firebase gagal:', error)
    setLogoutError('Gagal keluar dari akun Firebase. Coba kembali.')
    }
  }

  return <div className="content-stack">
    <div className="admin-banner"><ShieldCheck size={20}/><div><strong>Admin workspace</strong><span>Login dan data CDL terhubung ke Firebase.</span></div><button className="button button-secondary" onClick={handleLogout}><LogOut size={15}/> Keluar</button></div>
    {logoutError && <div className="room-error">{logoutError}</div>}
    <div className="page-heading"><div><h2>{title}</h2><p>{description}</p></div><Link className="button button-secondary" to="/">Lihat website publik</Link></div>
    {children}
  </div>
}
