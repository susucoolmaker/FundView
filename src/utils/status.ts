import type { Notice } from '@/types'

type StatusTone = Notice['tone']

const successStatuses = new Set(['提现成功', '已生效', '已完成', '已结款', '已绑定'])
const warningStatuses = new Set([
  '待处理',
  '处理中',
  '待结款',
  '待审核',
  '结款中',
  '部分结款',
  '未绑定',
])
const failureStatuses = new Set(['提现失败', '已驳回', '已失效', '结款失败', '绑定异常'])

export const getStatusTone = (status: string): StatusTone => {
  if (successStatuses.has(status)) return 'success'
  if (warningStatuses.has(status)) return 'warning'
  if (failureStatuses.has(status)) return 'failure'
  return 'neutral'
}
