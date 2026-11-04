import { Award, Sparkles } from 'lucide-react'
import useLeagueData from '../../useLeagueData'
export default function MVPCard() {
  const award = useLeagueData((state) => state.mvpAwards.find((item) => item.status === 'Published'))
  return <section className="mvp-card"><div className="mvp-top"><span className="mvp-icon"><Award size={20}/></span><span className="mvp-tag">WEEKLY AWARD</span></div><div className="mvp-placeholder"><Sparkles size={24}/></div><div><div className="mvp-kicker">{award?.title || 'MVP OF THE WEEK'}</div><h3>{award?.status === 'Published' ? award.memberName : 'Coming Soon'}</h3><p>{award?.status === 'Published' ? `${award.note} Room ${award.roomName || ''}` : 'MVP akan muncul setelah admin memublikasikan penghargaan.'}</p></div><div className="mvp-bottom">CAKRATAMA DORMITORY LEAGUE <span>2026/27</span></div></section>
}
