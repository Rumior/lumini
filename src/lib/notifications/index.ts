import type { Action, Finance, Notification } from '@/types'

export function generateNotifications(finance: Finance, actions: Action[]): Notification[] {
  const notifications: Notification[] = []
  const gross = finance.revenue - finance.direct
  const marginPct = finance.revenue > 0 ? (gross / finance.revenue) * 100 : 0
  if (marginPct < 30) {
    notifications.push({
      id: 'n-margin',
      type: 'warning',
      title: 'Low gross margin',
      message: `Gross margin is ${marginPct.toFixed(1)}% - below target of 35%`,
      read: false,
      createdAt: new Date().toISOString()
    })
  }
  const overdue = actions.filter(a => !a.done && new Date(a.due) < new Date())
  if (overdue.length > 0) {
    notifications.push({
      id: 'n-overdue',
      type: 'info',
      title: 'Overdue actions',
      message: `${overdue.length} action(s) are past due`,
      read: false,
      createdAt: new Date().toISOString()
    })
  }
  if (notifications.length === 0) {
    notifications.push({
      id: 'n-ok',
      type: 'success',
      title: 'All good',
      message: 'No immediate issues detected',
      read: false,
      createdAt: new Date().toISOString()
    })
  }
  return notifications
}
