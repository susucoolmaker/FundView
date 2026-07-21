import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useMerchantStore } from './merchant'

describe('useMerchantStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('keeps the merchant wallet fixed while store deposit metrics change', () => {
    const store = useMerchantStore()

    expect(store.walletBalance).toBe(568420.36)
    expect(store.currentDepositBalance).toBe(200000)

    store.selectStore('store-wangjing')
    expect(store.walletBalance).toBe(568420.36)
    expect(store.currentDepositBalance).toBe(80000)

    store.selectStore('store-zhongguancun')
    expect(store.walletBalance).toBe(568420.36)
    expect(store.currentDepositBalance).toBe(70000)

    store.selectStore('store-guomao')
    expect(store.walletBalance).toBe(568420.36)
    expect(store.currentDepositBalance).toBe(50000)

    store.selectStore('all')
    expect(store.currentDepositBalance).toBe(200000)
  })

  it('exposes one merchant, three stores, and two notices', () => {
    const store = useMerchantStore()

    expect(store.merchant).toMatchObject({
      name: '华北恒信通讯有限公司',
      realNameCode: 'SM2026070018',
      administrator: '张丽',
      maskedPhone: '138****8899',
      role: '商户管理员',
    })
    expect(store.stores).toEqual([
      {
        id: 'store-wangjing',
        name: '北京望京店',
        code: 'BJWJ001',
        boundEmployeeCount: 6,
        bindingStatus: '已绑定',
        currentDepositBalance: 80000,
      },
      {
        id: 'store-zhongguancun',
        name: '北京中关村店',
        code: 'BJZG001',
        boundEmployeeCount: 8,
        bindingStatus: '已绑定',
        currentDepositBalance: 70000,
      },
      {
        id: 'store-guomao',
        name: '北京国贸店',
        code: 'BJGM001',
        boundEmployeeCount: 4,
        bindingStatus: '绑定异常',
        currentDepositBalance: 50000,
      },
    ])
    expect(store.notices).toEqual([
      expect.objectContaining({ content: '当前商户账户状态正常', tone: 'success' }),
      expect.objectContaining({
        content: '北京国贸店有 1 名员工尚未完成绑定',
        tone: 'failure',
      }),
    ])
  })
})
