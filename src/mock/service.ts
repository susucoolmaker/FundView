import type { BusinessRecord, BusinessType, QueryCondition } from '@/types'
import { matchesRecord, paginate } from '@/utils/query'

import { depositRecords, rechargeRecords, salesRecords, withdrawRecords } from './records'

export interface PageResult<T> {
  items: T[]
  total: number
  hasMore: boolean
}

export type MockScenario = 'normal' | 'network' | 'expired' | 'forbidden'

const recordMap: Record<BusinessType, BusinessRecord[]> = {
  recharge: rechargeRecords,
  withdraw: withdrawRecords,
  deposit: depositRecords,
  sales: salesRecords,
}

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds)
  })

let scenario: MockScenario = 'normal'

const assertScenario = () => {
  if (scenario !== 'normal') throw { kind: scenario }
}

export const mockApi = {
  setScenario(next: MockScenario) {
    scenario = next
  },

  async fetchRecords(
    type: BusinessType,
    query: QueryCondition,
    page: number,
    pageSize = 20,
  ): Promise<PageResult<BusinessRecord>> {
    await delay(180)
    assertScenario()

    const filtered = recordMap[type].filter((record) => matchesRecord(record, query))
    return {
      items: paginate(filtered, page, pageSize),
      total: filtered.length,
      hasMore: page * pageSize < filtered.length,
    }
  },

  async fetchRecordDetail(
    type: BusinessType,
    recordId: string,
  ): Promise<BusinessRecord | undefined> {
    await delay(120)
    assertScenario()
    return recordMap[type].find((record) => record.id === recordId)
  },
}
