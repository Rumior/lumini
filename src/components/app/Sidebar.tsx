import { ChevronDown, ChevronRight, Clock3, Settings as SettingsIcon, ShieldCheck, X } from 'lucide-react'
import { useLocation } from 'react-router'
import { Logo } from './Logo'
import { nav, viewFromPath } from '@/config/navigation'
import { mockDates, mockWorkspace } from '@/data/mock-data'
import { useWorkspace } from '@/context/workspace-context'
import type { View } from '@/types'

type Props = { open: boolean; onClose: () => void; onGo: (v: View) => void }

export function Sidebar({ open, onClose, onGo }: Props) {
  const { business, actions } = useWorkspace()
  const view = viewFromPath(useLocation().pathname)

  return (
    <aside className={`sidebar ${open ? 'mobile-open' : ''}`}>
      <div className="sidebar-top">
        <Logo />
        <button className="icon-btn mobile-close" onClick={onClose} aria-label="Close menu"><X size={20} /></button>
      </div>
      <button className="business-switch" onClick={() => onGo('business')}>
        <span className="business-monogram">{mockWorkspace.monogram}</span>
        <span><strong>{business.name}</strong><small>{mockWorkspace.stageLabel}</small></span>
        <ChevronDown size={15} />
      </button>
      <nav className="main-nav" aria-label="Main navigation">
        <p className="nav-label">WORKSPACE</p>
        {nav.map(n => (
          <button key={n.id} className={view === n.id ? 'active' : ''} onClick={() => onGo(n.id)}>
            <n.icon size={18} strokeWidth={1.6} /><span>{n.label}</span>
            {n.id === 'plans' && <em>{actions.filter(a => !a.done).length}</em>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="review-note">
          <span className="review-icon"><Clock3 size={16} /></span>
          <p>Monthly review<small>{mockDates.monthlyReviewDay}</small></p>
          <button onClick={() => onGo('insights')} aria-label="Open monthly review"><ChevronRight size={16} /></button>
        </div>
        <button className={`settings-link ${view === 'settings' ? 'active' : ''}`} onClick={() => onGo('settings')}>
          <SettingsIcon size={18} /><span>Settings</span>
        </button>
        <div className="privacy-line"><ShieldCheck size={14} /><span>Your business, kept private</span></div>
      </div>
    </aside>
  )
}
