import { ArrowRight, Building2, Check, LockKeyhole, Plus, Target, Sparkles } from 'lucide-react'
import { EvidenceTag } from '@/components/app/EvidenceTag'
import { useWorkspace } from '@/context/workspace-context'
import { useGo } from '@/hooks/use-go'
import { mockProfile } from '@/data/mock-data'
import type { Business } from '@/types'
import { QuestionnaireEngine } from '@/lib/questionnaire-engine'
import { useState } from 'react'

const essentials: { k: keyof Business; l: string }[] = [
  { k: 'name', l: 'Business name' },
  { k: 'industry', l: 'Industry' },
  { k: 'stage', l: 'Business stage' },
  { k: 'location', l: 'Location / service area' },
  { k: 'model', l: 'Business model' },
  { k: 'customers', l: 'Primary customers' },
]

const questionnaireEngine = new QuestionnaireEngine()

export default function BusinessView() {
  const go = useGo()
  const { business, setBusiness, showToast } = useWorkspace()
  const [currentQ, setCurrentQ] = useState(questionnaireEngine.getNextQuestion())
  const [answers, setAnswers] = useState<Record<string, any>>({})

  const handleAnswer = (qId: string, answer: any) => {
    questionnaireEngine.recordAnswer(qId, answer)
    setAnswers(questionnaireEngine.getAnswers())
    setCurrentQ(questionnaireEngine.getNextQuestion(qId))
  }

  return (
    <section className="view business-view">
      <div className="page-heading">
        <div><p className="date-line">BUSINESS MEMORY</p><h1>What Lumini understands.</h1><p>Inspect and correct the context behind every recommendation.</p></div>
        <EvidenceTag>{mockProfile.completeness}% complete</EvidenceTag>
      </div>
      <div className="profile-progress"><span style={{ width: `${mockProfile.completeness}%` }} /></div>
      <div className="business-layout">
        <form className="business-form" onSubmit={e => { e.preventDefault(); showToast('Business profile saved') }}>
          <div className="form-section">
            <div className="form-section-title"><Building2 size={19} /><div><h3>Business essentials</h3><p>The basic context used across your workspace.</p></div></div>
            <div className="field-grid">
              {essentials.map(x => (
                <label key={x.k}><span>{x.l}</span><input value={business[x.k]} onChange={e => setBusiness(b => ({ ...b, [x.k]: e.target.value }))} required /></label>
              ))}
            </div>
          </div>
          <div className="form-section">
            <div className="form-section-title"><Target size={19} /><div><h3>Current direction</h3><p>Your active goal guides how recommendations are ranked.</p></div></div>
            <label className="full-field"><span>Primary business goal</span><textarea rows={4} value={business.goal} onChange={e => setBusiness(b => ({ ...b, goal: e.target.value }))} /></label>
          </div>
          <div className="form-section">
            <div className="form-section-title"><Sparkles size={19} /><div><h3>Adaptive questionnaire</h3><p>Answer only what’s needed based on your goal and stage.</p></div></div>
            {currentQ ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <p style={{ fontWeight: 500 }}>{currentQ.prompt}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{currentQ.whyItMatters}</p>
                </div>
                {currentQ.type === 'select' && currentQ.options && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {currentQ.options.map(opt => (
                      <button key={opt} type="button" onClick={() => handleAnswer(currentQ.id, opt)} className="ghost-btn">{opt}</button>
                    ))}
                  </div>
                )}
                {currentQ.type === 'currency' && (
                  <label className="full-field"><span>Amount</span><input type="number" onBlur={(e) => e.target.value && handleAnswer(currentQ.id, Number(e.target.value))} /></label>
                )}
                {currentQ.type === 'yesno' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => handleAnswer(currentQ.id, true)} className="ghost-btn">Yes</button>
                    <button type="button" onClick={() => handleAnswer(currentQ.id, false)} className="ghost-btn">No</button>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Questionnaire complete based on current answers.</p>
            )}
            {Object.keys(answers).length > 0 && (
              <details style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                <summary>Captured answers</summary>
                <pre style={{ whiteSpace: 'pre-wrap', marginTop: '8px' }}>{JSON.stringify(answers, null, 2)}</pre>
              </details>
            )}
          </div>
          <div className="form-actions">
            <span><LockKeyhole size={14} />Only you can access this workspace</span>
            <button className="primary-btn" type="submit">Save changes <Check size={16} /></button>
          </div>
        </form>
        <aside className="context-aside">
          <p className="eyebrow">CONTEXT QUALITY</p>
          <h3>A clear foundation</h3>
          <p>Lumini has enough context for financial diagnosis and weekly planning.</p>
          <ul>
            {mockProfile.checklist.map(c => (
              <li key={c.label} className={c.done ? undefined : 'missing'}>{c.done ? <Check size={15} /> : <Plus size={15} />}{c.label}</li>
            ))}
          </ul>
          <button onClick={() => go('finances')}>Review financial inputs <ArrowRight size={15} /></button>
          <div className="fact-legend">
            <strong>How facts are labelled</strong>
            <span><i className="reported" />User reported</span>
            <span><i className="calculated" />Calculated</span>
            <span><i className="assumed" />Assumption</span>
          </div>
        </aside>
      </div>
    </section>
  )
}
