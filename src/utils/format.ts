import type { DatePreset } from '@/types'

interface DateRange {
  startDate: string
  endDate: string
}

const formatCalendarDate = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

export const formatMoney = (value: number, options: { sign?: '+' | '-' } = {}) =>
  `${options.sign ?? ''}¥${value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

export const formatDateTime = (value: string) => value.slice(0, 16).replace('T', ' ')

export const getDateRange = (
  preset: Exclude<DatePreset, 'custom'>,
  referenceDate = new Date(),
): DateRange => {
  const year = referenceDate.getFullYear()
  const monthIndex = referenceDate.getMonth()

  if (preset === 'today') {
    const date = formatCalendarDate(year, monthIndex + 1, referenceDate.getDate())
    return { startDate: date, endDate: date }
  }

  const targetMonthIndex = preset === 'lastMonth' ? monthIndex - 1 : monthIndex
  const start = new Date(year, targetMonthIndex, 1)
  const end = new Date(year, targetMonthIndex + 1, 0)

  return {
    startDate: formatCalendarDate(start.getFullYear(), start.getMonth() + 1, 1),
    endDate: formatCalendarDate(end.getFullYear(), end.getMonth() + 1, end.getDate()),
  }
}
