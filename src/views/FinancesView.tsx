import { AlertCircle, ArrowDownRight, ArrowUpRight, CheckCircle2, Download, SlidersHorizontal } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { EvidenceTag } from '@/components/app/EvidenceTag'
import { useWorkspace } from '@/context/workspace-context'
import { money } from '@/lib/format'
import { mockDates } from '@/data/mock-data'
import type { Finance } from '@/types'
import { useState } from 'react'
import FinanceLedger from '@/views/FinanceLedger'
import { breakEvenUnits, contributionPerUnit, grossMargin } from '@/lib/financial-engine'

const reportedFields: { k: keyof Finance; l: string; h: string }[] = [
  { k: 'revenue', l: 'Revenue', h: 'Total sales for the period' },
  { k: 'direct', l: 'Direct costs', h: 'Costs tied to products sold' },
  { k: 'expenses', l: 'Operating expenses', h: 'Overheads for the same period' },
]
const unitFields: { k: keyof Finance; l: string }[] = [
  { k: 'price', l: 'Selling price / unit' },
  { k: 'variable', l: 'Variable cost / unit' },
  { k: 'fixed', l: 'Monthly fixed costs' },
]

export default function FinancesView() {
  const { finance, setFinance, gross, margin, operating, contribution, breakEven, cashData, exportCSV } = useWorkspace()
  const setField = (k: keyof Finance) => (e: React.ChangeEvent<HTMLInputElement>) => setFinance(f => ({ ...f, [k]: Number(e.target.value) }))
  const [scenario, setScenario] = useState({ priceDelta: 0, volumeDelta: 0, costDelta: 0 })

  const scenPrice = finance.price * (1 + scenario.priceDelta / 100)
  const scenVar = finance.variable * (1 + scenario.costDelta / 100)
  const scenContrib = contributionPerUnit(scenPrice, scenVar)
  const scenBE = breakEvenUnits(finance.fixed, scenContrib)
  const scenGrossMargin = grossMargin(finance.revenue * (1 + scenario.volumeDelta / 100), finance.direct * (1 + scenario.volumeDelta / 100))

  return (
    <section className="view finance-view">
      <div className="page-heading">
        <div><p className="date-line">FINANCIAL INTELLIGENCE</p><h1>Clarity behind every shilling.</h1><p>Transparent calculations, editable assumptions, no hidden arithmetic.</p></div>
        <button className="secondary-btn" onClick={exportCSV}><Download size={16} />Export summary</button>
      </div>

      <FinanceLedger />
      <div className="finance-layout">
        <article className="finance-inputs">
          <div className="section-head">
            <div><p className="eyebrow">{mockDates.reportPeriodUpper}</p><h3>Your reported figures</h3></div>
            <EvidenceTag>User reported</EvidenceTag>
          </div>
          {reportedFields.map(x => (
            <label className="money-field" key={x.k}>
              <span>{x.l}<small>{x.h}</small></span>
              <div><i>KSh</i><input type="number" min="0" value={finance[x.k]} onChange={setField(x.k)} /></div>
            </label>
          ))}
          <div className="formula-note"><AlertCircle size={16} /><p>Profit is not cash movement. Receivables, inventory, debt and owner withdrawals are not included here.</p></div>
        </article>

        <article className="finance-results">
          <p className="eyebrow">CALCULATED POSITION</p>
          <div className="result-main">
            <span>Operating result</span>
            <strong>{money(operating)}</strong>
            <small className={operating >= 0 ? 'positive' : 'negative'}>
              {operating >= 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
              {finance.revenue ? ((operating / finance.revenue) * 100).toFixed(1) : 0}% of revenue - before unreported items
            </small>
          </div>
          <div className="result-pair">
            <div><span>Gross profit</span><strong>{money(gross)}</strong><small>Revenue - direct costs</small></div>
            <div><span>Gross margin</span><strong>{margin.toFixed(1)}%</strong><small>Gross profit / revenue</small></div>
          </div>
          <div className="result-foot"><CheckCircle2 size={16} /><span>All values recalculate instantly from your inputs.</span></div>
        </article>
      </div>

      <article className="break-even">
        <div className="break-intro">
          <p className="eyebrow">UNIT ECONOMICS</p>
          <h2>Know your break-even point.</h2>
          <p>See how price, variable cost and fixed overhead shape the number of units you need to sell.</p>
          <div className="break-result">
            <span>BREAK-EVEN VOLUME</span>
            <strong>{breakEven || '-'} <small>units / month</small></strong>
            <p>{contribution > 0 ? `Each unit contributes ${money(contribution)} toward fixed costs.` : 'Contribution is zero or negative. Break-even cannot be reached at these unit economics.'}</p>
          </div>
        </div>
        <div className="unit-fields">
          {unitFields.map(x => (
            <label key={x.k}><span>{x.l}</span><div><i>KSh</i><input type="number" min="0" value={finance[x.k]} onChange={setField(x.k)} /></div></label>
          ))}
          <div className="contribution-track">
            <span>Contribution margin ratio <b>{finance.price ? Math.max(0, (contribution / finance.price) * 100).toFixed(0) : 0}%</b></span>
            <i><em style={{ width: `${Math.max(0, Math.min(100, (contribution / finance.price) * 100))}%` }} /></i>
          </div>
        </div>
      </article>

      <article className="break-even" style={{ marginTop: '24px' }}>
        <div className="break-intro">
          <p className="eyebrow"><SlidersHorizontal size={14} style={{ display: 'inline', marginRight: '4px' }} />SCENARIO ANALYSIS</p>
          <h2>What-if modelling</h2>
          <p>Test best/base/worst cases. All calculations use the deterministic financial engine.</p>
          <div className="break-result">
            <span>SCENARIO BREAK-EVEN</span>
            <strong>{scenBE.feasible ? scenBE.units : '-'} <small>units / month</small></strong>
            <p>{scenBE.feasible ? `With adjusted pricing/costs, each unit contributes ${money(scenContrib)}.` : scenBE.warning || 'Not feasible under these assumptions.'}</p>
            <p style={{ marginTop: '8px' }}>Scenario gross margin: <strong>{scenGrossMargin.toFixed(1)}%</strong></p>
          </div>
        </div>
        <div className="unit-fields">
          <label><span>Price change (%)</span><input type="range" min="-20" max="20" value={scenario.priceDelta} onChange={e => setScenario(s => ({ ...s, priceDelta: Number(e.target.value) }))} className="navy-range" /><small>{scenario.priceDelta > 0 ? '+' : ''}{scenario.priceDelta}%</small></label>
          <label><span>Variable cost change (%)</span><input type="range" min="-15" max="25" value={scenario.costDelta} onChange={e => setScenario(s => ({ ...s, costDelta: Number(e.target.value) }))} className="navy-range" /><small>{scenario.costDelta > 0 ? '+' : ''}{scenario.costDelta}%</small></label>
          <label><span>Volume change (%)</span><input type="range" min="-30" max="40" value={scenario.volumeDelta} onChange={e => setScenario(s => ({ ...s, volumeDelta: Number(e.target.value) }))} className="navy-range" /><small>{scenario.volumeDelta > 0 ? '+' : ''}{scenario.volumeDelta}%</small></label>
          <div className="formula-note"><AlertCircle size={16} /><p><strong>Profit vs cash:</strong> These are profit-based scenarios. Cash timing (receivables, payables, inventory) can differ significantly.</p></div>
        </div>
      </article>

      <article className="forecast-panel">
        <div className="section-head">
          <div><p className="eyebrow">PERFORMANCE & OUTLOOK</p><h3>Actual result and planning forecast</h3></div>
          <div className="legend"><span className="actual">Actual</span><span className="forecast">Forecast</span></div>
        </div>
        <div className="large-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashData} margin={{ top: 12, right: 12, bottom: 0, left: -12 }}>
              <defs>
                <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#af915f" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#af915f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#dedbd3" strokeDasharray="2 4" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#77756e', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#77756e', fontSize: 11 }} tickFormatter={v => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={v => money(Number(v))} contentStyle={{ border: '1px solid #d8d3c8', background: '#fffdf8', borderRadius: 2 }} />
              <Area type="monotone" dataKey="actual" connectNulls={false} stroke="#8d7345" strokeWidth={2.5} fill="url(#actualFill)" />
              <Area type="monotone" dataKey="forecast" stroke="#162638" strokeWidth={1.8} strokeDasharray="5 5" fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="chart-note">Forecast is an illustrative planning scenario derived from your current result, not a guarantee or externally verified market forecast.</p>
      </article>
    </section>
  )
}
