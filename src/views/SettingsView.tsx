import { ArrowRight, Database, Download, Eye, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useWorkspace } from '@/context/workspace-context'
import type { Settings } from '@/types'

const toggles: { k: keyof Settings; t: string; d: string }[] = [
  { k: 'guided', t: 'Guided explanations', d: 'Use plain language and reveal advanced detail on demand.' },
  { k: 'weekly', t: 'Weekly business review', d: 'Prepare a concise review of metrics, actions and open questions.' },
  { k: 'actions', t: 'Action reminders', d: 'Show due and overdue priorities in your workspace.' },
  { k: 'research', t: 'External research', d: 'Allow current external sources when they materially improve a decision.' },
]

export default function SettingsView() {
  const { settings, setSettings, exportCSV, exportJSON, exportPDF, restoreDemo } = useWorkspace()

  return (
    <section className="view settings-view">
      <div className="page-heading">
        <div><p className="date-line">YOUR PREFERENCES</p><h1>A workspace on your terms.</h1><p>Control guidance, reviews and how your information is used.</p></div>
      </div>
      <div className="settings-layout">
        <div className="settings-main">
          <div className="settings-section">
            <h3>Guidance & reviews</h3>
            <p>Choose how Lumini supports your working rhythm.</p>
            {toggles.map(x => (
              <div className="setting-row" key={x.k}>
                <div><strong>{x.t}</strong><span>{x.d}</span></div>
                <button role="switch" aria-checked={settings[x.k]} aria-label={x.t} className={`switch ${settings[x.k] ? 'on' : ''}`} onClick={() => setSettings(s => ({ ...s, [x.k]: !s[x.k] }))}><i /></button>
              </div>
            ))}
          </div>
          <div className="settings-section">
            <h3>Data & portability</h3>
            <p>Your information remains inspectable and exportable.</p>
            <button className="data-action" onClick={exportCSV}><Download size={18} /><span><strong>Export CSV</strong><small>Download actions and summary data as CSV.</small></span><ArrowRight size={16} /></button>
            <button className="data-action" onClick={exportJSON}><Download size={18} /><span><strong>Export JSON</strong><small>Download full workspace data as JSON.</small></span><ArrowRight size={16} /></button>
            <button className="data-action" onClick={exportPDF}><Download size={18} /><span><strong>Export Report</strong><small>Download business report (text).</small></span><ArrowRight size={16} /></button>
            <button className="data-action" onClick={restoreDemo}><Database size={18} /><span><strong>Restore demo workspace</strong><small>Reset financial figures, actions and conversation to the original example.</small></span><ArrowRight size={16} /></button>
          </div>
        </div>
        <aside className="settings-aside">
          <ShieldCheck size={28} />
          <h3>Privacy is a product principle.</h3>
          <p>Lumini separates reported facts, calculations and assumptions so you stay in control of the story behind the numbers.</p>
          <span><LockKeyhole size={15} />Private workspace</span>
          <span><Eye size={15} />Explainable context</span>
          <span><Download size={15} />Portable data</span>
          <small>This preview stores changes only in this browser. No account or cloud sync is connected.</small>
        </aside>
      </div>
    </section>
  )
}
