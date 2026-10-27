import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type AuditEvent = {
  id: string
  organizationId: string
  actorUserId: string
  action: string
  resourceType: string
  resourceId?: string
  timestamp: string
  metadata?: Record<string, any>
}

type AuditContextType = {
  events: AuditEvent[]
  logEvent: (event: Omit<AuditEvent, 'id' | 'timestamp'>) => void
  getEvents: (filters?: Partial<AuditEvent>) => AuditEvent[]
}

const AuditContext = createContext<AuditContextType | null>(null)

export function AuditProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AuditEvent[]>([])

  const logEvent = useCallback((event: Omit<AuditEvent, 'id' | 'timestamp'>) => {
    const newEvent: AuditEvent = {
      ...event,
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    }
    setEvents(prev => [newEvent, ...prev])
    console.log('[AUDIT]', newEvent.action, newEvent.resourceType)
  }, [])

  const getEvents = useCallback((filters?: Partial<AuditEvent>) => {
    if (!filters) return events
    return events.filter(e => {
      return Object.entries(filters).every(([key, value]) => e[key as keyof AuditEvent] === value)
    })
  }, [events])

  return (
    <AuditContext.Provider value={{ events, logEvent, getEvents }}>
      {children}
    </AuditContext.Provider>
  )
}

export function useAudit() {
  const ctx = useContext(AuditContext)
  if (!ctx) throw new Error('useAudit must be used inside <AuditProvider>')
  return ctx
}
