import { describe, it, expect } from 'vitest'
import { generateNotifications } from '../index'

describe('notifications', () => {
  it('generates notifications', () => {
    const res = generateNotifications({ revenue: 100000, direct: 80000, expenses: 50000, price: 1000, variable: 800, fixed: 50000 }, [])
    expect(Array.isArray(res)).toBe(true)
    expect(res.length).toBeGreaterThan(0)
  })
})

