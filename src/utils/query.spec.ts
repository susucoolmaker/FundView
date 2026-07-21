import { describe, expect, it } from 'vitest'

import type { QueryCondition, RechargeRecord, SalesRecord } from '@/types'

import { matchesRecord, paginate } from './query'

const condition: QueryCondition = {
  datePreset: 'custom',
  startDate: '2026-07-01',
  endDate: '2026-07-31',
  storeId: 'all',
  keyword: '',
}

const recharge: RechargeRecord = {
  id: 'r1',
  type: 'recharge',
  merchantId: 'm1',
  storeId: 's1',
  date: '2026-07-16T14:35:00+08:00',
  amount: 50000,
  serialNumber: 'CZ202607160001',
  status: '充值成功',
  payerName: '王欣',
  voucherImages: [],
}

const sale: SalesRecord = {
  id: 's1',
  type: 'sales',
  merchantId: 'm1',
  storeId: 's1',
  date: '2026-07-16T15:00:00+08:00',
  amount: 6999,
  salesOrderNumber: 'XS202607160001',
  productName: '华为 Mate 系列手机',
  productModel: 'Mate',
  quantity: 1,
  unitPrice: 6999,
  discountAmount: 0,
  settlementAmount: 6999,
  settlementStatus: '已结款',
  paymentMethod: '微信支付',
  salesperson: '李明',
}

describe('matchesRecord', () => {
  it('matches a funding record by a partial serial number', () => {
    expect(matchesRecord(recharge, { ...condition, keyword: '071600' })).toBe(true)
  })

  it('matches a funding record only when the numeric keyword equals its amount', () => {
    expect(matchesRecord(recharge, { ...condition, keyword: '50000' })).toBe(true)
    expect(matchesRecord(recharge, { ...condition, keyword: '5000' })).toBe(false)
  })

  it('does not interpret scientific or hexadecimal syntax as a funding amount', () => {
    expect(matchesRecord(recharge, { ...condition, keyword: '5e4' })).toBe(false)
    expect(matchesRecord(recharge, { ...condition, keyword: '0xC350' })).toBe(false)
  })

  it('matches a sales record by a partial order number or product name', () => {
    expect(matchesRecord(sale, { ...condition, keyword: '160001' })).toBe(true)
    expect(matchesRecord(sale, { ...condition, keyword: 'Mate' })).toBe(true)
  })

  it('filters records by the inclusive ISO date range before keyword matching', () => {
    expect(
      matchesRecord(recharge, {
        ...condition,
        startDate: '2026-07-17',
        keyword: '50000',
      }),
    ).toBe(false)
  })

  it('filters records by store before keyword matching', () => {
    expect(matchesRecord(recharge, { ...condition, storeId: 's2', keyword: '50000' })).toBe(
      false,
    )
  })
})

describe('paginate', () => {
  it('returns the requested one-based page', () => {
    const records = Array.from({ length: 21 }, (_, index) => index + 1)

    expect(paginate(records, 1, 20)).toEqual(records.slice(0, 20))
    expect(paginate(records, 2, 20)).toEqual([21])
  })
})
