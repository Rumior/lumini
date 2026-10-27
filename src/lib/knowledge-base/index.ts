export type KnowledgeItem = {
  id: string
  title: string
  body: string
  category: 'finance' | 'sales' | 'operations' | 'strategy' | 'starting'
  applicability: string[]
  limitations?: string
  version: string
  reviewedAt: string
}

export const knowledgeBase: KnowledgeItem[] = [
  {
    id: 'kb-cashflow',
    title: 'Profit vs Cash Flow',
    body: 'Profit and cash movement are not the same. Revenue is recorded when earned, cash when received. Expenses may be paid before or after they are recorded. Growth can strain cash even if profitable.',
    category: 'finance',
    applicability: ['Established', 'Growing', 'Early'],
    limitations: 'General principle - timing depends on payment terms',
    version: '1.0',
    reviewedAt: '2026-10-01',
  },
  {
    id: 'kb-breakeven',
    title: 'Break-even Analysis',
    body: 'Break-even units = Fixed costs / (Selling price - Variable cost per unit). Round up to whole units. If contribution per unit is negative, break-even is not achievable at current pricing.',
    category: 'finance',
    applicability: ['Starting', 'Early', 'Established', 'Growing'],
    version: '1.0',
    reviewedAt: '2026-10-01',
  },
  {
    id: 'kb-validation',
    title: 'Validate Before Committing',
    body: 'Test demand with the smallest reversible commitment: customer conversations, pre-orders, or a pilot. Measure actual conversion, not interest.',
    category: 'starting',
    applicability: ['Idea', 'Starting'],
    version: '1.0',
    reviewedAt: '2026-10-01',
  },
]

export function retrieveRelevantKnowledge(query: string, businessStage?: string): KnowledgeItem[] {
  const lower = query.toLowerCase()
  return knowledgeBase.filter(item => {
    const matchesQuery = item.title.toLowerCase().includes(lower) || item.body.toLowerCase().includes(lower)
    const matchesStage = !businessStage || item.applicability.includes(businessStage)
    return matchesQuery && matchesStage
  })
}
