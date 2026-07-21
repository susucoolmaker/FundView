import type { BusinessType } from '@/types'

export interface RecordConfig {
  type: BusinessType
  tabLabel: string
  listTitle: string
  detailTitle: string
  searchPlaceholder: string
  emptyText: string
  amountLabel: string
  hasVoucher: boolean
}

export const recordConfigs: Record<BusinessType, RecordConfig> = {
  recharge: {
    type: 'recharge',
    tabLabel: '充值',
    listTitle: '充值记录',
    detailTitle: '充值详情',
    searchPlaceholder: '输入流水号或金额',
    emptyText: '暂无充值记录',
    amountLabel: '充值金额',
    hasVoucher: true,
  },
  withdraw: {
    type: 'withdraw',
    tabLabel: '提现',
    listTitle: '提现记录',
    detailTitle: '提现详情',
    searchPlaceholder: '输入流水号或金额',
    emptyText: '暂无提现记录',
    amountLabel: '提现金额',
    hasVoucher: true,
  },
  deposit: {
    type: 'deposit',
    tabLabel: '保证金',
    listTitle: '保证金记录',
    detailTitle: '保证金详情',
    searchPlaceholder: '输入流水号或金额',
    emptyText: '暂无保证金记录',
    amountLabel: '变动金额',
    hasVoucher: true,
  },
  sales: {
    type: 'sales',
    tabLabel: '销售',
    listTitle: '销售明细',
    detailTitle: '销售详情',
    searchPlaceholder: '输入销售单号或商品名称',
    emptyText: '暂无销售记录',
    amountLabel: '订单金额',
    hasVoucher: false,
  },
}
