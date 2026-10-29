import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bell, BookOpen,
  Building2, Calculator, Check, CheckCircle2, ChevronDown, ChevronRight,
  Circle, Clock3, Download, Home, Lightbulb,
  Menu, MessageSquareText, Plus, Search, Settings, ShieldCheck, Sparkles,
  Target, TrendingUp, UserRound, X, Send, SlidersHorizontal, Trash2,
  AlertCircle, LockKeyhole, Database, Eye, CircleDollarSign, Flag
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import './App.css'

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
]
const initialActions: Action[] = [
  { id: 1, title: 'Call 5 customers about delivery experience', area: 'Customer insight', due: 'Today', done: false, impact: 'High impact' },
  { id: 2, title: 'Review supplier terms for top 3 materials', area: 'Cost control', due: '28 Oct', done: false, impact: 'KSh 12k potential' },
  { id: 3, title: 'Update October cash collection forecast', area: 'Financial health', due: '30 Oct', done: false, impact: 'Reduce risk' },
  { id: 4, title: 'Document the weekly stock-count routine', area: 'Operations', due: '02 Nov', done: true, impact: 'Completed' },
]
const initialMessages: Message[] = [
  { id: 1, from: 'lumini', text: 'Good morning, Amara. I’ve reviewed your latest figures. Your gross margin is healthy at 35%, but cash timing deserves attention before you pursue more sales.', detail: 'Based on your September figures · User reported, not audited' },
]
const seedFinance: Finance = { revenue: 300000, direct: 195000, expenses: 75000, price: 2500, variable: 1625, fixed: 75000 }

const money = (n: number) => `KSh ${Math.round(n).toLocaleString('en-KE')}`
const viewTitle: Record<View, string> = { home: 'Overview', mentor: 'Ask Lumini', business: 'My business', finances: 'Financial studio', plans: 'Plans & actions', insights: 'Insights', settings: 'Settings' }

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="brand"><span className="brand-mark"><span /></span>{!compact && <span className="brand-word">Lumini<small>BUSINESS MENTOR</small></span>}</div>
}

function EvidenceTag({ children, tone = '' }: { children: React.ReactNode; tone?: string }) {
  return <span className={`evidence-tag ${tone}`}><span />{children}</span>
}

function App() {
  const [view, setView] = useState<View>('home')
  const [mobileNav, setMobileNav] = useState(false)
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
  const [report, setReport] = useState('Financial health')
  const [business, setBusiness] = useState({ name: 'Amani Home & Living', industry: 'Retail & homeware', stage: 'Established', location: 'Nairobi, Kenya', customers: 'Design-conscious urban homeowners', model: 'Direct-to-consumer retail', goal: 'Improve cash resilience while protecting our 35% gross margin.' })
  const [settings, setSettings] = useState({ weekly: true, actions: true, research: false, guided: true })
  const chatEnd = useRef<HTMLDivElement>(null)

  useEffect(() => { localStorage.setItem('lumini-actions', JSON.stringify(actions)) }, [actions])
  useEffect(() => { localStorage.setItem('lumini-finance', JSON.stringify(finance)) }, [finance])
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, chatLoading])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2800); return () => clearTimeout(t) }, [toast])
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setNewActionOpen(false); setNoticesOpen(false); setProfileOpen(false); setMobileNav(false) }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true) }
    }
    window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn)
  }, [])

  const go = (v: View) => { setView(v); setMobileNav(false); setSearchOpen(false); setSearch(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const completed = actions.filter(a => a.done).length
  const gross = finance.revenue - finance.direct
  const margin = finance.revenue ? gross / finance.revenue * 100 : 0
  const operating = gross - finance.expenses
  const contribution = finance.price - finance.variable
  const breakEven = contribution > 0 ? Math.ceil(finance.fixed / contribution) : 0
  const cashData = useMemo(() => {
    const base = Math.max(operating, 0)
    return [
      { month: 'May', actual: base * .66, forecast: base * .7 }, { month: 'Jun', actual: base * .8, forecast: base * .78 },
      { month: 'Jul', actual: base * .72, forecast: base * .83 }, { month: 'Aug', actual: base * .94, forecast: base * .9 },
      { month: 'Sep', actual: base, forecast: base * .98 }, { month: 'Oct', actual: base * 1.12, forecast: base * 1.08 },
      { month: 'Nov', actual: null, forecast: base * 1.16 }, { month: 'Dec', actual: null, forecast: base * 1.24 },
    ]
  }, [operating])

  const sendMessage = (preset?: string) => {
    const text = (preset || chatInput).trim()
    if (!text || chatLoading) return
    setMessages(m => [...m, { id: Date.now(), from: 'user', text }])
    setChatInput(''); setChatLoading(true)
    setTimeout(() => {
      const lower = text.toLowerCase()
      let response = 'Before recommending a direction, I’d separate what is measured from what is assumed. Your current figures show a positive operating result, so the next useful step is to test the constraint with the least irreversible commitment.'
      let detail = 'Recommendation · Moderate confidence · Based on saved business context'
      if (lower.includes('cash')) { response = 'Your business is profitable on the figures provided, so cash pressure is more likely a timing issue than a demand issue. Start by mapping when customers pay against when suppliers, payroll, and debt fall due. Growth can make this tighter if each sale consumes cash before collection.'; detail = 'Diagnosis · Cash movement is not the same as profit · 3 inputs still needed' }
      if (lower.includes('price') || lower.includes('margin')) { response = `At ${money(finance.price)} per unit and ${money(finance.variable)} variable cost, each sale contributes ${money(contribution)}. A price test should protect that contribution while measuring conversion. I would test a modest increase with one customer segment before changing every price.`; detail = 'Calculated from your editable unit economics · No market price claims made' }
      if (lower.includes('next') || lower.includes('priority')) { response = 'Speak with five recent customers before increasing acquisition spend. It is low-cost, reversible, and will tell you whether delivery, product selection, or follow-up is limiting repeat purchases. Measure repeat-purchase intent and the reasons behind it.'; detail = 'Ranked for impact, effort, cost and reversibility · Review in 7 days' }
      setMessages(m => [...m, { id: Date.now() + 1, from: 'lumini', text: response, detail }]); setChatLoading(false)
    }, 850)
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
    <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
      <div className="sidebar-top"><Logo /><button className="icon-btn mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={20} /></button></div>
      <button className="business-switch" onClick={() => go('business')}><span className="business-monogram">AH</span><span><strong>{business.name}</strong><small>Established business</small></span><ChevronDown size={15} /></button>
      <nav className="main-nav" aria-label="Main navigation">
        <p className="nav-label">WORKSPACE</p>
        {nav.map(n => <button key={n.id} className={view === n.id ? 'active' : ''} onClick={() => go(n.id)}><n.icon size={18} strokeWidth={1.6} /><span>{n.label}</span>{n.id === 'plans' && <em>{actions.filter(a => !a.done).length}</em>}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="review-note"><span className="review-icon"><Clock3 size={16} /></span><p>Monthly review<small>Friday, 30 October</small></p><button onClick={() => go('insights')} aria-label="Open monthly review"><ChevronRight size={16} /></button></div>
        <button className={`settings-link ${view === 'settings' ? 'active' : ''}`} onClick={() => go('settings')}><Settings size={18} /><span>Settings</span></button>
        <div className="privacy-line"><ShieldCheck size={14} /><span>Your business, kept private</span></div>
      </div>
    </aside>
    {mobileNav && <button className="nav-backdrop" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}

    <main className="main-area">
      <header className="topbar">
        <div className="topbar-left"><button className="icon-btn menu-trigger" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={21} /></button><span className="crumb">AMANI WORKSPACE</span><ChevronRight size={13} /><strong>{viewTitle[view]}</strong></div>
        <div className="topbar-actions">
          <button className="search-trigger" onClick={() => setSearchOpen(true)}><Search size={17} /><span>Search workspace</span><kbd>⌘ K</kbd></button>
          <button className="icon-btn notice-btn" onClick={() => setNoticesOpen(!noticesOpen)} aria-label="Notifications"><Bell size={19} /><i /></button>
          <div className="profile-wrap"><button className="avatar" onClick={() => setProfileOpen(!profileOpen)} aria-label="Open profile menu">AO</button>{profileOpen && <div className="profile-menu"><strong>Amara Otieno</strong><span>Owner · Amani Home & Living</span><button onClick={() => { go('settings'); setProfileOpen(false) }}><UserRound size={15} />Account settings</button><button onClick={() => { exportCSV(); setProfileOpen(false) }}><Download size={15} />Export my data</button></div>}</div>
        </div>
      </header>

      <div className="page-content">
        {view === 'home' && <section className="view home-view">
          <div className="welcome-row"><div><p className="date-line">MONDAY, 26 OCTOBER</p><h1>Good morning, Amara.</h1><p>Your business is profitable. Today, let’s make its cash work harder.</p></div><button className="primary-btn" onClick={() => go('mentor')}><Sparkles size={17} />Ask Lumini</button></div>
          <div className="overview-grid">
            <article className="priority-panel">
              <div className="panel-kicker"><span>YOUR NEXT BEST MOVE</span><EvidenceTag>High confidence</EvidenceTag></div>
              <div className="priority-body"><span className="priority-number">01</span><div><h2>Listen before you spend.</h2><p>Speak with five recent customers before increasing your marketing budget. Their answers will show whether repeat sales are limited by delivery, product selection, or follow-up.</p><div className="reason-row"><span><Clock3 size={14} />30 minutes</span><span><CircleDollarSign size={14} />No spend required</span><span><Flag size={14} />Review in 7 days</span></div></div></div>
              <div className="priority-footer"><button className="text-btn light" onClick={() => go('mentor')}>See the reasoning <ArrowRight size={16} /></button><button className="gold-btn" onClick={() => { setActions(a => a.some(x => x.id === 1) ? a : [{ id: 1, title: 'Call 5 customers about delivery experience', area: 'Customer insight', due: 'Today', done: false, impact: 'High impact' }, ...a]); go('plans') }}>Add to my plan <Plus size={16} /></button></div>
            </article>
            <article className="health-panel">
              <div className="section-head"><div><p className="eyebrow">BUSINESS HEALTH</p><h3>September pulse</h3></div><button className="icon-btn" onClick={() => go('insights')} aria-label="View health report"><ArrowUpRight size={18} /></button></div>
              <div className="health-score"><div className="score-ring"><span>78<small>/100</small></span></div><div><strong>Steady, with room to strengthen</strong><p>Profitability is sound. Cash visibility is your main opportunity.</p></div></div>
              <div className="health-bars"><div><span>Profitability <b>Strong</b></span><i><em style={{ width: '86%' }} /></i></div><div><span>Cash resilience <b>Watch</b></span><i><em className="warn" style={{ width: '58%' }} /></i></div><div><span>Customer momentum <b>Good</b></span><i><em style={{ width: '72%' }} /></i></div></div>
            </article>
          </div>
          <div className="metric-strip">
            <button onClick={() => go('finances')}><span>MONTHLY REVENUE <ArrowUpRight size={14} /></span><strong>{money(finance.revenue)}</strong><small><ArrowUpRight size={13} />8.4% from August</small></button>
            <button onClick={() => go('finances')}><span>GROSS MARGIN <ArrowUpRight size={14} /></span><strong>{margin.toFixed(0)}%</strong><small>{margin >= 32 && margin <= 38 ? 'Within your 32–38% target' : 'Outside your 32–38% target'}</small></button>
            <button onClick={() => go('finances')}><span>OPERATING RESULT <ArrowUpRight size={14} /></span><strong>{money(operating)}</strong><small>Before tax & unreported items</small></button>
            <button onClick={() => go('plans')}><span>ACTIONS COMPLETE <ArrowUpRight size={14} /></span><strong>{completed}<i> / {actions.length}</i></strong><small>{actions.length - completed} priorities still open</small></button>
          </div>
          <div className="lower-grid">
            <article className="actions-panel"><div className="section-head"><div><p className="eyebrow">THIS WEEK</p><h3>Priorities that matter</h3></div><button className="text-btn" onClick={() => go('plans')}>View all <ArrowRight size={15} /></button></div><div className="action-list">{actions.slice(0, 3).map(a => <div className={`action-row ${a.done ? 'is-done' : ''}`} key={a.id}><button className="check-btn" onClick={() => toggleAction(a.id)} aria-label={a.done ? `Reopen ${a.title}` : `Complete ${a.title}`}>{a.done ? <Check size={15} /> : <Circle size={17} />}</button><div><strong>{a.title}</strong><span>{a.area} · {a.impact}</span></div><time>{a.due}</time></div>)}</div></article>
            <article className="cash-panel"><div className="section-head"><div><p className="eyebrow">LOOKING AHEAD</p><h3>Operating result</h3></div><span className="tiny-label">6 MONTH VIEW</span></div><div className="mini-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={cashData.slice(0, 6)}><defs><linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#af915f" stopOpacity={.35}/><stop offset="100%" stopColor="#af915f" stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="actual" stroke="#af915f" strokeWidth={2.2} fill="url(#goldFill)" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#807e77', fontSize: 11 }} /><YAxis hide domain={[0, 'auto']} /></AreaChart></ResponsiveContainer></div><div className="chart-caption"><TrendingUp size={15} /><span>Positive trajectory, based on reported results</span></div></article>
          </div>
          <div className="disclosure"><ShieldCheck size={15} /><span>Calculations use your reported figures, not audited statements. Last updated 25 October 2026.</span><button onClick={() => go('business')}>Review business data</button></div>
        </section>}

        {view === 'mentor' && <section className="view mentor-view">
          <div className="page-heading compact"><div><p className="date-line">YOUR BUSINESS MENTOR</p><h1>Think it through, together.</h1><p>Advice grounded in your numbers, your context, and what is still unknown.</p></div><EvidenceTag>Context connected</EvidenceTag></div>
          <div className="mentor-layout">
            <div className="conversation">
              <div className="conversation-context"><Database size={15} /><span>Using September financials, business profile & active goals</span><button onClick={() => go('business')}>Inspect context</button></div>
              <div className="messages">{messages.map(m => <div className={`message ${m.from}`} key={m.id}>{m.from === 'lumini' && <span className="mentor-seal"><Sparkles size={16} /></span>}<div><p>{m.text}</p>{m.detail && <small><BookOpen size={13} />{m.detail}</small>}{m.from === 'lumini' && m.id !== 1 && <button className="message-action" onClick={() => { setActionTitle(m.text.split('.')[0]); setNewActionOpen(true) }}><Plus size={14} />Turn into an action</button>}</div></div>)}{chatLoading && <div className="message lumini"><span className="mentor-seal"><Sparkles size={16} /></span><div className="thinking"><i /><i /><i /><span>Reviewing your business context</span></div></div>}<div ref={chatEnd} /></div>
              <div className="prompt-chips">{['What should I do next?', 'Why is cash tight?', 'Should I change my pricing?'].map(p => <button key={p} onClick={() => sendMessage(p)}>{p}</button>)}</div>
              <form className="chat-form" onSubmit={e => { e.preventDefault(); sendMessage() }}><textarea value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} placeholder="Ask about a decision, challenge, or opportunity…" aria-label="Message Lumini" rows={2} /><div><span>Enter to send · Shift + Enter for a new line</span><button className="send-btn" type="submit" disabled={!chatInput.trim() || chatLoading} aria-label="Send message"><Send size={18} /></button></div></form>
              <p className="ai-note">Lumini can make mistakes. Review assumptions before consequential decisions.</p>
            </div>
            <aside className="mentor-aside"><p className="eyebrow">A BETTER CONVERSATION</p><h3>Start with what matters.</h3>{[{ icon: TrendingUp, t: 'Diagnose a challenge', d: 'Find the constraint beneath the symptom.', q: 'Sales have slowed. Help me find the real cause.' }, { icon: SlidersHorizontal, t: 'Compare a decision', d: 'Weigh options, trade-offs and downside.', q: 'Help me compare hiring a salesperson with outsourcing.' }, { icon: Calculator, t: 'Understand the numbers', d: 'Calculate without hiding the assumptions.', q: 'Explain my break-even point and margin.' }].map(x => <button className="topic-link" key={x.t} onClick={() => sendMessage(x.q)}><x.icon size={19} /><span><strong>{x.t}</strong><small>{x.d}</small></span><ArrowRight size={15} /></button>)}<div className="mentor-principle"><ShieldCheck size={20} /><p><strong>Context before advice.</strong><br />Lumini asks when a missing fact could change the answer.</p></div></aside>
          </div>
        </section>}

        {view === 'finances' && <section className="view finance-view">
          <div className="page-heading"><div><p className="date-line">FINANCIAL INTELLIGENCE</p><h1>Clarity behind every shilling.</h1><p>Transparent calculations, editable assumptions, no hidden arithmetic.</p></div><button className="secondary-btn" onClick={exportCSV}><Download size={16} />Export summary</button></div>
          <div className="finance-layout">
            <article className="finance-inputs"><div className="section-head"><div><p className="eyebrow">SEPTEMBER 2026</p><h3>Your reported figures</h3></div><EvidenceTag>User reported</EvidenceTag></div>{([{ k: 'revenue', l: 'Revenue', h: 'Total sales for the period' }, { k: 'direct', l: 'Direct costs', h: 'Costs tied to products sold' }, { k: 'expenses', l: 'Operating expenses', h: 'Overheads for the same period' }] as { k: keyof Finance; l: string; h: string }[]).map(x => <label className="money-field" key={x.k}><span>{x.l}<small>{x.h}</small></span><div><i>KSh</i><input type="number" min="0" value={finance[x.k]} onChange={e => setFinance(f => ({ ...f, [x.k]: Number(e.target.value) }))} /></div></label>)}<div className="formula-note"><AlertCircle size={16} /><p>Profit is not cash movement. Receivables, inventory, debt and owner withdrawals are not included here.</p></div></article>
            <article className="finance-results"><p className="eyebrow">CALCULATED POSITION</p><div className="result-main"><span>Operating result</span><strong>{money(operating)}</strong><small className={operating >= 0 ? 'positive' : 'negative'}>{operating >= 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}{finance.revenue ? (operating / finance.revenue * 100).toFixed(1) : 0}% of revenue · before unreported items</small></div><div className="result-pair"><div><span>Gross profit</span><strong>{money(gross)}</strong><small>Revenue − direct costs</small></div><div><span>Gross margin</span><strong>{margin.toFixed(1)}%</strong><small>Gross profit ÷ revenue</small></div></div><div className="result-foot"><CheckCircle2 size={16} /><span>All values recalculate instantly from your inputs.</span></div></article>
          </div>
          <article className="break-even"><div className="break-intro"><p className="eyebrow">UNIT ECONOMICS</p><h2>Know your break-even point.</h2><p>See how price, variable cost and fixed overhead shape the number of units you need to sell.</p><div className="break-result"><span>BREAK-EVEN VOLUME</span><strong>{breakEven || '—'} <small>units / month</small></strong><p>{contribution > 0 ? `Each unit contributes ${money(contribution)} toward fixed costs.` : 'Contribution is zero or negative. Break-even cannot be reached at these unit economics.'}</p></div></div><div className="unit-fields">{([{ k: 'price', l: 'Selling price / unit' }, { k: 'variable', l: 'Variable cost / unit' }, { k: 'fixed', l: 'Monthly fixed costs' }] as { k: keyof Finance; l: string }[]).map(x => <label key={x.k}><span>{x.l}</span><div><i>KSh</i><input type="number" min="0" value={finance[x.k]} onChange={e => setFinance(f => ({ ...f, [x.k]: Number(e.target.value) }))} /></div></label>)}<div className="contribution-track"><span>Contribution margin ratio <b>{finance.price ? Math.max(0, contribution / finance.price * 100).toFixed(0) : 0}%</b></span><i><em style={{ width: `${Math.max(0, Math.min(100, contribution / finance.price * 100))}%` }} /></i></div></div></article>
          <article className="forecast-panel"><div className="section-head"><div><p className="eyebrow">PERFORMANCE & OUTLOOK</p><h3>Actual result and planning forecast</h3></div><div className="legend"><span className="actual">Actual</span><span className="forecast">Forecast</span></div></div><div className="large-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={cashData} margin={{ top: 12, right: 12, bottom: 0, left: -12 }}><defs><linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#af915f" stopOpacity={.28}/><stop offset="100%" stopColor="#af915f" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#dedbd3" strokeDasharray="2 4" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#77756e', fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#77756e', fontSize: 11 }} tickFormatter={v => `${Math.round(v / 1000)}k`} /><Tooltip formatter={(v) => money(Number(v))} contentStyle={{ border: '1px solid #d8d3c8', background: '#fffdf8', borderRadius: 2 }} /><Area type="monotone" dataKey="actual" connectNulls={false} stroke="#8d7345" strokeWidth={2.5} fill="url(#actualFill)" /><Area type="monotone" dataKey="forecast" stroke="#162638" strokeWidth={1.8} strokeDasharray="5 5" fill="transparent" /></AreaChart></ResponsiveContainer></div><p className="chart-note">Forecast is an illustrative planning scenario derived from your current result, not a guarantee or externally verified market forecast.</p></article>
        </section>}

        {view === 'business' && <section className="view business-view"><div className="page-heading"><div><p className="date-line">BUSINESS MEMORY</p><h1>What Lumini understands.</h1><p>Inspect and correct the context behind every recommendation.</p></div><EvidenceTag>92% complete</EvidenceTag></div><div className="profile-progress"><span style={{ width: '92%' }} /></div><div className="business-layout"><form className="business-form" onSubmit={e => { e.preventDefault(); setToast('Business profile saved') }}><div className="form-section"><div className="form-section-title"><Building2 size={19} /><div><h3>Business essentials</h3><p>The basic context used across your workspace.</p></div></div><div className="field-grid">{[{ k: 'name', l: 'Business name' }, { k: 'industry', l: 'Industry' }, { k: 'stage', l: 'Business stage' }, { k: 'location', l: 'Location / service area' }, { k: 'model', l: 'Business model' }, { k: 'customers', l: 'Primary customers' }].map(x => <label key={x.k}><span>{x.l}</span><input value={business[x.k as keyof typeof business]} onChange={e => setBusiness(b => ({ ...b, [x.k]: e.target.value }))} required /></label>)}</div></div><div className="form-section"><div className="form-section-title"><Target size={19} /><div><h3>Current direction</h3><p>Your active goal guides how recommendations are ranked.</p></div></div><label className="full-field"><span>Primary business goal</span><textarea rows={4} value={business.goal} onChange={e => setBusiness(b => ({ ...b, goal: e.target.value }))} /></label></div><div className="form-actions"><span><LockKeyhole size={14} />Only you can access this workspace</span><button className="primary-btn" type="submit">Save changes <Check size={16} /></button></div></form><aside className="context-aside"><p className="eyebrow">CONTEXT QUALITY</p><h3>A clear foundation</h3><p>Lumini has enough context for financial diagnosis and weekly planning.</p><ul><li><Check size={15} />Business model confirmed</li><li><Check size={15} />Customer segment described</li><li><Check size={15} />September figures available</li><li className="missing"><Plus size={15} />Add average collection period</li></ul><button onClick={() => go('finances')}>Review financial inputs <ArrowRight size={15} /></button><div className="fact-legend"><strong>How facts are labelled</strong><span><i className="reported" />User reported</span><span><i className="calculated" />Calculated</span><span><i className="assumed" />Assumption</span></div></aside></div></section>}

        {view === 'plans' && <section className="view plans-view"><div className="page-heading"><div><p className="date-line">ACCOUNTABILITY</p><h1>Turn thinking into traction.</h1><p>A small, deliberate plan with owners, dates and measurable outcomes.</p></div><button className="primary-btn" onClick={() => setNewActionOpen(true)}><Plus size={17} />New action</button></div><div className="plan-summary"><div><span>ACTIVE PLAN</span><h2>Strengthen cash & customer retention</h2><p>30-day focus · Review on 23 November</p></div><div className="completion-stat"><strong>{actions.length ? Math.round(completed / actions.length * 100) : 0}%</strong><span>{completed} of {actions.length} complete</span><i><em style={{ width: `${actions.length ? completed / actions.length * 100 : 0}%` }} /></i></div></div><div className="plan-toolbar"><div>{['Active', 'Completed', 'All'].map(f => <button className={planFilter === f ? 'active' : ''} key={f} onClick={() => setPlanFilter(f)}>{f}<span>{f === 'Active' ? actions.filter(a => !a.done).length : f === 'Completed' ? completed : actions.length}</span></button>)}</div><button className="secondary-btn" onClick={() => go('mentor')}><Sparkles size={15} />Ask for a recommendation</button></div><div className="plan-table"><div className="plan-table-head"><span>ACTION</span><span>AREA</span><span>DUE</span><span>EXPECTED VALUE</span><span /></div>{actions.filter(a => planFilter === 'All' || (planFilter === 'Active' ? !a.done : a.done)).map(a => <div className={`plan-row ${a.done ? 'is-done' : ''}`} key={a.id}><div><button className="check-btn" onClick={() => toggleAction(a.id)} aria-label={a.done ? 'Reopen action' : 'Complete action'}>{a.done ? <Check size={15} /> : <Circle size={17} />}</button><strong>{a.title}</strong></div><span>{a.area}</span><time>{a.due}</time><span>{a.impact}</span><button className="icon-btn delete-action" onClick={() => { setActions(x => x.filter(y => y.id !== a.id)); setToast('Action removed') }} aria-label={`Delete ${a.title}`}><Trash2 size={16} /></button></div>)}{actions.filter(a => planFilter === 'All' || (planFilter === 'Active' ? !a.done : a.done)).length === 0 && <div className="empty-state"><CheckCircle2 size={28} /><h3>Nothing here right now</h3><p>Switch views or add a new action to keep momentum.</p></div>}</div></section>}

        {view === 'insights' && <section className="view insights-view"><div className="page-heading"><div><p className="date-line">DECISION RECORDS</p><h1>See what changed, and why.</h1><p>Reports that connect your metrics, decisions and outcomes.</p></div><button className="secondary-btn" onClick={exportCSV}><Download size={16} />Export CSV</button></div><div className="insights-layout"><div className="report-nav">{['Financial health', 'Customer momentum', 'Cash & working capital', 'Monthly business review'].map((r, i) => <button className={report === r ? 'active' : ''} key={r} onClick={() => setReport(r)}><span>0{i + 1}</span><strong>{r}</strong><ChevronRight size={16} /></button>)}</div><article className="report-content"><div className="report-meta"><EvidenceTag>{report === 'Financial health' ? 'Calculated + reported' : 'Review draft'}</EvidenceTag><span>SEPTEMBER 2026</span></div><h2>{report}</h2><p className="report-lead">{report === 'Financial health' ? 'Amani is generating a positive operating result. The immediate opportunity is not simply more sales, but better visibility over when cash enters and leaves the business.' : report === 'Customer momentum' ? 'Customer conversations are the missing evidence in your retention picture. Your next review should distinguish delivery satisfaction from repeat-purchase intent.' : report === 'Cash & working capital' ? 'Your reported profit does not yet explain cash timing. Collection period, supplier terms and inventory commitment are the three inputs needed for a complete diagnosis.' : 'October closes with stronger reported performance and one clear learning: small, measurable operating reviews are creating better decisions.'}</p><div className="report-findings"><h3>What the evidence says</h3><div><span>01</span><p><strong>Margin provides room to test.</strong> A {margin.toFixed(0)}% gross margin gives you some room for controlled pricing and retention experiments, provided direct costs remain stable.</p></div><div><span>02</span><p><strong>Profit and cash need separate reviews.</strong> The {money(operating)} operating result excludes timing differences, debt principal, owner withdrawals and capital expenditure.</p></div><div><span>03</span><p><strong>One unknown materially affects the next step.</strong> Average customer collection period has not been provided. This should be measured before expanding inventory or acquisition spend.</p></div></div><div className="report-recommendation"><Lightbulb size={21} /><div><span>RECOMMENDED NEXT STEP</span><strong>Complete a 13-week cash collection map.</strong><p>Start with known payment dates and mark assumptions clearly. Review weekly.</p></div><button onClick={() => { setActionTitle('Complete a 13-week cash collection map'); setNewActionOpen(true) }}><Plus size={17} /></button></div><footer><ShieldCheck size={15} />This report uses your saved inputs. It is not an audit or a guarantee of future performance.</footer></article></div></section>}

        {view === 'settings' && <section className="view settings-view"><div className="page-heading"><div><p className="date-line">YOUR PREFERENCES</p><h1>A workspace on your terms.</h1><p>Control guidance, reviews and how your information is used.</p></div></div><div className="settings-layout"><div className="settings-main"><div className="settings-section"><h3>Guidance & reviews</h3><p>Choose how Lumini supports your working rhythm.</p>{[{ k: 'guided', t: 'Guided explanations', d: 'Use plain language and reveal advanced detail on demand.' }, { k: 'weekly', t: 'Weekly business review', d: 'Prepare a concise review of metrics, actions and open questions.' }, { k: 'actions', t: 'Action reminders', d: 'Show due and overdue priorities in your workspace.' }, { k: 'research', t: 'External research', d: 'Allow current external sources when they materially improve a decision.' }].map(x => <div className="setting-row" key={x.k}><div><strong>{x.t}</strong><span>{x.d}</span></div><button role="switch" aria-checked={settings[x.k as keyof typeof settings]} className={`switch ${settings[x.k as keyof typeof settings] ? 'on' : ''}`} onClick={() => setSettings(s => ({ ...s, [x.k]: !s[x.k as keyof typeof s] }))}><i /></button></div>)}</div><div className="settings-section"><h3>Data & portability</h3><p>Your information remains inspectable and exportable.</p><button className="data-action" onClick={exportCSV}><Download size={18} /><span><strong>Export financial summary</strong><small>Download a CSV of your current reported and calculated figures.</small></span><ArrowRight size={16} /></button><button className="data-action" onClick={() => { setFinance(seedFinance); setActions(initialActions); setMessages(initialMessages); setToast('Demo workspace restored') }}><Database size={18} /><span><strong>Restore demo workspace</strong><small>Reset financial figures, actions and conversation to the original example.</small></span><ArrowRight size={16} /></button></div></div><aside className="settings-aside"><ShieldCheck size={28} /><h3>Privacy is a product principle.</h3><p>Lumini separates reported facts, calculations and assumptions so you stay in control of the story behind the numbers.</p><span><LockKeyhole size={15} />Private workspace</span><span><Eye size={15} />Explainable context</span><span><Download size={15} />Portable data</span><small>This preview stores changes only in this browser. No account or cloud sync is connected.</small></aside></div></section>}
      </div>
    </main>

    {searchOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setSearchOpen(false) }}><div className="search-modal" role="dialog" aria-modal="true" aria-label="Search workspace"><div className="search-input"><Search size={20} /><input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tools, reports and actions…" /><button onClick={() => setSearchOpen(false)}><X size={18} /></button></div><div className="search-results"><p>{search ? `${searchResults.length} RESULTS` : 'QUICK LINKS'}</p>{searchResults.map(x => <button key={x.title} onClick={() => go(x.view)}><span><strong>{x.title}</strong><small>{x.sub}</small></span><ArrowRight size={16} /></button>)}{!searchResults.length && <div className="no-results">No matching items. Try “finance” or “cash”.</div>}</div><footer><span><kbd>↵</kbd> to open</span><span><kbd>esc</kbd> to close</span></footer></div></div>}
    {noticesOpen && <><button className="notice-backdrop" onClick={() => setNoticesOpen(false)} aria-label="Close notifications" /><aside className="notice-panel"><div className="section-head"><h3>Notifications</h3><button className="icon-btn" onClick={() => setNoticesOpen(false)}><X size={18} /></button></div><div className="notice-item unread"><span><Clock3 size={17} /></span><div><strong>Your monthly review is Friday</strong><p>September figures are ready for your review.</p><small>2 hours ago</small></div></div><div className="notice-item"><span><Target size={17} /></span><div><strong>One action is due today</strong><p>Customer calls are still open in this week’s plan.</p><small>Today</small></div></div><button className="text-btn" onClick={() => { go('plans'); setNoticesOpen(false) }}>Open my plan <ArrowRight size={15} /></button></aside></>}
    {newActionOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setNewActionOpen(false) }}><div className="action-modal" role="dialog" aria-modal="true" aria-labelledby="new-action-title"><button className="modal-close icon-btn" onClick={() => setNewActionOpen(false)} aria-label="Close"><X size={19} /></button><p className="eyebrow">ADD TO YOUR PLAN</p><h2 id="new-action-title">Make the next step concrete.</h2><p>Recommendations only become actions with your approval.</p><form onSubmit={e => { e.preventDefault(); addAction() }}><label><span>Action title</span><textarea autoFocus rows={3} value={actionTitle} onChange={e => setActionTitle(e.target.value)} placeholder="What will you do?" required /></label><div className="modal-fields"><label><span>Owner</span><input value="Amara Otieno" readOnly /></label><label><span>Review date</span><input value="7 November 2026" readOnly /></label></div><button className="primary-btn" type="submit" disabled={!actionTitle.trim()}>Add action <ArrowRight size={16} /></button></form></div></div>}
    {toast && <div className="toast"><CheckCircle2 size={18} />{toast}</div>}
  </div>
}

export default App
