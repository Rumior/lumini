import { useState } from 'react'
import { Check, CheckCircle2, Circle, Plus, Sparkles, Trash2, Clock, Target, DollarSign, AlertTriangle } from 'lucide-react'
import { useWorkspace } from '@/context/workspace-context'
import { useGo } from '@/hooks/use-go'
import { mockDates, mockPlan } from '@/data/mock-data'

type Filter = 'Active' | 'Completed' | 'All'
const filters: Filter[] = ['Active', 'Completed', 'All']

export default function PlansView() {
  const go = useGo()
  const { actions, completed, toggleAction, removeAction, openNewAction } = useWorkspace()
  const [filter, setFilter] = useState<Filter>('Active')
  const [expanded, setExpanded] = useState<number | null>(null)

  const visible = actions.filter(a => filter === 'All' || (filter === 'Active' ? !a.done : a.done))
  const pct = actions.length ? (completed / actions.length) * 100 : 0
  const count = (f: Filter) => (f === 'Active' ? actions.filter(a => !a.done).length : f === 'Completed' ? completed : actions.length)

  return (
    <section className="view plans-view">
      <div className="page-heading">
        <div><p className="date-line">ACCOUNTABILITY</p><h1>Turn thinking into traction.</h1><p>A small, deliberate plan with owners, dates and measurable outcomes.</p></div>
        <button className="primary-btn" onClick={() => openNewAction()}><Plus size={17} />New action</button>
      </div>
      <div className="plan-summary">
        <div><span>ACTIVE PLAN</span><h2>{mockPlan.title}</h2><p>{mockPlan.horizon} · Review on {mockDates.planReview}</p></div>
        <div className="completion-stat"><strong>{Math.round(pct)}%</strong><span>{completed} of {actions.length} complete</span><i><em style={{ width: `${pct}%` }} /></i></div>
      </div>
      <div className="plan-toolbar">
        <div>{filters.map(f => <button className={filter === f ? 'active' : ''} key={f} onClick={() => setFilter(f)}>{f}<span>{count(f)}</span></button>)}</div>
        <button className="secondary-btn" onClick={() => go('mentor')}><Sparkles size={15} />Ask for a recommendation</button>
      </div>
      <div className="plan-table">
        <div className="plan-table-head"><span>ACTION</span><span>AREA</span><span>DUE</span><span>EXPECTED VALUE</span><span /></div>
        {visible.map(a => (
          <div key={a.id}>
            <div className={`plan-row ${a.done ? 'is-done' : ''}`} onClick={() => setExpanded(expanded === a.id ? null : a.id)} style={{ cursor: 'pointer' }}>
              <div>
                <button className="check-btn" onClick={(e) => { e.stopPropagation(); toggleAction(a.id) }} aria-label={a.done ? 'Reopen action' : 'Complete action'}>{a.done ? <Check size={15} /> : <Circle size={17} />}</button>
                <strong>{a.title}</strong>
              </div>
              <span>{a.area}</span><time>{a.due}</time><span>{a.impact}</span>
              <button className="icon-btn delete-action" onClick={(e) => { e.stopPropagation(); removeAction(a.id) }} aria-label={`Delete ${a.title}`}><Trash2 size={16} /></button>
            </div>
            {expanded === a.id && (
              <div style={{ padding: '12px 16px 16px 52px', background: 'var(--surface-subtle, rgba(0,0,0,0.01))', borderBottom: '1px solid var(--border)', display: 'grid', gap: '8px', fontSize: '13px' }}>
                {a.reason && <div style={{ display: 'flex', gap: '8px' }}><Target size={14} style={{ marginTop: '2px', flexShrink: 0 }} /><div><strong>Reason</strong><p style={{ margin: 0, color: 'var(--text-muted)' }}>{a.reason}</p></div></div>}
                {a.successMetric && <div style={{ display: 'flex', gap: '8px' }}><CheckCircle2 size={14} style={{ marginTop: '2px', flexShrink: 0 }} /><div><strong>Success metric</strong><p style={{ margin: 0, color: 'var(--text-muted)' }}>{a.successMetric}{a.baselineValue !== undefined && a.targetValue !== undefined ? ` (Baseline: ${a.baselineValue} → Target: ${a.targetValue})` : ''}</p></div></div>}
                {a.estimatedCost !== undefined && <div style={{ display: 'flex', gap: '8px' }}><DollarSign size={14} style={{ marginTop: '2px', flexShrink: 0 }} /><div><strong>Estimated cost</strong><p style={{ margin: 0, color: 'var(--text-muted)' }}>KSh {a.estimatedCost.toLocaleString()}</p></div></div>}
                {a.followUpDate && <div style={{ display: 'flex', gap: '8px' }}><Clock size={14} style={{ marginTop: '2px', flexShrink: 0 }} /><div><strong>Follow-up</strong><p style={{ margin: 0, color: 'var(--text-muted)' }}>{a.followUpDate}</p></div></div>}
                {a.risk && <div style={{ display: 'flex', gap: '8px' }}><AlertTriangle size={14} style={{ marginTop: '2px', flexShrink: 0 }} /><div><strong>Risk</strong><p style={{ margin: 0, color: 'var(--text-muted)' }}>{a.risk}</p></div></div>}
                {a.expectedResult && <div style={{ display: 'flex', gap: '8px' }}><Sparkles size={14} style={{ marginTop: '2px', flexShrink: 0 }} /><div><strong>Expected result</strong><p style={{ margin: 0, color: 'var(--text-muted)' }}>{a.expectedResult}</p></div></div>}
                {a.owner && <div style={{ display: 'flex', gap: '8px' }}><Target size={14} style={{ marginTop: '2px', flexShrink: 0 }} /><div><strong>Owner</strong><p style={{ margin: 0, color: 'var(--text-muted)' }}>{a.owner}</p></div></div>}
                {a.actualOutcome && <div style={{ padding: '8px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px' }}><strong>Outcome</strong><p style={{ margin: '4px 0 0 0' }}>{a.actualOutcome}</p></div>}
              </div>
            )}
          </div>
        ))}
        {visible.length === 0 && (
          <div className="empty-state"><CheckCircle2 size={28} /><h3>Nothing here right now</h3><p>Switch views or add a new action to keep momentum.</p></div>
        )}
      </div>
    </section>
  )
}
