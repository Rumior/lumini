import type { TrendPoint } from '@/types'

export function generateTrends(months = 6): TrendPoint[] {
  const data: TrendPoint[] = []
  const baseRevenue = 280000
  for (let i = months - 1; i >= 0; i--) {
    const month = new Date(2026, 8 - i, 1).toLocaleString('en-US', { month: 'short' })
    const revenue = baseRevenue + i * 5000 + (Math.random() - 0.5) * 10000
    const expenses = revenue * 0.65
    const gross = revenue - expenses
    data.push({ month, revenue: Math.round(revenue), expenses: Math.round(expenses), gross: Math.round(gross) })
  }
  return data
}

