import { ArrowRight, Clock3, Target, X } from 'lucide-react'
import { mockNotices } from '@/data/mock-data'
import type { View } from '@/types'

type Props = { onClose: () => void; onGo: (v: View) => void }

export function NoticePanel({ onClose, onGo }: Props) {
  return (
    <>
      <button className="notice-backdrop" onClick={onClose} aria-label="Close notifications" />
      <aside className="notice-panel">
        <div className="section-head"><h3>Notifications</h3><button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        {mockNotices.map(n => (
          <div key={n.key} className={`notice-item ${n.unread ? 'unread' : ''}`}>
            <span>{n.icon === 'clock' ? <Clock3 size={17} /> : <Target size={17} />}</span>
            <div><strong>{n.title}</strong><p>{n.body}</p><small>{n.when}</small></div>
          </div>
        ))}
        <button className="text-btn" onClick={() => onGo('plans')}>Open my plan <ArrowRight size={15} /></button>
      </aside>
    </>
  )
}
