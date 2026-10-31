import "katex/dist/katex.min.css";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from './lib/supabase'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight, BarChart3, Bell, BookOpen,
  Building2, Calculator, Check, CheckCircle2, ChevronDown,
  Circle, Clock3, Download, Home, Menu, MessageSquareText, Plus, Search, Settings, ShieldCheck, Sparkles,
  Target, TrendingUp, UserRound, X, Send, SlidersHorizontal, Trash2,
  LockKeyhole, Database, Eye, CircleDollarSign
} from 'lucide-react'
import './App.css'
import './components/insights/insights-page.css'
import InsightsPage from './components/insights/InsightsPage'
import { starterLibrary } from './components/insights/insights.starter-library'
import type { Insight } from './components/insights/insights.types'
import HomePage from './pages/HomePage'
import { useHomePageData } from './hooks/useHomePageData'
import { HomeSearch } from './components/home/HomeSections'

type View = 'home' | 'mentor' | 'business' | 'finances' | 'plans' | 'insights' | 'settings'
type Action = { id: number; title: string; area: string; due: string; done: boolean; impact: string }
type Message = { id: number; from: 'lumini' | 'user'; text: string; detail?: string }
type Finance = { revenue: number; direct: number; expenses: number; price: number; variable: number; fixed: number }

const nav = [
  { id: 'home' as View, label: 'Overview', icon: Home },
  { id: 'mentor' as View, label: 'Ask Lumini', icon: MessageSquareText },
  { id: 'business' as View, label: 'My business', icon: Building2 },
  { id: 'finances' as View, label: 'Finances', icon: CircleDollarSign },
  { id: 'plans' as View, label: 'Plans & actions', icon: Target },
  { id: 'insights' as View, label: 'Insights', icon: BarChart3 },
  { id: 'settings' as View, label: 'Settings', icon: Settings },
]
const initialActions: Action[] = [
  { id: 1, title: 'Call 5 customers about delivery experience', area: 'Customer insight', due: 'Today', done: false, impact: 'High impact' },
  { id: 2, title: 'Review supplier terms for top 3 materials', area: 'Cost control', due: '28 Oct', done: false, impact: 'KSh 12k potential' },
  { id: 3, title: 'Update October cash collection forecast', area: 'Financial health', due: '30 Oct', done: false, impact: 'Reduce risk' },
  { id: 4, title: 'Document the weekly stock-count routine', area: 'Operations', due: '02 Nov', done: true, impact: 'Completed' },
]
const initialMessages: Message[] = [
  { id: 1, from: 'lumini', text: "Good morning, Amara. I've reviewed your latest figures. Your gross margin is healthy at 35%, but cash timing deserves attention before you pursue more sales.", detail: 'Based on your September figures | User reported, not audited' },
]
const seedFinance: Finance = { revenue: 300000, direct: 195000, expenses: 75000, price: 2500, variable: 1625, fixed: 75000 }

const money = (n: number) => `KSh ${Math.round(n).toLocaleString('en-KE')}`

function EvidenceTag({ children, tone = '' }: { children: React.ReactNode; tone?: string }) {
  return <span className={`evidence-tag ${tone}`}><span />{children}</span>
}

function App() {
  const homeData = useHomePageData()
  const [view, setView] = useState<View>('home')
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false)
  const [financeOsHeight, setFinanceOsHeight] = useState(1500)
  const [actions, setActions] = useState<Action[]>(() => {
    try { return JSON.parse(localStorage.getItem('lumini-actions') || 'null') || initialActions } catch { return initialActions }
  })
  const [finance, setFinance] = useState<Finance>(() => {
    try { return JSON.parse(localStorage.getItem('lumini-finance') || 'null') || seedFinance } catch { return seedFinance }
  })
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [newActionOpen, setNewActionOpen] = useState(false)
  const [actionTitle, setActionTitle] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [noticesOpen, setNoticesOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [planFilter, setPlanFilter] = useState('Active')
  const [business, setBusiness] = useState({ name: 'Amani Home & Living', industry: 'Retail & homeware', stage: 'Established', location: 'Nairobi, Kenya', customers: 'Design-conscious urban homeowners', model: 'Direct-to-consumer retail', goal: 'Improve cash resilience while protecting our 35% gross margin.' })
  const [settings, setSettings] = useState({ weekly: true, actions: true, research: false, guided: true })
  const chatEnd = useRef<HTMLDivElement>(null)

  useEffect(() => { localStorage.setItem('lumini-actions', JSON.stringify(actions)) }, [actions])
  useEffect(() => { localStorage.setItem('lumini-finance', JSON.stringify(finance)) }, [finance])
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, chatLoading])
  useEffect(() => {
    const onFinanceOSHeight = (event: MessageEvent) => {
      if (event.data?.type === 'lumini-finance-os-height' && Number.isFinite(event.data.height)) {
        setFinanceOsHeight(Math.max(900, Math.min(3200, Number(event.data.height) + 8)))
      }
    }
    window.addEventListener('message', onFinanceOSHeight)
    return () => window.removeEventListener('message', onFinanceOSHeight)
  }, [])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2800); return () => clearTimeout(t) }, [toast])
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setNewActionOpen(false); setNoticesOpen(false); setProfileOpen(false); setWorkspaceMenuOpen(false) }
    }
    window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn)
  }, [])

  const go = (v: View) => { setView(v); setSearchOpen(false); setSearch(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const completed = actions.filter(a => a.done).length
  const gross = finance.revenue - finance.direct
  const margin = finance.revenue ? gross / finance.revenue * 100 : 0
  const operating = gross - finance.expenses
  const insightsData: Insight[] = [
    {
      id: 'gross-margin',
      title: 'Protect gross margin while testing growth',
      summary: `Current gross margin is ${margin.toFixed(1)}%, calculated from revenue less direct costs. Test changes in small steps and monitor both sales and contribution.`,
      category: 'Financial health',
      priority: margin < 25 ? 'high' : 'medium',
      evidenceKind: 'calculated',
      periodLabel: 'September 2026',
      whyItMatters: 'Revenue growth is less useful if the cost of delivering each sale rises at the same time.',
      evidence: [
        {
          label: `Revenue: ${money(finance.revenue)}`,
          kind: 'reported',
          explanation: 'Value currently stored in the workspace financial inputs.',
          support: 'direct'
        },
        {
          label: `Direct costs: ${money(finance.direct)}`,
          kind: 'reported',
          explanation: 'Value currently stored in the workspace financial inputs.',
          support: 'direct'
        },
        {
          label: `Gross profit: ${money(gross)}`,
          kind: 'calculated',
          explanation: 'Revenue minus direct costs.',
          support: 'direct'
        }
      ],
      calculations: [
        `Gross profit = ${money(finance.revenue)} - ${money(finance.direct)} = ${money(gross)}.`,
        `Gross margin = gross profit / revenue x 100 = ${margin.toFixed(1)}%.`
      ],
      recommendation: {
        action: 'Run one controlled pricing or retention experiment before making a wider change.',
        rationale: 'A measured test makes it easier to see whether the change improves contribution without unnecessarily disrupting demand.',
        expectedBenefit: 'Clearer evidence about margin and customer response.',
        costEffort: 'Low to moderate; depends on the chosen experiment.',
        risks: ['Customers may respond differently across product or customer segments.'],
        unknowns: ['Competitor prices and customer price sensitivity have not been verified.'],
        firstStep: 'Choose one product or customer segment and record its current sales and contribution.',
        successMeasure: 'Compare gross profit, sales volume and conversion with the baseline.',
        reviewTiming: 'Review after an agreed test period.'
      },
      relatedResourceIds: ['starter-pricing', 'starter-breakeven']
    },
    {
      id: 'cash-visibility',
      title: 'Build a forward-looking cash view',
      summary: `The workspace shows an operating result of ${money(operating)}, but this does not establish how much cash is available or when payments fall due.`,
      category: 'Cash and working capital',
      priority: 'high',
      evidenceKind: 'unknown',
      periodLabel: 'September 2026',
      whyItMatters: 'A profitable business can still experience a cash shortfall when customer receipts arrive after supplier or operating payments are due.',
      evidence: [
        {
          label: `Operating result: ${money(operating)}`,
          kind: 'calculated',
          explanation: 'Gross profit minus the operating expenses entered in the workspace. This is not a cash balance.',
          support: 'direct'
        },
        {
          label: 'Customer collection timing',
          kind: 'unknown',
          explanation: 'Average collection period and expected receipt dates have not been supplied.',
          support: 'direct'
        },
        {
          label: 'Upcoming payments and available cash',
          kind: 'unknown',
          explanation: 'Opening cash, supplier due dates, loan repayments and other payment dates are needed for a cash forecast.',
          support: 'direct'
        }
      ],
      calculations: [
        `Operating result = gross profit - operating expenses = ${money(gross)} - ${money(finance.expenses)} = ${money(operating)}.`,
        'A cash forecast cannot be calculated reliably without opening cash, dated receipts and dated payments.'
      ],
      recommendation: {
        action: 'Create a 13-week cash forecast and update it weekly.',
        rationale: 'The forecast separates when money moves from the profit shown in the financial summary.',
        expectedBenefit: 'Earlier visibility of potential cash gaps and payment pressure.',
        costEffort: 'Moderate; requires collecting payment dates and estimates.',
        risks: ['Forecasts will be less reliable where payment dates are uncertain.'],
        unknowns: ['Opening cash, customer payment dates, supplier terms and other committed payments.'],
        firstStep: 'Record the current available bank and cash balances, then list expected receipts and payments by week.',
        successMeasure: 'A weekly closing cash estimate with assumptions and actual variances recorded.',
        reviewTiming: 'Update weekly.'
      },
      relatedResourceIds: ['starter-cash-13wk', 'starter-collect']
    },
    {
      id: 'customer-evidence',
      title: 'Collect evidence before expanding customer spend',
      summary: 'The workspace contains an open customer-feedback action, but it does not yet provide verified retention rates or repeat-purchase results.',
      category: 'Customer momentum',
      priority: 'medium',
      evidenceKind: 'unknown',
      whyItMatters: 'Customer feedback can help identify whether delivery, product selection or follow-up deserves attention before additional spending is committed.',
      evidence: [
        {
          label: 'Customer feedback and repeat-purchase results',
          kind: 'unknown',
          explanation: 'No verified survey results or repeat-purchase rate are currently mapped into this Insights view.',
          support: 'direct'
        },
        {
          label: 'Customer feedback action',
          kind: 'reported',
          explanation: 'The workspace action list includes a task to contact five customers about delivery experience.',
          support: 'context'
        }
      ],
      recommendation: {
        action: 'Speak with five recent customers and record recurring feedback themes.',
        rationale: 'A small, direct feedback exercise can identify issues to investigate before a larger marketing or retention commitment.',
        expectedBenefit: 'A clearer list of customer problems and possible follow-up tests.',
        costEffort: 'Low; depends on customer availability.',
        unknowns: ['Whether the feedback will represent the wider customer base.'],
        firstStep: 'Complete the existing customer-call action and record responses consistently.',
        successMeasure: 'Five recorded conversations and a summary of recurring themes.',
        reviewTiming: 'Review the findings within seven days.'
      }
    }
  ]

  const sendMessage = async (preset?: string) => {
    const text = (preset ?? chatInput).trim()

    if (!text || chatLoading) return

    const previousMessages = messages.slice(-10)

    setMessages(current => [
      ...current,
      { id: Date.now(), from: 'user', text }
    ])

    setChatInput('')
    setChatLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke(
        'lumini-mentor',
        {
          body: {
            message: text,
            history: previousMessages.map(item => ({
              role: item.from === 'user' ? 'user' : 'assistant',
              text: item.text,
            })),
            context: {
              business,
              financials: {
                ...finance,
                grossProfit: finance.revenue - finance.direct,
                grossMarginPercent: finance.revenue
                  ? ((finance.revenue - finance.direct) / finance.revenue) * 100
                  : null,
                operatingResult:
                  finance.revenue - finance.direct - finance.expenses,
                contributionPerUnit: finance.price - finance.variable,
              },
            },
          },
        }
      )

      if (error) throw error

      if (!data || typeof data.answer !== 'string' || !data.answer.trim()) {
        throw new Error('The AI service returned an empty answer.')
      }

      setMessages(current => [
        ...current,
        {
          id: Date.now() + 1,
          from: 'lumini',
          text: data.answer,
          detail: 'AI-generated advice based on the context provided',
        },
      ])
    } catch (error) {
      console.error('Lumini mentor request failed:', error)

      setMessages(current => [
        ...current,
        {
          id: Date.now() + 1,
          from: 'lumini',
          text: 'I could not connect to the AI mentor just now. Please check your connection and try again.',
          detail: 'The request failed; no new advice was generated.',
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }
  const toggleAction = (id: number) => setActions(a => a.map(x => {
    if (x.id !== id) return x
    const activeImpact = x.area === 'Customer insight' ? 'High impact' : x.area === 'Cost control' ? 'KSh 12k potential' : x.area === 'Financial health' ? 'Reduce risk' : x.area === 'Operations' ? 'Improve consistency' : 'User added'
    return { ...x, done: !x.done, impact: !x.done ? 'Completed' : activeImpact }
  }))
  const addAction = () => {
    if (!actionTitle.trim()) return
    setActions(a => [...a, { id: Date.now(), title: actionTitle.trim(), area: 'My priority', due: '07 Nov', done: false, impact: 'User added' }])
    setActionTitle(''); setNewActionOpen(false); setToast('Action added to your plan')
  }
  const exportCSV = () => {
    const rows = [['Metric', 'Value', 'Period'], ['Revenue', finance.revenue, 'September 2026'], ['Direct costs', finance.direct, 'September 2026'], ['Gross profit', gross, 'September 2026'], ['Gross margin', `${margin.toFixed(1)}%`, 'September 2026'], ['Operating result', operating, 'September 2026']]
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'lumini-financial-summary.csv'; a.click(); URL.revokeObjectURL(url); setToast('Financial summary exported')
  }
  const searchItems = [...nav.map(n => ({ title: n.label, sub: 'Navigate', view: n.id })), { title: 'Pricing & break-even', sub: 'Financial tool', view: 'finances' as View }, { title: 'Cash collection forecast', sub: 'Current action', view: 'plans' as View }, { title: 'September financial health', sub: 'Report', view: 'insights' as View }]
  const searchResults = searchItems.filter(x => `${x.title} ${x.sub}`.toLowerCase().includes(search.toLowerCase()))

  return <div className="app-shell">
    <main className="main-area">
      <header className="lh-top lh-global-top">
        <HomeSearch data={homeData} />

        <div className="lh-global-actions">
          <div className="lh-nav-dropdown">
            <button
              type="button"
              className="lh-nav-trigger"
              aria-expanded={workspaceMenuOpen}
              aria-haspopup="true"
              onClick={() => setWorkspaceMenuOpen(open => !open)}
            >
              <Menu size={18} />
              <span>Workspace</span>
              <ChevronDown size={16} />
            </button>

            {workspaceMenuOpen && (
              <div className="lh-nav-menu" role="menu">
                {nav.map(n => (
                  <button
                    type="button"
                    key={n.id}
                    role="menuitem"
                    className={view === n.id ? 'active' : ''}
                    onClick={() => {
                      go(n.id);
                      setWorkspaceMenuOpen(false);
                    }}
                  >
                    <n.icon size={17} />
                    <span>{n.label}</span>
                    {n.id === 'plans' && (
                      <em>{actions.filter(a => !a.done).length}</em>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="lh-bell"
            onClick={() => setNoticesOpen(open => !open)}
            aria-label="Notifications"
          >
            <Bell size={19} />
          </button>

          <div className="profile-wrap">
            <button
              className="avatar"
              onClick={() => setProfileOpen(open => !open)}
              aria-label="Open profile menu"
            >
              AO
            </button>

            {profileOpen && (
              <div className="profile-menu">
                <strong>Amara Otieno</strong>
                <span>Owner | Amani Home & Living</span>
                <button onClick={() => {
                  go('settings');
                  setProfileOpen(false);
                }}>
                  <UserRound size={15} />Account settings
                </button>
                <button onClick={() => {
                  exportCSV();
                  setProfileOpen(false);
                }}>
                  <Download size={15} />Export my data
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={view === 'home' ? 'page-content home-content' : 'page-content'}>
        {view === 'home' && <HomePage data={homeData} />}

        {view === 'mentor' && <section className="view mentor-view">
          <div className="page-heading compact"><div><p className="date-line">YOUR BUSINESS MENTOR</p><h1>Think it through, together.</h1><p>Advice grounded in your numbers, your context, and what is still unknown.</p></div><EvidenceTag>Context connected</EvidenceTag></div>
          <div className="mentor-layout">
            <div className="conversation">
              <div className="conversation-context"><Database size={15} /><span>Using September financials, business profile & active goals</span><button onClick={() => go('business')}>Inspect context</button></div>
              <div className="messages">{messages.map(m => <div className={`message ${m.from}`} key={m.id}>{m.from === 'lumini' && <span className="mentor-seal"><Sparkles size={16} /></span>}<div><div className="markdown-body">
  {m.from === 'lumini' ? (
    <ReactMarkdown
  remarkPlugins={[remarkGfm, remarkMath]}
  rehypePlugins={[rehypeKatex]}
>
      {m.text}
    </ReactMarkdown>
  ) : (
    <p>{m.text}</p>
  )}
</div>{m.detail && <small><BookOpen size={13} />{m.detail}</small>}{m.from === 'lumini' && m.id !== 1 && <button className="message-action" onClick={() => { setActionTitle(m.text.split('.')[0]); setNewActionOpen(true) }}><Plus size={14} />Turn into an action</button>}</div></div>)}{chatLoading && <div className="message lumini"><span className="mentor-seal"><Sparkles size={16} /></span><div className="thinking"><i /><i /><i /><span>Reviewing your business context</span></div></div>}<div ref={chatEnd} /></div>
              <div className="prompt-chips">{['What should I do next?', 'Why is cash tight?', 'Should I change my pricing?'].map(p => <button key={p} onClick={() => sendMessage(p)}>{p}</button>)}</div>
              <form className="chat-form" onSubmit={e => { e.preventDefault(); sendMessage() }}><textarea value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} placeholder="Ask about a decision, challenge, or opportunity..." aria-label="Message Lumini" rows={2} /><div><span>Enter to send | Shift + Enter for a new line</span><button className="send-btn" type="submit" disabled={!chatInput.trim() || chatLoading} aria-label="Send message"><Send size={18} /></button></div></form>
              <p className="ai-note">Lumini can make mistakes. Review assumptions before consequential decisions.</p>
            </div>
            <aside className="mentor-aside"><p className="eyebrow">A BETTER CONVERSATION</p><h3>Start with what matters.</h3>{[{ icon: TrendingUp, t: 'Diagnose a challenge', d: 'Find the constraint beneath the symptom.', q: 'Sales have slowed. Help me find the real cause.' }, { icon: SlidersHorizontal, t: 'Compare a decision', d: 'Weigh options, trade-offs and downside.', q: 'Help me compare hiring a salesperson with outsourcing.' }, { icon: Calculator, t: 'Understand the numbers', d: 'Calculate without hiding the assumptions.', q: 'Explain my break-even point and margin.' }].map(x => <button className="topic-link" key={x.t} onClick={() => sendMessage(x.q)}><x.icon size={19} /><span><strong>{x.t}</strong><small>{x.d}</small></span><ArrowRight size={15} /></button>)}<div className="mentor-principle"><ShieldCheck size={20} /><p><strong>Context before advice.</strong><br />Lumini asks when a missing fact could change the answer.</p></div></aside>
          </div>
        </section>}

        {view === 'finances' && <section className="view finance-os-view" aria-label="Finance OS dashboard">
          <iframe
            className="finance-os-frame"
            src="/finance-os/index.html"
            title="Lumini Finance OS"
            loading="eager"
            style={{ height: `min(${financeOsHeight}px, calc(100vh - 190px))` }}
          />
        </section>}

        {view === 'business' && <section className="view business-view"><div className="page-heading"><div><p className="date-line">BUSINESS MEMORY</p><h1>What Lumini understands.</h1><p>Inspect and correct the context behind every recommendation.</p></div><EvidenceTag>92% complete</EvidenceTag></div><div className="profile-progress"><span style={{ width: '92%' }} /></div><div className="business-layout"><form className="business-form" onSubmit={e => { e.preventDefault(); setToast('Business profile saved') }}><div className="form-section"><div className="form-section-title"><Building2 size={19} /><div><h3>Business essentials</h3><p>The basic context used across your workspace.</p></div></div><div className="field-grid">{[{ k: 'name', l: 'Business name' }, { k: 'industry', l: 'Industry' }, { k: 'stage', l: 'Business stage' }, { k: 'location', l: 'Location / service area' }, { k: 'model', l: 'Business model' }, { k: 'customers', l: 'Primary customers' }].map(x => <label key={x.k}><span>{x.l}</span><input value={business[x.k as keyof typeof business]} onChange={e => setBusiness(b => ({ ...b, [x.k]: e.target.value }))} required /></label>)}</div></div><div className="form-section"><div className="form-section-title"><Target size={19} /><div><h3>Current direction</h3><p>Your active goal guides how recommendations are ranked.</p></div></div><label className="full-field"><span>Primary business goal</span><textarea rows={4} value={business.goal} onChange={e => setBusiness(b => ({ ...b, goal: e.target.value }))} /></label></div><div className="form-actions"><span><LockKeyhole size={14} />Only you can access this workspace</span><button className="primary-btn" type="submit">Save changes <Check size={16} /></button></div></form><aside className="context-aside"><p className="eyebrow">CONTEXT QUALITY</p><h3>A clear foundation</h3><p>Lumini has enough context for financial diagnosis and weekly planning.</p><ul><li><Check size={15} />Business model confirmed</li><li><Check size={15} />Customer segment described</li><li><Check size={15} />September figures available</li><li className="missing"><Plus size={15} />Add average collection period</li></ul><button onClick={() => go('finances')}>Review financial inputs <ArrowRight size={15} /></button><div className="fact-legend"><strong>How facts are labelled</strong><span><i className="reported" />User reported</span><span><i className="calculated" />Calculated</span><span><i className="assumed" />Assumption</span></div></aside></div></section>}

        {view === 'plans' && <section className="view plans-view"><div className="page-heading"><div><p className="date-line">ACCOUNTABILITY</p><h1>Turn thinking into traction.</h1><p>A small, deliberate plan with owners, dates and measurable outcomes.</p></div><button className="primary-btn" onClick={() => setNewActionOpen(true)}><Plus size={17} />New action</button></div><div className="plan-summary"><div><span>ACTIVE PLAN</span><h2>Strengthen cash & customer retention</h2><p>30-day focus | Review on 23 November</p></div><div className="completion-stat"><strong>{actions.length ? Math.round(completed / actions.length * 100) : 0}%</strong><span>{completed} of {actions.length} complete</span><i><em style={{ width: `${actions.length ? completed / actions.length * 100 : 0}%` }} /></i></div></div><div className="plan-toolbar"><div>{['Active', 'Completed', 'All'].map(f => <button className={planFilter === f ? 'active' : ''} key={f} onClick={() => setPlanFilter(f)}>{f}<span>{f === 'Active' ? actions.filter(a => !a.done).length : f === 'Completed' ? completed : actions.length}</span></button>)}</div><button className="secondary-btn" onClick={() => go('mentor')}><Sparkles size={15} />Ask for a recommendation</button></div><div className="plan-table"><div className="plan-table-head"><span>ACTION</span><span>AREA</span><span>DUE</span><span>EXPECTED VALUE</span><span /></div>{actions.filter(a => planFilter === 'All' || (planFilter === 'Active' ? !a.done : a.done)).map(a => <div className={`plan-row ${a.done ? 'is-done' : ''}`} key={a.id}><div><button className="check-btn" onClick={() => toggleAction(a.id)} aria-label={a.done ? 'Reopen action' : 'Complete action'}>{a.done ? <Check size={15} /> : <Circle size={17} />}</button><strong>{a.title}</strong></div><span>{a.area}</span><time>{a.due}</time><span>{a.impact}</span><button className="icon-btn delete-action" onClick={() => { setActions(x => x.filter(y => y.id !== a.id)); setToast('Action removed') }} aria-label={`Delete ${a.title}`}><Trash2 size={16} /></button></div>)}{actions.filter(a => planFilter === 'All' || (planFilter === 'Active' ? !a.done : a.done)).length === 0 && <div className="empty-state"><CheckCircle2 size={28} /><h3>Nothing here right now</h3><p>Switch views or add a new action to keep momentum.</p></div>}</div></section>}

        {view === 'insights' && <InsightsPage
          businessName={business.name}
          businessSummary={{
            sector: business.industry,
            stageLabel: business.stage,
            signals: [
              { label: 'Gross margin', value: `${margin.toFixed(1)}%`, note: 'Calculated from saved revenue and direct costs.' },
              { label: 'Operating result', value: money(operating), note: 'Calculated; not a cash balance.' },
              { label: 'Business goal', value: business.goal }
            ]
          }}
          insights={insightsData}
          resources={starterLibrary}
          reportSummary={{
            id: 'september-financial-review',
            title: 'Financial health review',
            periodLabel: 'September 2026',
            sourceCoverage: 'Saved workspace financial inputs and calculated figures',
            whatChanged: [
              `Gross profit is ${money(gross)} based on the current inputs.`,
              `Gross margin is ${margin.toFixed(1)}%.`
            ],
            whatItMeans: [
              `The calculated operating result is ${money(operating)}.`,
              'Profit does not establish available cash or payment timing.'
            ],
            nextActions: [
              'Prepare a 13-week cash forecast.',
              'Collect customer feedback before committing to a larger growth experiment.'
            ],
            unresolvedQuestions: [
              'What cash balance is currently available?',
              'When are customer receipts and supplier payments due?',
              'What is the measured repeat-purchase rate?'
            ]
          }}
          dataStatus={{
            hasEnoughData: false,
            lastUpdatedLabel: 'Based on the financial values currently saved in this browser',
            missingInputs: [
              'Opening cash balance',
              'Dated customer receipts and supplier payments',
              'Verified customer retention and repeat-purchase results'
            ]
          }}
          onNavigate={(destination) => go(destination)}
          onCreateAction={(input) => {
            if (!input.title.trim()) return
            setActions(current => [
              ...current,
              {
                id: Date.now(),
                title: input.title.trim(),
                area: input.area || 'Insight recommendation',
                due: '07 Nov',
                done: false,
                impact: input.expectedBenefit || 'Review recommended outcome'
              }
            ])
            setToast('Insight action added to your plan')
          }}
          onExportReport={exportCSV}
          onAskLumini={({ question }) => {
            go('mentor')
            sendMessage(question)
          }}
          onOpenResource={(resource) => {
            if (!resource.href) {
              setToast(`"${resource.title}" is not available yet`)
              return
            }

            try {
              const url = new URL(resource.href, window.location.href)

              if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                setToast('This resource link is not supported')
                return
              }

              window.open(url.href, '_blank', 'noopener,noreferrer')
            } catch {
              setToast('Could not open this resource')
            }
          }}
          marketResearchConnected={false}
        />}

        {view === 'settings' && <section className="view settings-view"><div className="page-heading"><div><p className="date-line">YOUR PREFERENCES</p><h1>A workspace on your terms.</h1><p>Control guidance, reviews and how your information is used.</p></div></div><div className="settings-layout"><div className="settings-main"><div className="settings-section"><h3>Guidance & reviews</h3><p>Choose how Lumini supports your working rhythm.</p>{[{ k: 'guided', t: 'Guided explanations', d: 'Use plain language and reveal advanced detail on demand.' }, { k: 'weekly', t: 'Weekly business review', d: 'Prepare a concise review of metrics, actions and open questions.' }, { k: 'actions', t: 'Action reminders', d: 'Show due and overdue priorities in your workspace.' }, { k: 'research', t: 'External research', d: 'Allow current external sources when they materially improve a decision.' }].map(x => <div className="setting-row" key={x.k}><div><strong>{x.t}</strong><span>{x.d}</span></div><button role="switch" aria-checked={settings[x.k as keyof typeof settings]} className={`switch ${settings[x.k as keyof typeof settings] ? 'on' : ''}`} onClick={() => setSettings(s => ({ ...s, [x.k]: !s[x.k as keyof typeof s] }))}><i /></button></div>)}</div><div className="settings-section"><h3>Data & portability</h3><p>Your information remains inspectable and exportable.</p><button className="data-action" onClick={exportCSV}><Download size={18} /><span><strong>Export financial summary</strong><small>Download a CSV of your current reported and calculated figures.</small></span><ArrowRight size={16} /></button><button className="data-action" onClick={() => { setFinance(seedFinance); setActions(initialActions); setMessages(initialMessages); setToast('Demo workspace restored') }}><Database size={18} /><span><strong>Restore demo workspace</strong><small>Reset financial figures, actions and conversation to the original example.</small></span><ArrowRight size={16} /></button></div></div><aside className="settings-aside"><ShieldCheck size={28} /><h3>Privacy is a product principle.</h3><p>Lumini separates reported facts, calculations and assumptions so you stay in control of the story behind the numbers.</p><span><LockKeyhole size={15} />Private workspace</span><span><Eye size={15} />Explainable context</span><span><Download size={15} />Portable data</span><small>This preview stores changes only in this browser. No account or cloud sync is connected.</small></aside></div></section>}
      </div>
    </main>

    {searchOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setSearchOpen(false) }}><div className="search-modal" role="dialog" aria-modal="true" aria-label="Search workspace"><div className="search-input"><Search size={20} /><input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tools, reports and actions..." /><button onClick={() => setSearchOpen(false)}><X size={18} /></button></div><div className="search-results"><p>{search ? `${searchResults.length} RESULTS` : 'QUICK LINKS'}</p>{searchResults.map(x => <button key={x.title} onClick={() => go(x.view)}><span><strong>{x.title}</strong><small>{x.sub}</small></span><ArrowRight size={16} /></button>)}{!searchResults.length && <div className="no-results">No matching items. Try "finance" or "cash".</div>}</div><footer><span><kbd>Enter</kbd> to open</span><span><kbd>esc</kbd> to close</span></footer></div></div>}
    {noticesOpen && <><button className="notice-backdrop" onClick={() => setNoticesOpen(false)} aria-label="Close notifications" /><aside className="notice-panel"><div className="section-head"><h3>Notifications</h3><button className="icon-btn" onClick={() => setNoticesOpen(false)}><X size={18} /></button></div><div className="notice-item unread"><span><Clock3 size={17} /></span><div><strong>Your monthly review is Friday</strong><p>September figures are ready for your review.</p><small>2 hours ago</small></div></div><div className="notice-item"><span><Target size={17} /></span><div><strong>One action is due today</strong><p>Customer calls are still open in this week's plan.</p><small>Today</small></div></div><button className="text-btn" onClick={() => { go('plans'); setNoticesOpen(false) }}>Open my plan <ArrowRight size={15} /></button></aside></>}
    {newActionOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setNewActionOpen(false) }}><div className="action-modal" role="dialog" aria-modal="true" aria-labelledby="new-action-title"><button className="modal-close icon-btn" onClick={() => setNewActionOpen(false)} aria-label="Close"><X size={19} /></button><p className="eyebrow">ADD TO YOUR PLAN</p><h2 id="new-action-title">Make the next step concrete.</h2><p>Recommendations only become actions with your approval.</p><form onSubmit={e => { e.preventDefault(); addAction() }}><label><span>Action title</span><textarea autoFocus rows={3} value={actionTitle} onChange={e => setActionTitle(e.target.value)} placeholder="What will you do?" required /></label><div className="modal-fields"><label><span>Owner</span><input value="Amara Otieno" readOnly /></label><label><span>Review date</span><input value="7 November 2026" readOnly /></label></div><button className="primary-btn" type="submit" disabled={!actionTitle.trim()}>Add action <ArrowRight size={16} /></button></form></div></div>}
    {toast && <div className="toast"><CheckCircle2 size={18} />{toast}</div>}
  </div>
}

export default App
