import type { BusinessRecord, QueryCondition } from '@/types'

export const matchesRecord = (record: BusinessRecord, condition: QueryCondition) => {
  const recordDate = record.date.slice(0, 10)

  if (recordDate < condition.startDate || recordDate > condition.endDate) return false
  if (condition.storeId !== 'all' && record.storeId !== condition.storeId) return false

  const keyword = condition.keyword.trim()
  if (!keyword) return true

  if (record.type === 'sales') {
    return record.salesOrderNumber.includes(keyword) || record.productName.includes(keyword)
  }

  const isDecimalAmount = /^\d+(?:\.\d+)?$/.test(keyword)
  const matchesAmount = isDecimalAmount && record.amount === Number(keyword)

  return record.serialNumber.includes(keyword) || matchesAmount
}

export const paginate = <T>(records: T[], page: number, pageSize: number) =>
  records.slice((page - 1) * pageSize, page * pageSize)
