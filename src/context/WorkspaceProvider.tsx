import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { WorkspaceContext, type WorkspaceState } from './workspace-context'
import { money } from '@/lib/format'
import {
  initialActions,
  mockCashShape,
  seedBusiness,
  seedFinance,
  seedSettings,
} from '@/data/mock-data'
import type { Action, Business, CashPoint, Finance, Message, Settings } from '@/types'
import {
  breakEvenUnits,
  contributionPerUnit,
  grossMargin,
  grossProfit,
  operatingResult,
} from '@/lib/financial-engine'
import { useAudit } from './AuditContext'
import { useAuth } from './AuthContext'
import { useOrganization } from './OrganizationContext'
import { api } from '@/lib/api/client'

const loadJSON = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') || fallback
  } catch {
    return fallback
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { logEvent } = useAudit()
  const { user } = useAuth()
  const { organization } = useOrganization()
  void logEvent
  void user
  void organization
  const [actions, setActions] = useState<Action[]>(() => loadJSON('lumini-actions', initialActions))
  const [finance, setFinance] = useState<Finance>(() => loadJSON('lumini-finance', seedFinance))
  const [messages, setMessages] = useState<Message[]>([])
  const [business, setBusiness] = useState<Business>(seedBusiness)
  const [settings, setSettings] = useState<Settings>(seedSettings)
  const [chatLoading, setChatLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [newActionOpen, setNewActionOpen] = useState(false)
  const [newActionTitle, setNewActionTitle] = useState('')

  useEffect(() => { localStorage.setItem('lumini-actions', JSON.stringify(actions)) }, [actions])
  useEffect(() => { localStorage.setItem('lumini-finance', JSON.stringify(finance)) }, [finance])
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2800)
    return () => clearTimeout(t)
  }, [toast])

  const completed = actions.filter(a => a.done).length
  const gross = grossProfit(finance.revenue, finance.direct)
  const margin = grossMargin(finance.revenue, finance.direct)
  const operating = operatingResult(finance.revenue, finance.direct, finance.expenses)
  const contribution = contributionPerUnit(finance.price, finance.variable)
  const breakEvenRes = breakEvenUnits(finance.fixed, contribution)
  const breakEven = breakEvenRes.units
  const cashData: CashPoint[] = [...mockCashShape]

  const toggleAction = useCallback((id: number) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, done: !a.done } : a))
    setToast('Action updated')
  }, [])

  const removeAction = useCallback((id: number) => {
    setActions(prev => prev.filter(a => a.id !== id))
    setToast('Action removed')
  }, [])

  const addAction = useCallback((title: string, opts?: Partial<Action>) => {
    if (!title.trim()) return
    const a: Action = { id: Date.now(), title: title.trim(), area: opts?.area || 'General', due: opts?.due || new Date(Date.now()+86400000).toISOString().slice(0,10), done: false, impact: opts?.impact || 'medium', ...opts }
    setActions(prev => [a,...prev])
    setNewActionOpen(false)
    setNewActionTitle('')
    setToast('Action added')
  }, [])

  const addSuggestedAction = useCallback(() => {
    addAction('Review unit economics', { area: 'Finance', impact: 'high' })
  }, [addAction])

  const openNewAction = useCallback((title?: string) => { if (title) setNewActionTitle(title); setNewActionOpen(true) }, [])
  const closeNewAction = useCallback(() => setNewActionOpen(false), [])
  const submitNewAction = useCallback(() => { addAction(newActionTitle); setNewActionTitle('') }, [addAction, newActionTitle])

  const showToast = useCallback((message: string) => setToast(message), [])

  const sendMessage = useCallback(async (text: string) => {
    const question = text.trim()
    if (!question || chatLoading) return

    const userMsg: Message = {
      id: Date.now(),
      from: "user",
      text: question
    }

    setMessages(m => [...m, userMsg])
    setChatLoading(true)

    try {
      if (!organization?.id) {
        throw new Error("Please select or create a workspace before asking Lumini.")
      }

      const result = await api.post<{ summary?: string; error?: string }>(
        `/organizations/${organization.id}/ai/research`,
        {
          query: question,
          context: {
            business,
            finance,
            actions,
            metrics: {
              grossProfit: gross,
              grossMarginPercent: margin,
              operatingResult: operating,
              contributionPerUnit: contribution,
              breakEvenUnits: breakEven
            }
          }
        }
      )

      if (!result.summary?.trim()) {
        throw new Error(result.error || "Lumini returned an empty answer. Please try again.")
      }

      const reply: Message = {
        id: Date.now() + 1,
        from: "lumini",
        text: result.summary,
        calculations: [
          { label: "Gross profit", value: money(gross) },
          { label: "Gross margin", value: `${(margin * 100).toFixed(1)}%` },
          { label: "Operating result", value: money(operating) },
          { label: "Contribution/unit", value: money(contribution) },
          { label: "Break-even units", value: String(breakEven) }
        ]
      }

      setMessages(m => [...m, reply])
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "An unexpected error occurred."

      const reply: Message = {
        id: Date.now() + 1,
        from: "lumini",
        text: `I couldn't answer that just now. ${message}`
      }

      setMessages(m => [...m, reply])
    } finally {
      setChatLoading(false)
    }
  }, [
    chatLoading, organization?.id, business, finance, actions,
    gross, margin, operating, contribution, breakEven
  ])
  const exportCSV = useCallback(() => {
    const header = 'id,title,area,due,done,impact\n'
    const body = actions.map(a => `${a.id},"${a.title}",${a.area},${a.due},${a.done},${a.impact}`).join('\n')
    const blob = new Blob([header+body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'lumini-actions.csv'
    link.click()
    URL.revokeObjectURL(url)
    showToast('CSV exported')
  }, [actions, showToast])

  const exportJSON = useCallback(() => {
    const data = { business, finance, actions, messages }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'lumini-export.json'
    link.click()
    URL.revokeObjectURL(url)
    showToast('JSON exported')
  }, [business, finance, actions, messages, showToast])

  const exportPDF = useCallback(() => {
    const content = `Lumini Report\n\nBusiness: ${business.name}\nRevenue: ${finance.revenue}\nGross Profit: ${gross}\nGross Margin: ${(margin*100).toFixed(1)}%\nOperating Result: ${operating}\nBreak-even units: ${breakEven}\n\nActions: ${actions.length} (${completed} completed)\n`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'lumini-report.txt'
    link.click()
    URL.revokeObjectURL(url)
    showToast('Report exported')
  }, [business, finance, gross, margin, operating, breakEven, actions.length, completed, showToast])

  const generateReport = useCallback(() => {
    return `# Lumini Business Report\n\n## Business\n- Name: ${business.name}\n- Industry: ${business.industry}\n- Stage: ${business.stage}\n\n## Financials\n- Revenue: ${money(finance.revenue)}\n- Direct Costs: ${money(finance.direct)}\n- Gross Profit: ${money(gross)}\n- Gross Margin: ${(margin*100).toFixed(1)}%\n- Operating Expenses: ${money(finance.expenses)}\n- Operating Result: ${money(operating)}\n- Break-even Units: ${breakEven}\n\n## Actions\n- Total: ${actions.length}\n- Completed: ${completed}\n- Completion Rate: ${actions.length ? Math.round((completed/actions.length)*100) : 0}%\n`
  }, [business, finance, gross, margin, operating, breakEven, actions.length, completed])

  const restoreDemo = useCallback(() => {
    setActions(initialActions)
    setFinance(seedFinance)
    setBusiness(seedBusiness)
    setMessages([])
    setSettings(seedSettings)
    showToast('Demo restored')
  }, [showToast])

  const getEvidenceForMessage = useCallback((messageId: number) => {
    const m = messages.find(msg => msg.id === messageId)
    return m?.evidence || []
  }, [messages])

  const value: WorkspaceState = useMemo(() => ({
    actions, finance, messages, business, settings, chatLoading,
    setFinance, setBusiness, setSettings, setActions,
    completed, gross, margin, operating, contribution, breakEven, cashData,
    toggleAction, removeAction, addAction, addSuggestedAction, sendMessage, exportCSV, restoreDemo, showToast,
    newActionOpen, newActionTitle, setNewActionTitle, openNewAction, closeNewAction, submitNewAction,
    getEvidenceForMessage, exportPDF, exportJSON, generateReport,
  }), [actions, finance, messages, business, settings, chatLoading, completed, gross, margin, operating, contribution, breakEven, cashData, toggleAction, removeAction, addAction, addSuggestedAction, sendMessage, exportCSV, restoreDemo, showToast, newActionOpen, newActionTitle, openNewAction, closeNewAction, submitNewAction, getEvidenceForMessage, exportPDF, exportJSON, generateReport])

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}