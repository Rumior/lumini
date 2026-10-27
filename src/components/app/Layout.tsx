import { useCallback, useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { SearchModal } from './SearchModal'
import { NoticePanel } from './NoticePanel'
import { NewActionModal } from './NewActionModal'
import { routePaths } from '@/config/navigation'
import { useWorkspace } from '@/context/workspace-context'
import type { View } from '@/types'

export function Layout() {
  const navigate = useNavigate()
  const { closeNewAction } = useWorkspace()
  const [mobileNav, setMobileNav] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [noticesOpen, setNoticesOpen] = useState(false)

  // Navigate and close any open overlays.
  const go = useCallback((v: View) => {
    navigate(routePaths[v])
    setMobileNav(false)
    setSearchOpen(false)
    setNoticesOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [navigate])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false); setNoticesOpen(false); setMobileNav(false); closeNewAction()
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeNewAction])

  return (
    <div className="app-shell">
      <Sidebar open={mobileNav} onClose={() => setMobileNav(false)} onGo={go} />
      {mobileNav && <button className="nav-backdrop" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
      <main className="main-area">
        <Topbar onMenu={() => setMobileNav(true)} onSearch={() => setSearchOpen(true)} onNotices={() => setNoticesOpen(o => !o)} onGo={go} />
        <div className="page-content"><Outlet /></div>
      </main>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} onGo={go} />}
      {noticesOpen && <NoticePanel onClose={() => setNoticesOpen(false)} onGo={go} />}
      <NewActionModal />
    </div>
  )
}
