export type View = 'home' | 'mentor' | 'business' | 'finances' | 'plans' | 'insights' | 'settings'

export type User = {
  id: string
  email: string
  displayName: string
  firstName?: string
  initials?: string
  role?: string
}

export type AuthState = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export type Organization = {
  id: string
  name: string
  plan: 'free' | 'plus' | 'growth' | 'enterprise'
  createdAt: string
}

export type OrganizationMember = {
  organizationId: string
  userId: string
  role: 'owner' | 'admin' | 'finance' | 'manager' | 'adviser' | 'read-only'
  status: 'active' | 'invited' | 'suspended'
}

export type EvidenceType = 'user_reported' | 'imported_record' | 'externally_verified' | 'calculated' | 'model_estimate' | 'assumption' | 'unknown'

export type EvidenceClaim = {
  id: string
  claimType: EvidenceType
  text: string
  value?: unknown
  source?: string
  observedAt?: string
  confidence?: 'low' | 'medium' | 'high'
  expiresAt?: string
}

export type Action = {
  id: number
  title: string
  area: string
  due: string
  done: boolean
  impact: string
  reason?: string
  successMetric?: string
  baselineValue?: number
  targetValue?: number
  actualOutcome?: string
  completedAt?: string
  followUpDate?: string
  owner?: string
  estimatedCost?: number
  expectedResult?: string
  risk?: string
  relatedDecisionId?: string
}

export type Message = {
  id: number
  from: 'lumini' | 'user'
  text: string
  detail?: string
  evidence?: EvidenceClaim[]
  assumptions?: string[]
  calculations?: Array<{ label: string; value: string; formula?: string }>
  recommendations?: Array<{ title: string; why: string; firstAction?: string }>
  confidence?: 'low' | 'medium' | 'high'
}

export type Finance = {
  revenue: number
  direct: number
  expenses: number
  price: number
  variable: number
  fixed: number
}

export type Business = {
  name: string
  industry: string
  stage: string
  location: string
  customers: string
  model: string
  goal: string
}

export type Settings = {
  weekly: boolean
  actions: boolean
  research: boolean
  guided: boolean
}

export type CashPoint = {
  month: string
  actual: number | null
  forecast: number
}

export type BusinessProfile = {
  completeness: number
  goals: string[]
  constraints: string[]
  customerSegments: string[]
  productsServices: string[]
  hasCollectionPeriod: boolean
  lastReviewedAt?: string
}

export type QuestionnaireQuestion = {
  id: string
  prompt: string
  whyItMatters: string
  type: 'currency' | 'number' | 'percentage' | 'text' | 'select' | 'multiselect' | 'yesno'
  requiredFor?: string[]
  options?: string[]
  branchConditions?: Record<string, string[]>
}

export type QuestionnaireSession = {
  id: string
  businessId: string
  status: 'in_progress' | 'completed'
  answers: Record<string, unknown>
  startedAt: string
  completedAt?: string
}

export type HealthScore = {
  overall: number
  breakdown: {
    cash: number
    margin: number
    actions: number
    pipeline: number
  }
  level: 'critical' | 'needs-attention' | 'ok' | 'good'
  recommendations: string[]
}

export type TrendPoint = {
  month: string
  revenue: number
  expenses: number
  gross: number
}

export type Notification = {
  id: string
  type: 'warning' | 'info' | 'success'
  title: string
  message: string
  read: boolean
  createdAt: string
}

