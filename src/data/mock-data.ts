/**
 * ALL sample data for the prototype lives in this file.
 *
 * Nothing here is real. As each backend stage lands, replace the matching
 * export with data from the API and delete it from this file. When this file
 * is empty, the prototype is fully wired to real data.
 *
 * Replaced in: Stage 1 (user, workspace labels), Stage 3 (business, profile
 * completeness, context checklist), Stage 5 (chat replies, health, reports),
 * Stage 6 (actions, notices), Stage 10 (forecast shape, trends).
 */
import type { Action, Business, Finance, Message, Settings } from '@/types'

// ---- Account & workspace (Stage 1) -------------------------------------
export const mockUser = {
  firstName: 'Amara',
  fullName: 'Amara Otieno',
  initials: 'AO',
  role: 'Owner',
}

export const mockWorkspace = {
  label: 'AMANI WORKSPACE',
  monogram: 'AH',
  stageLabel: 'Established business',
}

// ---- Dates (hard-coded in the prototype) --------------------------------
export const mockDates = {
  todayLine: 'MONDAY, 26 OCTOBER',
  reportPeriod: 'September 2026',
  reportPeriodUpper: 'SEPTEMBER 2026',
  lastUpdated: '25 October 2026',
  monthlyReviewDay: 'Friday, 30 October',
  planReview: '23 November',
  newActionDue: '07 Nov',
  newActionReviewDate: '7 November 2026',
}

// ---- Business profile (Stage 3) ----------------------------------------
export const seedBusiness: Business = {
  name: 'Amani Home & Living',
  industry: 'Retail & homeware',
  stage: 'Established',
  location: 'Nairobi, Kenya',
  customers: 'Design-conscious urban homeowners',
  model: 'Direct-to-consumer retail',
  goal: 'Improve cash resilience while protecting our 35% gross margin.',
}

export const mockProfile = {
  completeness: 92,
  checklist: [
    { label: 'Business model confirmed', done: true },
    { label: 'Customer segment described', done: true },
    { label: 'September figures available', done: true },
    { label: 'Add average collection period', done: false },
  ],
}

// ---- Finance (Stage 2/10) ----------------------------------------------
export const seedFinance: Finance = {
  revenue: 300000,
  direct: 195000,
  expenses: 75000,
  price: 2500,
  variable: 1625,
  fixed: 75000,
}

export const mockMetrics = {
  revenueTrend: '8.4% from August',
  marginTarget: { min: 32, max: 38 },
}

/** Multipliers used to fabricate the illustrative chart. Replace with forecasts in Stage 10. */
export const mockCashShape = [
  { month: 'May', actual: 0.66, forecast: 0.7 },
  { month: 'Jun', actual: 0.8, forecast: 0.78 },
  { month: 'Jul', actual: 0.72, forecast: 0.83 },
  { month: 'Aug', actual: 0.94, forecast: 0.9 },
  { month: 'Sep', actual: 1, forecast: 0.98 },
  { month: 'Oct', actual: 1.12, forecast: 1.08 },
  { month: 'Nov', actual: null, forecast: 1.16 },
  { month: 'Dec', actual: null, forecast: 1.24 },
] as const

export const mockHealth = {
  score: 78,
  headline: 'Steady, with room to strengthen',
  summary: 'Profitability is sound. Cash visibility is your main opportunity.',
  bars: [
    { label: 'Profitability', rating: 'Strong', width: 86, warn: false },
    { label: 'Cash resilience', rating: 'Watch', width: 58, warn: true },
    { label: 'Customer momentum', rating: 'Good', width: 72, warn: false },
  ],
}

// ---- Actions (Stage 6) --------------------------------------------------
export const initialActions: Action[] = [
  { id: 1, title: 'Call 5 customers about delivery experience', area: 'Customer insight', due: 'Today', done: false, impact: 'High impact' },
  { id: 2, title: 'Review supplier terms for top 3 materials', area: 'Cost control', due: '28 Oct', done: false, impact: 'KSh 12k potential' },
  { id: 3, title: 'Update October cash collection forecast', area: 'Financial health', due: '30 Oct', done: false, impact: 'Reduce risk' },
  { id: 4, title: 'Document the weekly stock-count routine', area: 'Operations', due: '02 Nov', done: true, impact: 'Completed' },
]

/** Impact label restored when a completed action is reopened. */
export const activeImpactByArea: Record<string, string> = {
  'Customer insight': 'High impact',
  'Cost control': 'KSh 12k potential',
  'Financial health': 'Reduce risk',
  Operations: 'Improve consistency',
}

// ---- Mentor chat (Stage 5) ---------------------------------------------
export const initialMessages: Message[] = [
  {
    id: 1,
    from: 'lumini',
    text: 'Good morning, Amara. I’ve reviewed your latest figures. Your gross margin is healthy at 35%, but cash timing deserves attention before you pursue more sales.',
    detail: 'Based on your September figures · User reported, not audited',
  },
]

export const mockPromptChips = ['What should I do next?', 'Why is cash tight?', 'Should I change my pricing?']

export const mockChatDefault = {
  text: 'Before recommending a direction, I’d separate what is measured from what is assumed. Your current figures show a positive operating result, so the next useful step is to test the constraint with the least irreversible commitment.',
  detail: 'Recommendation · Moderate confidence · Based on saved business context',
}

export const mockChatCash = {
  text: 'Your business is profitable on the figures provided, so cash pressure is more likely a timing issue than a demand issue. Start by mapping when customers pay against when suppliers, payroll, and debt fall due. Growth can make this tighter if each sale consumes cash before collection.',
  detail: 'Diagnosis · Cash movement is not the same as profit · 3 inputs still needed',
}

export const mockChatNext = {
  text: 'Speak with five recent customers before increasing acquisition spend. It is low-cost, reversible, and will tell you whether delivery, product selection, or follow-up is limiting repeat purchases. Measure repeat-purchase intent and the reasons behind it.',
  detail: 'Ranked for impact, effort, cost and reversibility · Review in 7 days',
}

export const mockTopics = [
  { key: 'diagnose', title: 'Diagnose a challenge', desc: 'Find the constraint beneath the symptom.', q: 'Sales have slowed. Help me find the real cause.' },
  { key: 'compare', title: 'Compare a decision', desc: 'Weigh options, trade-offs and downside.', q: 'Help me compare hiring a salesperson with outsourcing.' },
  { key: 'numbers', title: 'Understand the numbers', desc: 'Calculate without hiding the assumptions.', q: 'Explain my break-even point and margin.' },
] as const

// ---- Notifications (Stage 11) ------------------------------------------
export const mockNotices = [
  { key: 'review', icon: 'clock', unread: true, title: 'Your monthly review is Friday', body: 'September figures are ready for your review.', when: '2 hours ago' },
  { key: 'due', icon: 'target', unread: false, title: 'One action is due today', body: 'Customer calls are still open in this week’s plan.', when: 'Today' },
] as const

// ---- Insights reports (Stage 5/10) -------------------------------------
export const reportNames = ['Financial health', 'Customer momentum', 'Cash & working capital', 'Monthly business review'] as const
export type ReportName = (typeof reportNames)[number]

export const mockReportLeads: Record<ReportName, string> = {
  'Financial health': 'Amani is generating a positive operating result. The immediate opportunity is not simply more sales, but better visibility over when cash enters and leaves the business.',
  'Customer momentum': 'Customer conversations are the missing evidence in your retention picture. Your next review should distinguish delivery satisfaction from repeat-purchase intent.',
  'Cash & working capital': 'Your reported profit does not yet explain cash timing. Collection period, supplier terms and inventory commitment are the three inputs needed for a complete diagnosis.',
  'Monthly business review': 'October closes with stronger reported performance and one clear learning: small, measurable operating reviews are creating better decisions.',
}

export const mockPlan = {
  title: 'Strengthen cash & customer retention',
  horizon: '30-day focus',
}

// ---- Defaults ------------------------------------------------------------
export const seedSettings: Settings = { weekly: true, actions: true, research: false, guided: true }
