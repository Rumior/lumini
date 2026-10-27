import { ArrowRight, ArrowUpRight, Check, CircleDollarSign, Circle, Clock3, Flag, Plus, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { EvidenceTag } from '@/components/app/EvidenceTag'
import { useWorkspace } from '@/context/workspace-context'
import { useGo } from '@/hooks/use-go'
import { money } from '@/lib/format'
import { mockDates } from '@/data/mock-data'
import { computeHealthScore } from '@/lib/health'
import { useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function HomeView() {
  const go = useGo()
  const { actions, finance, margin, operating, completed, cashData, toggleAction, addSuggestedAction } = useWorkspace()
  const { user } = useAuth()
  const health = useMemo(() => computeHealthScore(finance, actions, 6), [finance, actions])
  const firstName = user?.firstName || 'there'
  const marginTarget = { min: 32, max: 38 }

  return (
    <section className="view home-view">
      <div className="welcome-row">
        <div>
          <p className="date-line">{mockDates.todayLine}</p>
          <h1>Good morning, {firstName}.</h1>
          <p>Your business overview at a glance.</p>
        </div>
        <button className="primary-btn" onClick={() => go('mentor')}><Sparkles size={17} />Ask Lumini</button>
      </div>

      <div className="overview-grid">
        <article className="priority-panel">
          <div className="panel-kicker"><span>YOUR NEXT BEST MOVE</span><EvidenceTag>High confidence</EvidenceTag></div>
          <div className="priority-body">
            <span className="priority-number">01</span>
            <div>
              <h2>Focus on unit economics</h2>
              <p>Review pricing and direct costs to protect margins. Use the Finances view to test scenarios.</p>
              <div className="reason-row">
                <span><Clock3 size={14} />15 minutes</span>
                <span><CircleDollarSign size={14} />No spend required</span>
                <span><Flag size={14} />Review today</span>
              </div>
            </div>
          </div>
          <div className="priority-footer">
            <button className="text-btn light" onClick={() => go('mentor')}>See the reasoning <ArrowRight size={16} /></button>
            <button className="gold-btn" onClick={() => { addSuggestedAction(); go('plans') }}>Add to my plan <Plus size={16} /></button>
          </div>
        </article>

        <article className="health-panel">
          <div className="section-head">
            <div><p className="eyebrow">BUSINESS HEALTH</p><h3>Health Score</h3></div>
            <button className="icon-btn" onClick={() => go('insights')} aria-label="View health report"><ArrowUpRight size={18} /></button>
          </div>
          <div className="health-score">
            <div className="score-ring"><span>{health.overall}<small>/100</small></span></div>
            <div><strong>{health.level}</strong><p>{health.recommendations[0]}</p></div>
          </div>
          <div className="health-bars">
            <div><span>Cash <b>{health.breakdown.cash}%</b></span><i><em style={{ width: `${health.breakdown.cash}%` }} /></i></div>
            <div><span>Margin <b>{health.breakdown.margin}%</b></span><i><em style={{ width: `${health.breakdown.margin}%` }} /></i></div>
            <div><span>Actions <b>{health.breakdown.actions}%</b></span><i><em style={{ width: `${health.breakdown.actions}%` }} /></i></div>
            <div><span>Pipeline <b>{health.breakdown.pipeline}%</b></span><i><em style={{ width: `${health.breakdown.pipeline}%` }} /></i></div>
          </div>
        </article>
      </div>

      <div className="metric-strip">
        <button onClick={() => go('finances')}><span>MONTHLY REVENUE <ArrowUpRight size={14} /></span><strong>{money(finance.revenue)}</strong><small>From your inputs</small></button>
        <button onClick={() => go('finances')}><span>GROSS MARGIN <ArrowUpRight size={14} /></span><strong>{margin.toFixed(0)}%</strong><small>{margin >= marginTarget.min && margin <= marginTarget.max ? `Within target` : `Review margins`}</small></button>
        <button onClick={() => go('finances')}><span>OPERATING RESULT <ArrowUpRight size={14} /></span><strong>{money(operating)}</strong><small>Calculated</small></button>
        <button onClick={() => go('plans')}><span>ACTIONS COMPLETE <ArrowUpRight size={14} /></span><strong>{completed}<i> / {actions.length}</i></strong><small>{actions.length - completed} priorities still open</small></button>
      </div>

      <div className="lower-grid">
        <article className="actions-panel">
          <div className="section-head">
            <div><p className="eyebrow">THIS WEEK</p><h3>Priorities that matter</h3></div>
            <button className="text-btn" onClick={() => go('plans')}>View all <ArrowRight size={15} /></button>
          </div>
          <div className="action-list">
            {actions.slice(0, 3).map(a => (
              <button className={`action-row ${a.done ? 'done' : ''}`} key={a.id} onClick={() => toggleAction(a.id)}>
                {a.done ? <Check size={16} /> : <Circle size={16} />}
                <div><strong>{a.title}</strong><span>Due {a.due} · {a.area}</span></div>
                <i>Impact: {a.impact}</i>
              </button>
            ))}
          </div>
        </article>
        <article className="cash-panel">
          <div className="section-head">
            <div><p className="eyebrow">CASH TRAJECTORY</p><h3>Stability check</h3></div>
            <button className="icon-btn" onClick={() => go('finances')} aria-label="View finances"><TrendingUp size={18} /></button>
          </div>
          <div className="cash-chart">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={cashData}>
                <defs>
                  <linearGradient id="cash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b9a06c" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#b9a06c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis hide />
                <Area type="monotone" dataKey="forecast" stroke="#b9a06c" strokeWidth={2} fill="url(#cash)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <footer><ShieldCheck size={15} />Based on your inputs and assumptions.</footer>
        </article>
      </div>
    </section>
  )
}