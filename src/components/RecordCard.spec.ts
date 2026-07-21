import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'

import { depositRecords, rechargeRecords, salesRecords, withdrawRecords } from '@/mock/records'

import RecordCard from './RecordCard.vue'
import DepositRecordBody from './record-cards/DepositRecordBody.vue'
import RecordAmountRow from './record-cards/RecordAmountRow.vue'
import RechargeRecordBody from './record-cards/RechargeRecordBody.vue'
import SalesRecordBody from './record-cards/SalesRecordBody.vue'
import recordAmountRowSource from './record-cards/RecordAmountRow.vue?raw'
import WithdrawRecordBody from './record-cards/WithdrawRecordBody.vue'

const mountBody = (component: object, record: object) =>
  mount(component, {
    props: { record },
    global: { plugins: [createPinia()] },
  })

it('keeps recharge fields inside the typed recharge body', () => {
  const record = rechargeRecords[0]!
  const wrapper = mountBody(RechargeRecordBody, record)

  expect(wrapper.text()).toContain('充值金额')
  expect(wrapper.text()).toContain('日期')
  expect(wrapper.text()).toContain('2026-07-17 09:30')
  expect(wrapper.text()).toContain(record.serialNumber)
  expect(wrapper.text()).toContain('备注')
  expect(wrapper.text()).toContain('无备注')
  expect(wrapper.text()).not.toContain(record.rechargeMethod)
  expect(wrapper.text()).not.toContain('门店与时间')
  expect(wrapper.text()).not.toContain('北京望京店')
  expect(wrapper.text()).not.toContain('操作人')
  expect(wrapper.text()).not.toContain(record.operator)
})

it('keeps withdrawal list cards limited to amount, date, serial number, and remark', () => {
  const record = withdrawRecords.find(({ status }) => status === '提现失败')!
  const wrapper = mountBody(WithdrawRecordBody, record)

  expect(wrapper.text()).toContain('提现金额')
  expect(wrapper.text()).toContain('日期')
  expect(wrapper.text()).toContain(record.serialNumber)
  expect(wrapper.text()).toContain('备注')
  expect(wrapper.text()).toContain(record.remark)
  expect(wrapper.text()).not.toContain(record.status)
  expect(wrapper.text()).not.toContain(record.bankName)
  expect(wrapper.text()).not.toContain('门店与时间')
  expect(wrapper.text()).not.toContain('失败原因')
  expect(wrapper.text()).not.toContain(record.failureReason)
})

it('uses larger dark amount numbers in list cards', () => {
  expect(recordAmountRowSource).toContain('record-amount-row__value')
  expect(recordAmountRowSource).toMatch(
    /\.record-amount-row__value\s*\{[^}]*color:\s*var\(--color-text-primary\)[^}]*font-size:\s*36px/s,
  )
})

it('places the record amount value and arrow on the right side of the amount row', () => {
  const wrapper = mount(RecordAmountRow, {
    props: { label: '充值金额', value: 85000, sign: '+' },
  })

  expect(wrapper.get('.record-amount-row__label').text()).toBe('充值金额')
  expect(wrapper.get('.record-amount-row__value-side').text()).toContain('+¥85,000.00')
  expect(wrapper.find('.record-amount-row__value-side .record-amount-row__arrow').exists()).toBe(
    true,
  )
})

it('keeps deposit list cards limited to amount, date, serial number, normalized type, status, balance, and remark', () => {
  const record = depositRecords[4]!
  const wrapper = mountBody(DepositRecordBody, record)

  expect(wrapper.text()).toContain('金额')
  expect(wrapper.text()).toContain('日期')
  expect(wrapper.text()).toContain(record.serialNumber)
  expect(wrapper.text()).toContain('类型')
  expect(wrapper.text()).toContain('国补加盟交纳保证金')
  expect(wrapper.text()).not.toContain(record.depositType)
  expect(wrapper.text()).toContain(record.status)
  expect(wrapper.text()).toContain('变动后余额')
  expect(wrapper.text()).toContain('备注')
  expect(wrapper.text()).toContain(record.remark)
  expect(wrapper.text()).not.toContain('门店与时间')
  expect(wrapper.text()).not.toContain('北京望京店')
})

it('normalizes deposit return records as national-subsidy franchise deposit returns', () => {
  const record = depositRecords.find(({ depositType }) => depositType === '保证金退回')!
  const wrapper = mountBody(DepositRecordBody, record)

  expect(wrapper.text()).toContain('国补加盟退还保证金')
  expect(wrapper.text()).toContain('-¥')
})

it('keeps sales list cards limited to product name, sales date, sales ID, amount, and settlement status', () => {
  const record = salesRecords[1]!
  const wrapper = mountBody(SalesRecordBody, record)

  expect(wrapper.text()).toContain('商品名称')
  expect(wrapper.text()).toContain('销售日期')
  expect(wrapper.text()).toContain('销售单ID')
  expect(wrapper.text()).toContain('订单金额')
  expect(wrapper.text()).toContain(record.salesOrderNumber)
  expect(wrapper.text()).toContain(record.productName)
  expect(wrapper.text()).toContain('结款中')
  expect(wrapper.find('.record-card-header .status-tag').exists()).toBe(true)
  expect(wrapper.find('.record-card-header .status-tag').text()).toBe('结款中')
  expect(wrapper.findAll('.record-meta-row dt').map((field) => field.text())).not.toContain(
    '结款状态',
  )
  expect(wrapper.text()).not.toContain('门店与时间')
  expect(wrapper.text()).not.toContain('商品信息')
  expect(wrapper.text()).not.toContain('支付与销售')
  expect(wrapper.text()).not.toContain(record.productModel)
  expect(wrapper.text()).not.toContain(record.paymentMethod)
  expect(wrapper.text()).not.toContain(record.salesperson)
})

it('normalizes sales settlement statuses for list cards', () => {
  const pending = mountBody(SalesRecordBody, salesRecords[0]!)
  const settling = mountBody(SalesRecordBody, salesRecords[1]!)
  const settled = mountBody(SalesRecordBody, salesRecords[2]!)
  const failed = mountBody(SalesRecordBody, salesRecords[3]!)
  const notRequired = mountBody(SalesRecordBody, salesRecords[4]!)

  expect(pending.text()).toContain('待审核')
  expect(settling.text()).toContain('结款中')
  expect(settled.text()).toContain('已结款')
  expect(failed.text()).toContain('结款失败')
  expect(notRequired.text()).toContain('无需结款')
  expect(pending.find('.record-card-header .status-tag').classes()).toContain(
    'status-tag--warning',
  )
  expect(settled.find('.record-card-header .status-tag').classes()).toContain(
    'status-tag--success',
  )
  expect(failed.find('.record-card-header .status-tag').classes()).toContain(
    'status-tag--failure',
  )
  expect(notRequired.find('.record-card-header .status-tag').classes()).toContain(
    'status-tag--neutral',
  )
})

it('keeps the shared card responsible for whole-card interaction and body selection', async () => {
  const record = salesRecords[0]!
  const wrapper = mount(RecordCard, {
    props: { record },
    global: { plugins: [createPinia()] },
  })

  expect(wrapper.findComponent(SalesRecordBody).exists()).toBe(true)
  await wrapper.get('[data-testid="record-card"]').trigger('click')

  expect(wrapper.emitted('open')).toEqual([[record]])
})
