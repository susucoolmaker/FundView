export type BusinessType = 'recharge' | 'withdraw' | 'deposit' | 'sales'
export type RecordStatus =
  | '待处理'
  | '处理中'
  | '提现成功'
  | '提现失败'
  | '已驳回'
  | '已取消'
  | '已生效'
  | '已完成'
  | '已失效'
export type DepositType =
  | '保证金缴纳'
  | '保证金补缴'
  | '保证金扣除'
  | '保证金退回'
  | '保证金调整'
export type SettlementStatus = '待结款' | '结款中' | '已结款' | '结款失败' | '部分结款'
export type RechargeStatus = '充值成功' | '充值失败'
export type DatePreset = 'today' | 'month' | 'lastMonth' | 'custom'

export interface Merchant {
  id: string
  name: string
  realNameCode: string
  walletBalance: number
  administrator: string
  maskedPhone: string
  role: string
}

export interface Store {
  id: string
  name: string
  code: string
  boundEmployeeCount: number
  bindingStatus: '已绑定' | '未绑定' | '绑定异常' | '已停用'
  currentDepositBalance: number
}

export interface QueryCondition {
  datePreset: DatePreset
  startDate: string
  endDate: string
  storeId: 'all' | string
  keyword: string
}

export interface BaseRecord {
  id: string
  merchantId: string
  storeId: string
  date: string
  amount: number
  remark?: string
  voucherImages: string[]
}

export interface RechargeRecord extends BaseRecord {
  type: 'recharge'
  serialNumber: string
  status: RechargeStatus
  payerName: string
  rechargeMethod?: string
  payerAccount?: string
  receiverAccount?: string
  createdAt?: string
  operator?: string
}

export interface WithdrawRecord extends BaseRecord {
  type: 'withdraw'
  serialNumber: string
  updatedAt: string
  status: Extract<
    RecordStatus,
    '待处理' | '处理中' | '提现成功' | '提现失败' | '已驳回' | '已取消'
  >
  failureReason?: string
  rejectReason?: string
  bankName?: string
}

export interface DepositRecord extends BaseRecord {
  type: 'deposit'
  serialNumber: string
  depositType: DepositType
  payerName: string
  payeeName: string
  createdAt: string
  updatedAt: string
  status: Extract<
    RecordStatus,
    '待处理' | '处理中' | '已生效' | '已完成' | '已驳回' | '已失效'
  >
  balanceBefore?: number
  balanceAfter?: number
}

export interface SalesRecord extends Omit<BaseRecord, 'voucherImages'> {
  type: 'sales'
  salesOrderNumber: string
  productName: string
  productModel: string
  quantity: number
  unitPrice: number
  discountAmount: number
  settlementAmount: number
  settlementStatus: SettlementStatus
  settlementTime?: string
  paymentMethod: string
  salesperson: string
}

export type BusinessRecord = RechargeRecord | WithdrawRecord | DepositRecord | SalesRecord

export interface Notice {
  id: string
  title: string
  content: string
  tone: 'success' | 'warning' | 'failure' | 'neutral'
}
