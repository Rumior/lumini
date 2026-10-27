import type { Action, Finance } from '@/types'
import type { HealthScore } from '@/types'

export function computeHealthScore(finance: Finance, actions: Action[], cashMonths: number): HealthScore {
  const gross = finance.revenue - finance.direct
  const marginPct = finance.revenue > 0 ? (gross / finance.revenue) * 100 : 0
  const marginScore = Math.min(100, Math.max(0, (marginPct / 40) * 100))
  const cashScore = Math.min(100, Math.max(0, (cashMonths / 6) * 100))
  const doneActions = actions.filter(a => a.done).length
  const actionScore = actions.length === 0 ? 0 : Math.min(100, (doneActions / actions.length) * 100)
  const pipelineScore = 70
  const overall = Math.round((marginScore * 0.3 + cashScore * 0.3 + actionScore * 0.25 + pipelineScore * 0.15))
  let level: HealthScore['level'] = 'ok'
  if (overall < 40) level = 'critical'
  else if (overall < 60) level = 'needs-attention'
  else if (overall >= 80) level = 'good'
  const recommendations: string[] = []
  if (marginPct < 30) recommendations.push('Improve gross margin - review pricing or direct costs')
  if (cashMonths < 3) recommendations.push('Low cash runway - focus on collections/cost reduction')
  if (actions.length > doneActions) recommendations.push('Complete planned actions to improve execution')
  if (recommendations.length === 0) recommendations.push('Business health looks stable')
  return {
    overall,
    breakdown: { cash: Math.round(cashScore), margin: Math.round(marginScore), actions: Math.round(actionScore), pipeline: pipelineScore },
    level,
    recommendations
  }
}

