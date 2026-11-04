import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react'
import { loginAdmin } from '../firebase/auth'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await loginAdmin(email, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      console.error('Login Firebase gagal:', err)
      if (err.code === 'admin/not-admin') {
        setError('Login berhasil, tetapi akun ini belum memiliki akses admin.')
      } else if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'].includes(err.code)) {
        setError('Email atau password Firebase salah.')
      } else if (err.code === 'permission-denied' || err.code === 'firestore/permission-denied') {
        setError('Tidak dapat membaca admins/{uid}. Periksa Firestore Rules agar user dapat membaca dokumen admin miliknya.')
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Domain aplikasi belum diizinkan. Tambahkan localhost pada Authorized domains di Firebase Authentication.')
      } else if (err.message?.includes('Firebase belum dikonfigurasi')) {
        setError(err.message)
      } else {
        setError(err.message || 'Login gagal. Periksa konfigurasi Firebase dan koneksi internet.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <ShieldCheck size={30} />
        </div>

        <span className="login-label">CDL ADMINISTRATION</span>
        <h1>Welcome Back</h1>

        <p className="login-description">
          Login admin CDL menggunakan Firebase Authentication.
        </p>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>

          <div className="login-input">
            <Mail size={18} />
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Password</label>

          <div className="login-input">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Login to Dashboard'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <Link to="/" className="login-back">
          ← Kembali ke website CDL
        </Link>
      </div>
    </div>
  )
}