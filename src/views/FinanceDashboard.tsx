import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '@/lib/api/client'

type DashboardAccount = {
  id: string
  name: string
  account_type: string
  currency: string
  current_balance: string | number
}

type TrendRecord = {
  period_key: string
  currency: string
  income: string | number
  expenses: string | number
}

type ExpenseCategory = {
  category: string
  currency: string
  total: string | number
}

type DashboardData = {
  trend: TrendRecord[]
  expenseCategories: ExpenseCategory[]
  accounts: DashboardAccount[]
}

type Props = {
  organizationId?: string
  period: 'day' | 'month' | 'year'
  date: string
  refreshToken: number
}

const chartColours = ['#263d35', '#b28b52', '#71877c', '#b8a58a', '#8b6f63', '#a9b9ae', '#6e7880', '#d0bd9e']

function money(value: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString('en-KE')}`
  }
}

export default function FinanceDashboard({ organizationId, period, date, refreshToken }: Props) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currency, setCurrency] = useState('')

  useEffect(() => {
    if (!organizationId) {
      setData(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    api.get<DashboardData>(
      `/organizations/${organizationId}/finances/dashboard?period=${period}&date=${encodeURIComponent(date)}`,
    ).then(result => {
      if (cancelled) return
      setData(result)
      const currencies = Array.from(new Set([
        ...result.trend.map(row => row.currency),
        ...result.expenseCategories.map(row => row.currency),
        ...result.accounts.map(row => row.currency),
      ])).sort()
      setCurrency(current => currencies.includes(current) ? current : (currencies.includes('KES') ? 'KES' : (currencies[0] || 'KES')))
    }).catch(err => {
      if (!cancelled) {
        setData(null)
        setError(err instanceof Error ? err.message : 'Could not load dashboard data.')
      }
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [organizationId, period, date, refreshToken])

  const periodLabel = period === 'day' ? 'Daily' : period === 'month' ? 'Monthly' : 'Yearly'
  const periodDescription = period === 'day' ? 'selected day' : period === 'month' ? 'selected month' : 'selected year'

  const trendChart = useMemo(() => {
    const selected = new Date(`${date}T12:00:00`)
    if (Number.isNaN(selected.getTime())) return []

    let keys: string[] = []
    if (period === 'day') {
      keys = [date]
    } else if (period === 'month') {
      const year = selected.getFullYear()
      const month = selected.getMonth()
      const days = new Date(year, month + 1, 0).getDate()
      keys = Array.from({ length: days }, (_, index) =>
        `${year}-${String(month + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`)
    } else {
      const year = selected.getFullYear()
      keys = Array.from({ length: 12 }, (_, index) =>
        `${year}-${String(index + 1).padStart(2, '0')}`)
    }

    const records = new Map(
      (data?.trend ?? [])
        .filter(row => row.currency === currency)
        .map(row => [row.period_key, row]),
    )

    return keys.map(key => {
      const record = records.get(key)
      const label = period === 'year'
        ? new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, 1)
            .toLocaleDateString('en-KE', { month: 'short' })
        : period === 'month'
          ? String(Number(key.slice(8, 10)))
          : new Date(`${key}T12:00:00`)
              .toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })

      return {
        period_key: key,
        label,
        income: Number(record?.income ?? 0),
        expenses: Number(record?.expenses ?? 0),
      }
    })
  }, [data, date, currency, period])

  const categories = useMemo(
    () => (data?.expenseCategories ?? [])
      .filter(row => row.currency === currency)
      .map(row => ({ name: row.category || 'Uncategorised', value: Number(row.total) }))
      .filter(row => row.value > 0)
      .sort((a, b) => b.value - a.value),
    [data, currency],
  )

  const accounts = (data?.accounts ?? []).filter(account => account.currency === currency)
  const hasTransactions = trendChart.some(row => row.income > 0 || row.expenses > 0)
  const totalIncome = trendChart.reduce((sum, row) => sum + row.income, 0)
  const totalExpenses = trendChart.reduce((sum, row) => sum + row.expenses, 0)

  return (
    <section className="finance-dashboard" aria-label="Financial dashboard">
      <div className="finance-dashboard-heading">
        <div>
          <p className="eyebrow">FINANCIAL OVERVIEW</p>
          <h4>Performance at a glance</h4>
          <p className="ledger-subtitle">Based on saved transactions for the {periodDescription}, not forecast assumptions.</p>
        </div>
        <label className="dashboard-currency">
          Currency
          <select value={currency} onChange={event => setCurrency(event.target.value)} disabled={!data}>
            {Array.from(new Set([
              ...(data?.trend ?? []).map(row => row.currency),
              ...(data?.expenseCategories ?? []).map(row => row.currency),
              ...(data?.accounts ?? []).map(row => row.currency),
            ])).sort().map(code => <option value={code} key={code}>{code}</option>)}
            {!data && <option value="KES">KES</option>}
          </select>
        </label>
      </div>

      {error && <p className="ledger-error" role="alert">{error}</p>}
      {loading && <p className="ledger-message">Updating dashboard from saved records…</p>}

      <div className="dashboard-metrics">
        <article className="dashboard-metric">
          <span>{periodLabel} income</span>
          <strong>{money(totalIncome, currency)}</strong>
        </article>
        <article className="dashboard-metric">
          <span>{periodLabel} expenses</span>
          <strong>{money(totalExpenses, currency)}</strong>
        </article>
        <article className="dashboard-metric">
          <span>{periodLabel} operating result</span>
          <strong className={totalIncome - totalExpenses >= 0 ? 'positive' : 'negative'}>
            {money(totalIncome - totalExpenses, currency)}
          </strong>
        </article>
      </div>

      <div className="dashboard-chart-grid">
        <article className="dashboard-chart-card">
          <div className="dashboard-card-heading">
            <div><p className="eyebrow">{periodLabel.toUpperCase()} TREND</p><h5>Income vs expenses</h5></div>
          </div>
          {!hasTransactions ? (
            <p className="dashboard-empty">No income or expense transactions are available for this currency and period yet.</p>
          ) : (
            <div className="dashboard-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendChart} margin={{ top: 10, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e1d7" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#77756f' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#77756f' }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip formatter={(value) => money(Number(value), currency)} />
                  <Bar dataKey="income" name="Income" fill="#344f43" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#b28b52" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>

        <article className="dashboard-chart-card">
          <div className="dashboard-card-heading">
            <div><p className="eyebrow">EXPENSE CONTROL · {periodDescription.toUpperCase()}</p><h5>Expense categories</h5></div>
          </div>
          {categories.length === 0 ? (
            <p className="dashboard-empty">No saved expenses are available for this currency and period yet.</p>
          ) : (
            <>
              <div className="dashboard-chart dashboard-pie-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="76%" innerRadius="45%" paddingAngle={2}>
                      {categories.map((entry, index) => (
                        <Cell key={`${entry.name}-${index}`} fill={chartColours[index % chartColours.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => money(Number(value), currency)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="dashboard-category-list">
                {categories.slice(0, 6).map((category, index) => (
                  <div className="dashboard-category-row" key={`${category.name}-${index}`}>
                    <span><i style={{ background: chartColours[index % chartColours.length] }} />{category.name}</span>
                    <strong>{money(category.value, currency)}</strong>
                  </div>
                ))}
              </div>
            </>
          )}
        </article>
      </div>

      <article className="dashboard-chart-card dashboard-balance-card">
        <div className="dashboard-card-heading">
          <div><p className="eyebrow">CASH POSITION</p><h5>Balances by account</h5></div>
        </div>
        {accounts.length === 0 ? (
          <p className="dashboard-empty">Create an account to see its saved balance here.</p>
        ) : (
          <div className="dashboard-balance-list">
            {accounts.map(account => (
              <div className="dashboard-balance-row" key={account.id}>
                <div><strong>{account.name}</strong><span>{account.account_type.replace('_', ' ')}</span></div>
                <strong>{money(Number(account.current_balance), currency)}</strong>
              </div>
            ))}
          </div>
        )}
        <p className="ledger-hint">Account balances are cash positions, not profit. Transfers between accounts do not count as income or expenses.</p>
      </article>
    </section>
  )
}
