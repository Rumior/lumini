export type Playbook = {
  id: string
  title: string
  symptoms: string[]
  questions: string[]
  diagnosticSteps: string[]
  recommendations: string[]
  requiredInputs: string[]
}

export const diagnosticPlaybooks: Playbook[] = [
  {
    id: 'pb-low-profit',
    title: 'Low Profit',
    symptoms: ['Margins are thin', 'Working hard but not profitable', 'Revenue up but profit down'],
    questions: ['What are your gross margins by product/service?', 'Are direct costs accurate?', 'Have prices changed recently?'],
    diagnosticSteps: ['Calculate gross margin', 'Review pricing vs costs', 'Check for cost creep'],
    recommendations: ['Review pricing strategy', 'Reduce direct costs', 'Focus on higher-margin products'],
    requiredInputs: ['revenue', 'direct_costs', 'operating_expenses'],
  },
  {
    id: 'pb-cash-shortage',
    title: 'Cash-flow Shortage',
    symptoms: ['Cannot pay suppliers', 'Running out of cash', 'Paying late'],
    questions: ['When do customers pay vs when do you pay suppliers?', 'Do you have outstanding receivables?', 'Any large upcoming expenses?'],
    diagnosticSteps: ['Map cash timing', 'Review receivables/payables', 'Identify cash gap'],
    recommendations: ['Improve collection', 'Negotiate payment terms', 'Cut non-essential expenses'],
    requiredInputs: ['revenue', 'cash_timing'],
  },
  {
    id: 'pb-pricing',
    title: 'Pricing & Break-even',
    symptoms: ['Unsure if profitable', 'Competitors cheaper', 'Need to raise prices'],
    questions: ['What is your break-even volume?', 'Is demand price-sensitive?', 'What is your minimum viable price?'],
    diagnosticSteps: ['Calculate contribution margin', 'Find break-even point', 'Test price sensitivity'],
    recommendations: ['Raise prices if margin is thin', 'Focus on value-add', 'Reduce variable costs'],
    requiredInputs: ['price', 'variable_cost', 'fixed_costs'],
  },
  {
    id: 'pb-sales-slow',
    title: 'Sales Are Not Growing',
    symptoms: ['Flat sales', 'Few new customers', 'Low conversion'],
    questions: ['Where are leads dropping off?', 'Who is your ideal customer?', 'What value proposition resonates?'],
    diagnosticSteps: ['Review sales funnel', 'Talk to customers', 'Analyze acquisition channels'],
    recommendations: ['Improve conversion', 'Refine target market', 'Test offers'],
    requiredInputs: ['customers', 'sales_channel'],
  },
]

export function matchPlaybook(symptoms: string[]): Playbook | null {
  const lower = symptoms.map(s => s.toLowerCase())
  for (const pb of diagnosticPlaybooks) {
    if (pb.symptoms.some(s => lower.some(l => l.includes(s.toLowerCase()) || s.toLowerCase().includes(l)))) {
      return pb
    }
  }
  return null
}
