import { describe, expect, it } from 'vitest'
import {
  breakEvenRevenue,
  breakEvenUnits,
  cac,
  contributionMarginRatio,
  contributionPerUnit,
  grossMargin,
  grossProfit,
  netCashMovement,
  operatingResult,
} from '../index'

describe('Financial Engine', () => {
  it('calculates gross profit correctly', () => {
    expect(grossProfit(300000, 195000)).toBe(105000)
  })

  it('calculates gross margin correctly', () => {
    expect(grossMargin(300000, 195000)).toBeCloseTo(35)
  })

  it('returns 0 margin when revenue is 0', () => {
    expect(grossMargin(0, 100)).toBe(0)
  })

  it('calculates contribution per unit', () => {
    expect(contributionPerUnit(2500, 1625)).toBe(875)
  })

  it('calculates contribution margin ratio', () => {
    expect(contributionMarginRatio(300000, 195000)).toBeCloseTo(0.35)
  })

  it('calculates break even units with rounding up', () => {
    const result = breakEvenUnits(75000, 875)
    expect(result.feasible).toBe(true)
    expect(result.units).toBe(86) // ceil(75000/875)
  })

  it('returns warning when contribution per unit is zero or negative', () => {
    const result = breakEvenUnits(75000, 0)
    expect(result.feasible).toBe(false)
    expect(result.warning).toBeDefined()
  })

  it('calculates break even revenue', () => {
    const result = breakEvenRevenue(75000, 0.35)
    expect(result.feasible).toBe(true)
    expect(result.revenue).toBeCloseTo(214285.71)
  })

  it('calculates operating result', () => {
    expect(operatingResult(300000, 195000, 75000)).toBe(30000)
  })

  it('calculates net cash movement', () => {
    expect(netCashMovement(100000, 80000)).toBe(20000)
  })

  it('calculates CAC', () => {
    const result = cac(12000, 5)
    expect(result.feasible).toBe(true)
    expect(result.cac).toBe(2400)
  })

  it('returns warning when no new customers acquired', () => {
    const result = cac(12000, 0)
    expect(result.feasible).toBe(false)
    expect(result.warning).toBeDefined()
  })
})
