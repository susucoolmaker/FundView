import { describe, expect, it } from 'vitest'

import { getStatusTone } from './status'

describe('getStatusTone', () => {
  it('maps successful and effective states to success', () => {
    expect(getStatusTone('提现成功')).toBe('success')
    expect(getStatusTone('已生效')).toBe('success')
    expect(getStatusTone('已结款')).toBe('success')
  })

  it('maps pending and in-progress states to warning', () => {
    expect(getStatusTone('待处理')).toBe('warning')
    expect(getStatusTone('结款中')).toBe('warning')
  })

  it('maps failed and rejected states to failure', () => {
    expect(getStatusTone('提现失败')).toBe('failure')
    expect(getStatusTone('已驳回')).toBe('failure')
    expect(getStatusTone('结款失败')).toBe('failure')
  })

  it('uses neutral for cancelled and unknown states', () => {
    expect(getStatusTone('已取消')).toBe('neutral')
    expect(getStatusTone('未知状态')).toBe('neutral')
  })
})
