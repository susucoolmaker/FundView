import type {
  DepositRecord,
  DepositType,
  RechargeRecord,
  SalesRecord,
  SettlementStatus,
  WithdrawRecord,
} from '@/types'
import depositVoucher from '@/assets/vouchers/deposit-voucher.svg'
import rechargeVoucher from '@/assets/vouchers/recharge-voucher.svg'
import withdrawVoucher from '@/assets/vouchers/withdraw-voucher.svg'

const merchantId = 'merchant-diwujie'
const storeIds = ['store-wangjing', 'store-zhongguancun', 'store-guomao'] as const
const fixtureDates = [
  '2026-07-17T09:30:00+08:00',
  '2026-07-10T14:20:00+08:00',
  '2026-06-22T11:15:00+08:00',
  '2026-05-18T16:45:00+08:00',
  '2026-03-06T10:05:00+08:00',
  '2025-12-12T13:40:00+08:00',
] as const
const fixtureSettlementDates = [
  '2026-07-17T11:30:00+08:00',
  '2026-07-10T16:20:00+08:00',
  '2026-06-22T13:15:00+08:00',
  '2026-05-18T18:45:00+08:00',
  '2026-03-06T12:05:00+08:00',
  '2025-12-12T15:40:00+08:00',
] as const

const id = (prefix: string, index: number) => `${prefix}-${String(index + 1).padStart(3, '0')}`

export const rechargeRecords: RechargeRecord[] = Array.from({ length: 12 }, (_, index) => ({
  id: id('recharge', index),
  type: 'recharge',
  merchantId,
  storeId: storeIds[index % storeIds.length],
  date:
    index === 2 ? '2026-07-12T11:15:00+08:00' : fixtureDates[index % fixtureDates.length],
  amount: [85000, 72000, 64000, 17500, 20000, 22500, 58000, 49000, 30000, 32500, 35000, 37500][
    index
  ],
  serialNumber: `CZ2026${String(index + 1).padStart(6, '0')}`,
  status: '充值成功',
  payerName: ['王欣', '李明', '张丽'][index % 3],
  rechargeMethod: index % 2 === 0 ? '银行转账' : '企业网银',
  payerAccount: `迪无界付款账户-${index + 1}`,
  receiverAccount: '平台资金账户-001',
  createdAt: fixtureDates[index % fixtureDates.length],
  operator: ['张明远', '王欣', '陈晓'][index % 3],
  remark:
    index === 0
      ? ''
      : index === 1
        ? '该笔充值用于暑期门店备货及员工设备升级，财务已逐项核对付款账户、到账金额与充值凭证，请审核后及时入账。'
        : `门店日常充值 ${index + 1}`,
  voucherImages: index === 2 ? [] : [rechargeVoucher],
}))

const withdrawStatuses: WithdrawRecord['status'][] = [
  '待处理',
  '处理中',
  '提现成功',
  '提现失败',
  '已驳回',
  '已取消',
  '提现成功',
  '处理中',
  '待处理',
  '提现成功',
]

export const withdrawRecords: WithdrawRecord[] = withdrawStatuses.map((status, index) => ({
  id: id('withdraw', index),
  type: 'withdraw',
  merchantId,
  storeId: index === 9 ? 'store-zhongguancun' : storeIds[index % storeIds.length],
  date:
    index === 2
      ? '2026-07-16T16:10:00+08:00'
      : index === 9
        ? '2026-07-08T10:25:00+08:00'
        : fixtureDates[(index + 1) % fixtureDates.length],
  amount: index === 2 ? 36500 : index === 6 ? 48000 : index === 9 ? 42000 : 3500 + index * 800,
  serialNumber: `TX2026${String(index + 1).padStart(6, '0')}`,
  updatedAt: fixtureSettlementDates[(index + 1) % fixtureSettlementDates.length],
  status,
  failureReason: status === '提现失败' ? '收款银行卡状态异常，银行渠道退回' : undefined,
  rejectReason: status === '已驳回' ? '提现凭证信息与申请金额不一致' : undefined,
  bankName: ['招商银行', '工商银行', '建设银行'][index % 3],
  remark: index === 6 ? '' : `门店经营款提现 ${index + 1}`,
  voucherImages: index === 7 ? [] : [withdrawVoucher],
}))

const depositTypes: DepositType[] = [
  '保证金缴纳',
  '保证金补缴',
  '保证金扣除',
  '保证金退回',
  '保证金调整',
  '保证金缴纳',
  '保证金补缴',
  '保证金扣除',
  '保证金退回',
  '保证金调整',
]
const depositStatuses: DepositRecord['status'][] = [
  '待处理',
  '处理中',
  '已生效',
  '已完成',
  '已驳回',
  '已失效',
  '已完成',
  '已生效',
  '处理中',
  '待处理',
]

export const depositRecords: DepositRecord[] = depositTypes.map((depositType, index) => {
  const amount = 2000 + index * 1000
  const balanceBefore = 50000 + index * 3000
  const isReduction = depositType === '保证金扣除' || depositType === '保证金退回'

  return {
    id: id('deposit', index),
    type: 'deposit',
    merchantId,
    storeId: storeIds[(index + 2) % storeIds.length],
    date: fixtureDates[(index + 2) % fixtureDates.length],
    amount,
    serialNumber: `BZJ2026${String(index + 1).padStart(6, '0')}`,
    depositType,
    payerName: isReduction ? '平台资金账户' : '华北恒信通讯有限公司',
    payeeName: isReduction ? '华北恒信通讯有限公司' : '平台资金账户',
    createdAt: fixtureDates[(index + 2) % fixtureDates.length],
    updatedAt: fixtureSettlementDates[(index + 2) % fixtureSettlementDates.length],
    status: depositStatuses[index],
    balanceBefore,
    balanceAfter: balanceBefore + (isReduction ? -amount : amount),
    remark: index === 9 ? '' : `保证金业务 ${index + 1}`,
    voucherImages: index === 5 ? [] : [depositVoucher],
  }
})

const settlementStatuses: SettlementStatus[] = [
  '待结款',
  '结款中',
  '已结款',
  '结款失败',
  '部分结款',
]
const productNames = [
  '华为 Mate 70 Pro 旗舰手机',
  '迪无界智能办公终端超长名称企业定制套装（含主机显示器键鼠及三年上门服务）',
  '荣耀 MagicBook Pro 笔记本电脑',
  '小米平板 7 Ultra',
  '智能穿戴设备组合套装',
  '企业级无线网络路由器',
] as const

export const salesRecords: SalesRecord[] = Array.from({ length: 24 }, (_, index) => {
  const quantity = (index % 3) + 1
  const unitPrice = 1299 + index * 175
  const discountAmount = index % 4 === 0 ? 200 : 0
  const amount = unitPrice * quantity
  const settlementStatus = settlementStatuses[index % settlementStatuses.length]

  return {
    id: id('sales', index),
    type: 'sales',
    merchantId,
    storeId: storeIds[index % storeIds.length],
    date: fixtureDates[index % fixtureDates.length],
    amount,
    remark: index === 3 ? '' : `线下销售订单 ${index + 1}`,
    salesOrderNumber: `XS2026${String(index + 1).padStart(6, '0')}`,
    productName: productNames[index % productNames.length],
    productModel: `DWJ-${String((index % 8) + 1).padStart(2, '0')}`,
    quantity,
    unitPrice,
    discountAmount,
    settlementAmount: amount - discountAmount,
    settlementStatus,
    settlementTime:
      settlementStatus === '已结款'
        ? fixtureSettlementDates[index % fixtureSettlementDates.length]
        : undefined,
    paymentMethod: ['微信支付', '支付宝', '银行卡'][index % 3],
    salesperson: ['李明', '周蕾', '孙宇'][index % 3],
  }
})
