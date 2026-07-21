import { afterEach, describe, expect, it } from 'vitest'

import type { QueryCondition } from '@/types'

import {
  depositRecords,
  rechargeRecords,
  salesRecords,
  withdrawRecords,
} from './records'
import { mockApi } from './service'

const defaultQuery = {
  datePreset: 'custom',
  startDate: '2025-01-01',
  endDate: '2026-12-31',
  storeId: 'all',
  keyword: '',
} as const satisfies QueryCondition

afterEach(() => {
  mockApi.setScenario('normal')
})

describe('record fixtures', () => {
  it('provides the required number of typed records for every business', () => {
    expect(rechargeRecords).toHaveLength(12)
    expect(withdrawRecords).toHaveLength(10)
    expect(depositRecords).toHaveLength(10)
    expect(salesRecords).toHaveLength(24)

    const allAmounts = [
      ...rechargeRecords,
      ...withdrawRecords,
      ...depositRecords,
      ...salesRecords,
    ].map((record) => record.amount)
    expect(allAmounts.every((amount) => typeof amount === 'number')).toBe(true)
  })

  it('covers every store and every requested funding and settlement state', () => {
    const allRecords = [
      ...rechargeRecords,
      ...withdrawRecords,
      ...depositRecords,
      ...salesRecords,
    ]
    expect(new Set(allRecords.map((record) => record.storeId))).toEqual(
      new Set(['store-wangjing', 'store-zhongguancun', 'store-guomao']),
    )
    expect(new Set(withdrawRecords.map((record) => record.status))).toEqual(
      new Set(['待处理', '处理中', '提现成功', '提现失败', '已驳回', '已取消']),
    )
    expect(new Set(depositRecords.map((record) => record.depositType))).toEqual(
      new Set(['保证金缴纳', '保证金补缴', '保证金扣除', '保证金退回', '保证金调整']),
    )
    expect(new Set(depositRecords.map((record) => record.status))).toEqual(
      new Set(['待处理', '处理中', '已生效', '已完成', '已驳回', '已失效']),
    )
    expect(new Set(salesRecords.map((record) => record.settlementStatus))).toEqual(
      new Set(['待结款', '结款中', '已结款', '结款失败', '部分结款']),
    )
  })

  it('spans today, this month, last month, and older dates', () => {
    const dates = [
      ...rechargeRecords,
      ...withdrawRecords,
      ...depositRecords,
      ...salesRecords,
    ].map((record) => record.date.slice(0, 10))

    expect(dates).toContain('2026-07-17')
    expect(dates.some((date) => date >= '2026-07-01' && date < '2026-07-17')).toBe(true)
    expect(dates.some((date) => date >= '2026-06-01' && date <= '2026-06-30')).toBe(true)
    expect(dates.some((date) => date < '2026-06-01')).toBe(true)
  })

  it('includes long and empty content plus failure, rejection, and voucher edge cases', () => {
    const fundingRecords = [...rechargeRecords, ...withdrawRecords, ...depositRecords]

    expect(fundingRecords.some((record) => record.remark === '')).toBe(true)
    expect(fundingRecords.some((record) => (record.remark?.length ?? 0) >= 40)).toBe(true)
    expect(salesRecords.some((record) => record.productName.length >= 30)).toBe(true)
    expect(
      withdrawRecords.some(
        (record) => record.status === '提现失败' && Boolean(record.failureReason),
      ),
    ).toBe(true)
    expect(
      withdrawRecords.some((record) => record.status === '已驳回' && Boolean(record.rejectReason)),
    ).toBe(true)
    expect(fundingRecords.some((record) => record.voucherImages.length === 0)).toBe(true)
  })

  it('never settles a sales order before its order time', () => {
    expect(
      salesRecords.every(
        (record) =>
          !record.settlementTime ||
          new Date(record.settlementTime).getTime() >= new Date(record.date).getTime(),
      ),
    ).toBe(true)
  })
})

describe('mockApi', () => {
  it('returns 20 sales records on the first page and the remainder on the second', async () => {
    const first = await mockApi.fetchRecords('sales', defaultQuery, 1, 20)
    const second = await mockApi.fetchRecords('sales', defaultQuery, 2, 20)

    expect(first).toMatchObject({ total: 24, hasMore: true })
    expect(first.items).toHaveLength(20)
    expect(second).toMatchObject({ total: 24, hasMore: false })
    expect(second.items).toHaveLength(4)
  })

  it('filters records with the shared query rules', async () => {
    const result = await mockApi.fetchRecords(
      'sales',
      { ...defaultQuery, storeId: 'store-wangjing', keyword: 'Mate' },
      1,
      20,
    )

    expect(result.items.length).toBeGreaterThan(0)
    expect(
      result.items.every(
        (record) =>
          record.type === 'sales' &&
          record.storeId === 'store-wangjing' &&
          record.productName.includes('Mate'),
      ),
    ).toBe(true)
  })

  it('returns a record detail and undefined for an unknown id', async () => {
    await expect(mockApi.fetchRecordDetail('recharge', 'recharge-001')).resolves.toMatchObject({
      id: 'recharge-001',
      type: 'recharge',
    })
    await expect(mockApi.fetchRecordDetail('recharge', 'missing')).resolves.toBeUndefined()
  })

  it.each(['network', 'expired', 'forbidden'] as const)(
    'exposes the dedicated %s failure without changing fixture data',
    async (scenario) => {
      const originalFirstRecord = rechargeRecords[0]
      mockApi.setScenario(scenario)

      await expect(mockApi.fetchRecords('recharge', defaultQuery, 1, 20)).rejects.toMatchObject({
        kind: scenario,
      })
      expect(rechargeRecords[0]).toBe(originalFirstRecord)
    },
  )
})
