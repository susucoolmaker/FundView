import type { Merchant, Notice, Store } from '@/types'

export const merchant: Merchant = {
  id: 'merchant-diwujie',
  name: '华北恒信通讯有限公司',
  realNameCode: 'SM2026070018',
  walletBalance: 568420.36,
  administrator: '张丽',
  maskedPhone: '138****8899',
  role: '商户管理员',
}

export const stores: Store[] = [
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
]

export const notices: Notice[] = [
  {
    id: 'notice-deposit',
    title: '账户状态',
    content: '当前商户账户状态正常',
    tone: 'success',
  },
  {
    id: 'notice-settlement',
    title: '员工绑定提醒',
    content: '北京国贸店有 1 名员工尚未完成绑定',
    tone: 'failure',
  },
]
