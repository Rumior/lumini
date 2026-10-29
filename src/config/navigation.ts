import { BarChart3, Building2, CircleDollarSign, Home, LayoutDashboard, MessageSquareText, Target } from 'lucide-react'
import type { View } from '@/types'

export const routePaths: Record<View, string> = {
  home: '/',
  mentor: '/mentor',
  business: '/business',
  finances: '/finances',
  'finance-os': '/finance-os',
  plans: '/plans',
  insights: '/insights',
  settings: '/settings',
}

export const viewTitle: Record<View, string> = {
  home: 'Overview',
  mentor: 'Ask Lumini',
  business: 'My business',
  finances: 'Financial studio',
  'finance-os': 'Finance OS',
  plans: 'Plans & actions',
  insights: 'Insights',
  settings: 'Settings',
}

export const nav = [
  { id: 'home' as View, label: 'Overview', icon: Home },
  { id: 'mentor' as View, label: 'Ask Lumini', icon: MessageSquareText },
  { id: 'business' as View, label: 'My business', icon: Building2 },
  { id: 'finances' as View, label: 'Finances', icon: CircleDollarSign },
  { id: 'finance-os' as View, label: 'Finance OS', icon: LayoutDashboard },
  { id: 'plans' as View, label: 'Plans & actions', icon: Target },
  { id: 'insights' as View, label: 'Insights', icon: BarChart3 },
]

export function viewFromPath(pathname: string): View {
  const match = (Object.entries(routePaths) as [View, string][]).find(([, p]) => p === pathname)
  return match ? match[0] : 'home'
}
