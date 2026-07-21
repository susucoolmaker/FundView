import { describe, expect, it } from 'vitest'

import { formatDateTime, formatMoney, getDateRange } from './format'

describe('formatMoney', () => {
  it('formats an amount with a currency symbol, grouping, and two decimals', () => {
    expect(formatMoney(328000)).toBe('¥328,000.00')
  })

  it('places an explicit positive or negative sign before the currency symbol', () => {
    expect(formatMoney(20000, { sign: '+' })).toBe('+¥20,000.00')
    expect(formatMoney(20000, { sign: '-' })).toBe('-¥20,000.00')
  })
})

describe('formatDateTime', () => {
  it('formats an ISO date-time without depending on the machine timezone', () => {
    expect(formatDateTime('2026-07-16T14:35:00+08:00')).toBe('2026-07-16 14:35')
  })
})

describe('getDateRange', () => {
  const referenceDate = new Date('2026-07-17T12:00:00+08:00')

  it('returns the reference calendar day for today', () => {
    expect(getDateRange('today', referenceDate)).toEqual({
      startDate: '2026-07-17',
      endDate: '2026-07-17',
    })
  })

  it('returns the full reference month', () => {
    expect(getDateRange('month', referenceDate)).toEqual({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
    })
  })

  it('returns the full previous month', () => {
    expect(getDateRange('lastMonth', referenceDate)).toEqual({
      startDate: '2026-06-01',
      endDate: '2026-06-30',
    })
  })
})
