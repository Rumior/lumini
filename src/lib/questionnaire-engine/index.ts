export type Question = {
  id: string
  prompt: string
  whyItMatters: string
  type: 'currency' | 'number' | 'percentage' | 'text' | 'select' | 'multiselect' | 'yesno'
  options?: string[]
  required?: boolean
  applicableStages?: string[]
  applicableIndustries?: string[]
  branchRules?: Array<{
    condition: (answer: any) => boolean
    nextQuestionId: string
  }>
}

export const questionBank: Question[] = [
  {
    id: 'goal',
    prompt: 'What is your primary goal right now?',
    whyItMatters: 'This determines which questions come next.',
    type: 'select',
    options: ['Start a business', 'Improve an existing business', 'Grow/expand', 'Fix finances', 'Make a decision'],
    required: true,
  },
  {
    id: 'revenue',
    prompt: 'What was your total revenue in the last completed period (e.g., last month)?',
    whyItMatters: 'We need actuals to calculate margins and cash position.',
    type: 'currency',
    applicableStages: ['Established', 'Growing'],
  },
  {
    id: 'direct_costs',
    prompt: 'What were your direct costs for the same period?',
    whyItMatters: 'Direct costs determine gross profit and margin.',
    type: 'currency',
    applicableStages: ['Established', 'Growing'],
  },
  {
    id: 'operating_expenses',
    prompt: 'What were your operating expenses for the same period?',
    whyItMatters: 'Needed to calculate operating result.',
    type: 'currency',
    applicableStages: ['Established', 'Growing'],
  },
  {
    id: 'cash_timing',
    prompt: 'Do you have a cash timing issue (pay before you collect)?',
    whyItMatters: 'Profit and cash are different - this affects recommendations.',
    type: 'yesno',
    applicableStages: ['Established', 'Growing', 'Early'],
  },
  {
    id: 'startup_capital',
    prompt: 'How much capital do you have available to start?',
    whyItMatters: 'Determines feasibility and what you can test affordably.',
    type: 'currency',
    applicableStages: ['Idea', 'Starting'],
  },
]

export class QuestionnaireEngine {
  private answers: Record<string, any> = {}

  getNextQuestion(currentQuestionId?: string): Question | null {
    if (!currentQuestionId || Object.keys(this.answers).length === 0) {
      return questionBank.find(q => q.id === 'goal') || null
    }

    const goal = this.answers.goal
    if (goal === 'Start a business') {
      if (this.answers.startup_capital === undefined) {
        return questionBank.find(q => q.id === 'startup_capital') || null
      }
      return null
    }
    if (goal === 'Improve an existing business' || goal === 'Fix finances' || goal === 'Grow/expand') {
      if (this.answers.revenue === undefined) return questionBank.find(q => q.id === 'revenue') || null
      if (this.answers.direct_costs === undefined) return questionBank.find(q => q.id === 'direct_costs') || null
      if (this.answers.operating_expenses === undefined) return questionBank.find(q => q.id === 'operating_expenses') || null
      if (this.answers.cash_timing === undefined) return questionBank.find(q => q.id === 'cash_timing') || null
      return null
    }
    return null
  }

  recordAnswer(questionId: string, answer: any): void {
    this.answers[questionId] = answer
  }

  getAnswers(): Record<string, any> {
    return { ...this.answers }
  }

  isComplete(): boolean {
    const keys = Object.keys(this.answers)
    if (keys.length === 0) return false
    return this.getNextQuestion(keys[keys.length - 1]) === null
  }
}
