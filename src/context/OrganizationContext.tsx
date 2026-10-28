
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { Organization, OrganizationMember } from '@/types'
import { api } from '@/lib/api/client'
import { useAuth } from './AuthContext'

type BackendOrganization = {
  id: string
  name: string
  plan: string
  role: OrganizationMember['role']
  status?: OrganizationMember['status']
  created_at?: string
}

type OrganizationListResponse = {
  organizations: BackendOrganization[]
}

type CreateOrganizationResponse = {
  organization: BackendOrganization
}

type OrgContextType = {
  organization: Organization | null
  members: OrganizationMember[]
  isLoading: boolean
  error: string | null
  createOrganization: (name: string) => Promise<void>
  inviteMember: (
    email: string,
    role: OrganizationMember['role'],
  ) => Promise<void>
  switchOrganization: (orgId: string) => void
}

const OrgContext = createContext<OrgContextType | null>(null)

const validPlans: Organization['plan'][] = [
  'free',
  'plus',
  'growth',
  'enterprise',
]

function toOrganization(item: BackendOrganization): Organization {
  const plan = validPlans.includes(item.plan as Organization['plan'])
    ? (item.plan as Organization['plan'])
    : 'free'

  return {
    id: item.id,
    name: item.name,
    plan,
    createdAt: item.created_at ?? '',
  }
}

function toMember(
  organizationId: string,
  userId: string,
  role: OrganizationMember['role'],
  status: OrganizationMember['status'] = 'active',
): OrganizationMember {
  return { organizationId, userId, role, status }
}

export function OrganizationProvider({
  children,
}: {
  children: ReactNode
}) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()

  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [backendOrganizations, setBackendOrganizations] = useState<BackendOrganization[]>([])
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadOrganizations = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setOrganizations([])
      setBackendOrganizations([])
      setOrganization(null)
      setMembers([])
      setLoadError(null)
      localStorage.removeItem('lumini_org')
      return
    }

    setIsLoading(true)
    setLoadError(null)

    try {
      const response =
        await api.get<OrganizationListResponse>('/organizations')

      const available = response.organizations.map(toOrganization)
      setBackendOrganizations(response.organizations)
      setOrganizations(available)

      const savedId = localStorage.getItem('lumini_org_id')
      const selected =
        available.find(item => item.id === savedId) ?? available[0] ?? null

      setOrganization(selected)

      if (selected) {
        localStorage.setItem('lumini_org_id', selected.id)

        const backendOrg = response.organizations.find(
          item => item.id === selected.id,
        )

        setMembers([
          toMember(
            selected.id,
            user.id,
            backendOrg?.role ?? 'read-only',
            backendOrg?.status ?? 'active',
          ),
        ])
      } else {
        setMembers([])
        localStorage.removeItem('lumini_org_id')
      }

      // Remove the old locally fabricated organisation object.
      localStorage.removeItem('lumini_org')
    } catch (error) {
      setOrganizations([])
      setBackendOrganizations([])
      setOrganization(null)
      setMembers([])
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Could not load your organisations.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (isAuthLoading) return
    void loadOrganizations()
  }, [isAuthLoading, loadOrganizations])

  const createOrganization = useCallback(async (name: string) => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      throw new Error('Please enter an organisation name.')
    }

    setIsLoading(true)
    setLoadError(null)

    try {
      const response = await api.post<CreateOrganizationResponse>(
        '/organizations',
        { name: trimmedName },
      )

      const created = toOrganization(response.organization)

      setOrganizations(previous => [...previous, created])
      setBackendOrganizations(previous => [
        ...previous.filter(item => item.id !== response.organization.id),
        response.organization,
])
      setOrganization(created)
      localStorage.setItem('lumini_org_id', created.id)

      if (user) {
        setMembers([
          toMember(
            created.id,
            user.id,
            response.organization.role ?? 'owner',
            'active',
          ),
        ])
      }
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Could not create the organisation.',
      )
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const switchOrganization = useCallback((orgId: string) => {
  const selected = organizations.find(item => item.id === orgId)
  if (!selected) return

  setOrganization(selected)
  localStorage.setItem('lumini_org_id', selected.id)

  const backendOrg = backendOrganizations.find(
    item => item.id === selected.id,
  )

  if (user && backendOrg) {
    setMembers([
      toMember(
        selected.id,
        user.id,
        backendOrg.role,
        backendOrg.status ?? 'active',
      ),
    ])
  } else {
    setMembers([])
  }
}, [organizations, backendOrganizations, user])

  const inviteMember = useCallback(async (
    _email: string,
    _role: OrganizationMember['role'],
  ) => {
    throw new Error(
      'Member invitations are not connected to the backend yet.',
    )
  }, [])
  return (
    <OrgContext.Provider
      value={{
        organization,
        members,
        isLoading: isLoading || isAuthLoading,
        error: loadError,
        createOrganization,
        inviteMember,
        switchOrganization,
      }}
    >
      {children}
    </OrgContext.Provider>
  )
}

export function useOrganization() {
  const ctx = useContext(OrgContext)

  if (!ctx) {
    throw new Error(
      'useOrganization must be used inside <OrganizationProvider>',
    )
  }

  return ctx
}
