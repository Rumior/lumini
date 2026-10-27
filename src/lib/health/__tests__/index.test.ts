import { describe, it, expect } from 'vitest'
import { computeHealthScore } from '../index'

describe('health scoring', () => {
  it('computes score', () => {
    const res = computeHealthScore({ revenue: 300000, direct: 195000, expenses: 75000, price: 2500, variable: 1625, fixed: 75000 }, [], 6)
    expect(res.overall).toBeGreaterThan(0)
    expect(res.level).toBeDefined()
  })
})

