import { createContext, useContext } from 'react'
import type { Action, Business, CashPoint, Finance, Message, Settings, EvidenceClaim } from '@/types'

export type WorkspaceState = {
  // state
  actions: Action[]
  finance: Finance
  messages: Message[]
  business: Business
  settings: Settings
  chatLoading: boolean
  // setters
  setFinance: React.Dispatch<React.SetStateAction<Finance>>
  setBusiness: React.Dispatch<React.SetStateAction<Business>>
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
  setActions: React.Dispatch<React.SetStateAction<Action[]>>
  // derived
  completed: number
  gross: number
  margin: number
  operating: number
  contribution: number
  breakEven: number
  cashData: CashPoint[]
  // commands
  toggleAction: (id: number) => void
  removeAction: (id: number) => void
  addAction: (title: string, opts?: Partial<Action>) => void
  addSuggestedAction: () => void
  sendMessage: (text: string) => void
  exportCSV: () => void
  restoreDemo: () => void
  showToast: (message: string) => void
  // new-action modal
  newActionOpen: boolean
  newActionTitle: string
  setNewActionTitle: (title: string) => void
  openNewAction: (title?: string) => void
  closeNewAction: () => void
  submitNewAction: () => void
  // explainability
  getEvidenceForMessage: (messageId: number) => EvidenceClaim[]
  // phase 4
  exportPDF: () => void
  exportJSON: () => void
  generateReport: () => string
}

export const WorkspaceContext = createContext<WorkspaceState | null>(null)

export function useWorkspace(): WorkspaceState {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used inside <WorkspaceProvider>')
  return ctx
}
