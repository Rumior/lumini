import { useMemo, useState } from 'react'
import { ChevronRight, Download, Lightbulb, Plus, ShieldCheck } from 'lucide-react'
import { EvidenceTag } from '@/components/app/EvidenceTag'
import { useWorkspace } from '@/context/workspace-context'
import { money } from '@/lib/format'
import { mockDates, mockReportLeads, reportNames, type ReportName } from '@/data/mock-data'
import { computeHealthScore } from '@/lib/health'
import { generateTrends } from '@/lib/trends'

export default function InsightsView() {
  const { margin, operating, exportCSV, exportPDF, openNewAction, finance, actions } = useWorkspace()
  const [report, setReport] = useState<ReportName>('Financial health')
  const health = useMemo(() => computeHealthScore(finance, actions, 6), [finance, actions])
  const trends = useMemo(() => generateTrends(6), [])

  return (
    <section className="view insights-view">
      <div className="page-heading">
        <div><p className="date-line">DECISION RECORDS</p><h1>Insights & Reports</h1><p>Reports based on your actual data.</p></div>
        <div className="flex gap-2">
          <button className="secondary-btn" onClick={exportCSV}><Download size={16} />Export CSV</button>
          <button className="secondary-btn" onClick={exportPDF}><Download size={16} />Export Report</button>
        </div>
      </div>
      <div className="insights-layout">
        <div className="report-nav">
          {reportNames.map((r, i) => (
            <button className={report === r ? 'active' : ''} key={r} onClick={() => setReport(r)}><span>0{i + 1}</span><strong>{r}</strong><ChevronRight size={16} /></button>
          ))}
        </div>
        <article className="report-content">
          <div className="report-meta">
            <EvidenceTag>Calculated</EvidenceTag>
            <span>{mockDates.reportPeriodUpper}</span>
          </div>
          <h2>{report}</h2>
          <p className="report-lead">{mockReportLeads[report]}</p>
          <div className="report-findings">
            <h3>Health Score</h3>
            <div><span>{health.overall}</span><p><strong>Overall: {health.level}</strong>. {health.recommendations.join('; ')}</p></div>
            <h3 style={{marginTop:'1rem'}}>Trends (last 6 months)</h3>
            <div style={{display:'flex',gap:'1rem',flexWrap:'wrap'}}>
              {trends.map(t => (
                <div key={t.month} style={{padding:'0.5rem 1rem',background:'var(--muted)',borderRadius:'8px'}}><strong>{t.month}</strong>: Rev {money(t.revenue)} / Gross {money(t.gross)}</div>
              ))}
            </div>
            <h3 style={{marginTop:'1rem'}}>Key Metrics</h3>
            <div><span>GM</span><p><strong>Gross Margin {margin.toFixed(1)}%</strong>. Revenue {money(finance.revenue)}, Direct {money(finance.direct)}.</p></div>
            <div><span>OP</span><p><strong>Operating Result {money(operating)}</strong>. Expenses {money(finance.expenses)}.</p></div>
          </div>
          <div className="report-recommendation">
            <Lightbulb size={21} />
            <div><span>RECOMMENDED NEXT STEP</span><strong>Review unit economics</strong><p>Focus on pricing and cost structure using the Finances scenario analysis.</p></div>
            <button onClick={() => openNewAction('Review unit economics')} aria-label="Add as an action"><Plus size={17} /></button>
          </div>
          <footer><ShieldCheck size={15} />Based on your saved inputs.</footer>
        </article>
      </div>
    </section>
  )
}