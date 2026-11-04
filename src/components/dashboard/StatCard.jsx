export default function StatCard({ label, value, note, icon: Icon, color = 'blue' }) {
  return <div className="stat-card"><div className={`stat-icon ${color}`}><Icon size={20}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>
}
