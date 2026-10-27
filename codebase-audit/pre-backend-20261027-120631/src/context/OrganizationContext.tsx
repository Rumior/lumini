import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Organization, OrganizationMember } from '@/types'
import { useAuth } from './AuthContext'

type OrgContextType = {
  organization: Organization | null
  members: OrganizationMember[]
  isLoading: boolean
  createOrganization: (name: string) => Promise<void>
  inviteMember: (email: string, role: OrganizationMember['role']) => Promise<void>
  switchOrganization: (orgId: string) => void
}

const OrgContext = createContext<OrgContextType | null>(null)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user && !organization) {
      // Create default org for user
      const defaultOrg: Organization = {
        id: 'org_' + Date.now(),
        name: user.displayName + "'s Business",
        plan: 'free',
        createdAt: new Date().toISOString(),
      }
      setOrganization(defaultOrg)
      setMembers([{
        organizationId: defaultOrg.id,
        userId: user.id,
        role: 'owner',
        status: 'active',
      }])
      localStorage.setItem('lumini_org', JSON.stringify(defaultOrg))
    }
  }, [isAuthenticated, user, organization])

  const createOrganization = useCallback(async (name: string) => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 300))
    const org: Organization = {
      id: 'org_' + Date.now(),
      name,
      plan: 'free',
      createdAt: new Date().toISOString(),
    }
    setOrganization(org)
    if (user) {
      setMembers([{
        organizationId: org.id,
        userId: user.id,
        role: 'owner',
        status: 'active',
      }])
    }
    localStorage.setItem('lumini_org', JSON.stringify(org))
    setIsLoading(false)
  }, [user])

  const inviteMember = useCallback(async (email: string, role: OrganizationMember['role']) => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 300))
    // Mock invitation
    console.log('Invited', email, 'as', role)
    setIsLoading(false)
  }, [])

  const switchOrganization = useCallback((orgId: string) => {
    console.log('Switch to org', orgId)
  }, [])

  return (
    <OrgContext.Provider value={{ organization, members, isLoading, createOrganization, inviteMember, switchOrganization }}>
      {children}
    </OrgContext.Provider>
  )
}

export function useOrganization() {
  const ctx = useContext(OrgContext)
  if (!ctx) throw new Error('useOrganization must be used inside <OrganizationProvider>')
  return ctx
}
