import { useEffect, useMemo, useState } from 'react'
import { Bell, ChevronRight, Download, LogOut, Menu, Search, UserRound } from 'lucide-react'
import { useLocation } from 'react-router'
import { viewFromPath, viewTitle } from '@/config/navigation'
import { mockUser, mockWorkspace } from '@/data/mock-data'
import { useWorkspace } from '@/context/workspace-context'
import type { View } from '@/types'
import { generateNotifications } from '@/lib/notifications'
import { useAuth } from '@/context/AuthContext'

type Props = {
  onMenu: () => void
  onSearch: () => void
  onNotices: () => void
  onGo: (v: View) => void
}

export function Topbar({ onMenu, onSearch, onGo }: Props) {
  const { business, exportCSV, finance, actions } = useWorkspace()
  const { logout, user } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [noticesOpen, setNoticesOpen] = useState(false)
  const view = viewFromPath(useLocation().pathname)
  const notifications = useMemo(() => generateNotifications(finance, actions), [finance, actions])
  const unread = notifications.filter(n => !n.read).length
  const displayUser: any = user || mockUser
  const displayName = displayUser.displayName || displayUser.fullName || displayUser.firstName || ''

  useEffect(() => {
    if (!profileOpen && !noticesOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setProfileOpen(false); setNoticesOpen(false) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [profileOpen, noticesOpen])

  const handleLogout = async () => {
    setProfileOpen(false)
    try {
      await logout()
    } catch {}
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn menu-trigger" onClick={onMenu} aria-label="Open menu"><Menu size={21} /></button>
        <span className="crumb">{mockWorkspace.label}</span><ChevronRight size={13} /><strong>{viewTitle[view]}</strong>
      </div>
      <div className="topbar-actions">
        <button className="search-trigger" onClick={onSearch}><Search size={17} /><span>Search workspace</span><kbd>⌘ K</kbd></button>
        <div className="relative">
          <button className="icon-btn notice-btn" onClick={() => setNoticesOpen(o => !o)} aria-label="Notifications">
            <Bell size={19} />
            {unread > 0 && <i />}
          </button>
          {noticesOpen && (
            <div className="profile-menu" style={{right:0, minWidth:'280px'}}>
              <strong>Notifications</strong>
              {notifications.slice(0,5).map(n => (
                <div key={n.id} style={{padding:'0.5rem 0', borderBottom:'1px solid var(--border)'}}>
                  <div style={{fontWeight:600}}>{n.title}</div>
                  <div style={{fontSize:'0.875rem', color:'var(--muted-foreground)'}}>{n.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="profile-wrap">
          <button className="avatar" onClick={() => setProfileOpen(o => !o)} aria-label="Open profile menu">{displayUser.initials}</button>
          {profileOpen && (
            <div className="profile-menu">
              <strong>{displayName}</strong>
              <span>{displayUser.role || 'Owner'} · {business.name}</span>
              <button onClick={() => { onGo('settings'); setProfileOpen(false) }}><UserRound size={15} />Account settings</button>
              <button onClick={() => { exportCSV(); setProfileOpen(false) }}><Download size={15} />Export my data</button>
              <button onClick={handleLogout}><LogOut size={15} />Log out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}