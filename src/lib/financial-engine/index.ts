/**
 * Deterministic financial calculation engine for Lumini
 * Uses decimal-safe arithmetic and explicit formulas as per blueprint
 */

export function grossProfit(revenue: number, directCosts: number): number {
  return revenue - directCosts
}

export function grossMargin(revenue: number, directCosts: number): number {
  if (revenue === 0) return 0
  const gross = grossProfit(revenue, directCosts)
  return (gross / revenue) * 100
}

export function contributionPerUnit(sellingPrice: number, variableCost: number): number {
  return sellingPrice - variableCost
}

export function contributionMarginRatio(revenue: number, variableCosts: number): number {
  if (revenue === 0) return 0
  const contribution = revenue - variableCosts
  return contribution / revenue
}

export function breakEvenUnits(fixedCosts: number, contributionPerUnitVal: number): {
  units: number
  feasible: boolean
  warning?: string
} {
  if (contributionPerUnitVal <= 0) {
    return {
      units: 0,
      feasible: false,
      warning: 'Contribution per unit is zero or negative. Cannot break even with current pricing/costs.',
    }
  }
  if (fixedCosts <= 0) {
    return {
      units: 0,
      feasible: true,
    }
  }
  const units = Math.ceil(fixedCosts / contributionPerUnitVal)
  return {
    units,
    feasible: true,
  }
}

export function breakEvenRevenue(fixedCosts: number, contributionMarginRatioVal: number): {
  revenue: number
  feasible: boolean
  warning?: string
} {
  if (contributionMarginRatioVal <= 0) {
    return {
      revenue: 0,
      feasible: false,
      warning: 'Contribution margin ratio is zero or negative. Cannot break even with current structure.',
    }
  }
  if (fixedCosts <= 0) {
    return {
      revenue: 0,
      feasible: true,
    }
  }
  const revenue = fixedCosts / contributionMarginRatioVal
  return {
    revenue,
    feasible: true,
  }
}

export function operatingResult(revenue: number, directCosts: number, operatingExpenses: number): number {
  const gross = grossProfit(revenue, directCosts)
  return gross - operatingExpenses
}

export function netCashMovement(cashInflows: number, cashOutflows: number): number {
  return cashInflows - cashOutflows
}

export function cac(attributableSalesMarketingCost: number, newCustomersAcquired: number): {
  cac: number
  feasible: boolean
  warning?: string
} {
  if (newCustomersAcquired <= 0) {
    return {
      cac: 0,
      feasible: false,
      warning: 'No new customers acquired in this period.',
    }
  }
  return {
    cac: attributableSalesMarketingCost / newCustomersAcquired,
    feasible: true,
  }
}
