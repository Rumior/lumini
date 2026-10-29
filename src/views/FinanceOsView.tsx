import { useState } from 'react'
import { Activity, CalendarDays, RefreshCw } from 'lucide-react'
import { useOrganization } from '@/context/OrganizationContext'
import FinanceDashboard from '@/views/FinanceDashboard'
import './FinanceOsView.css'

type Period = 'day' | 'month' | 'year'

function localDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatPeriod(date: string, period: Period) {
  const parsed = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return date

  if (period === 'day') {
    return parsed.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (period === 'month') {
    return parsed.toLocaleDateString('en-KE', {
      month: 'long',
      year: 'numeric',
    })
  }

  return String(parsed.getFullYear())
}

export default function FinanceOsView() {
  const { organization, isLoading: organizationLoading } = useOrganization()
  const [period, setPeriod] = useState<Period>('month')
  const [date, setDate] = useState(localDateString)
  const [refreshToken, setRefreshToken] = useState(0)

  return (
    <section className="view finance-os-native" aria-label="Finance OS">
      <header className="fos-heading">
        <div className="fos-heading-copy">
          <p className="fos-eyebrow">
            <Activity size={14} aria-hidden="true" />
            FINANCIAL INTELLIGENCE
          </p>
          <h1>Finance OS</h1>
          <p className="fos-subtitle">
            Understand your cash position, track performance, and make
            better-informed financial decisions.
          </p>
        </div>

        <button
          type="button"
          className="fos-refresh"
          onClick={() => setRefreshToken(value => value + 1)}
          disabled={!organization?.id || organizationLoading}
        >
          <RefreshCw size={15} aria-hidden="true" />
          Refresh data
        </button>
      </header>

      <section className="fos-control-bar" aria-label="Reporting controls">
        <div className="fos-period-control">
          <CalendarDays size={16} aria-hidden="true" />
          <label htmlFor="fos-period">Reporting period</label>
          <select
            id="fos-period"
            value={period}
            onChange={event => setPeriod(event.target.value as Period)}
          >
            <option value="day">Daily</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>

        <label className="fos-date-control">
          <span>Date</span>
          <input
            type="date"
            value={date}
            onChange={event => {
              if (event.target.value) setDate(event.target.value)
            }}
          />
        </label>

        <span className="fos-period-caption">
          Showing {formatPeriod(date, period)}
        </span>
      </section>

      {organizationLoading ? (
        <div className="fos-notice" role="status">
          Loading your organization…
        </div>
      ) : !organization?.id ? (
        <div className="fos-notice" role="status">
          <strong>No organization selected</strong>
          <p>
            Select or create an organization before viewing its financial data.
          </p>
        </div>
      ) : (
        <FinanceDashboard
          key={organization.id}
          organizationId={organization.id}
          period={period}
          date={date}
          refreshToken={refreshToken}
        />
      )}

      <footer className="fos-footer">
        <span> LUMINI / FINANCE OS </span>
        <span>Financial results are based on saved records.</span>
      </footer>
    </section>
  )
}
