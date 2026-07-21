import { createPinia } from 'pinia'
import Vant from 'vant'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'

import { mockApi } from '@/mock/service'
import detailFieldSource from '@/components/DetailField.vue?raw'

import RecordDetailView from './RecordDetailView.vue'
import recordDetailSource from './RecordDetailView.vue?raw'

interface MountedDetail {
  wrapper: VueWrapper
  router: Router
}

const mountDetail = async (path: string): Promise<MountedDetail> => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/records/:type', component: { template: '<div>记录列表</div>' } },
      { path: '/detail/:type/:id', component: RecordDetailView },
    ],
  })
  await router.push(path)
  await router.isReady()

  const wrapper = mount(RecordDetailView, {
    global: { plugins: [createPinia(), router, Vant] },
  })

  return { wrapper, router }
}

const waitForDetail = async (wrapper: VueWrapper, copy: string) => {
  await vi.waitFor(() => expect(wrapper.text()).toContain(copy))
}

afterEach(() => {
  mockApi.setScenario('normal')
  vi.restoreAllMocks()
})

it('renders the approved recharge basic information fields without changing amount or voucher sections', async () => {
  const { wrapper } = await mountDetail('/detail/recharge/recharge-001')
  await waitForDetail(wrapper, 'CZ2026000001')

  const labels = wrapper.findAll('.detail-field dt').map((field) => field.text())

  expect(wrapper.get('[data-testid="detail-back"]').text()).toContain('返回')
  expect(wrapper.text()).toContain('充值详情')
  expect(wrapper.text()).toContain('充值金额')
  expect(wrapper.text()).toContain('¥85,000.00')
  expect(labels).toEqual([
    '商户实名编码',
    '商户名称',
    '交易时间',
    '交易流水号',
    '状态',
    '来款姓名',
    '来款账号',
  ])
  expect(wrapper.text()).toContain('SM2026070018')
  expect(wrapper.text()).toContain('华北恒信通讯有限公司')
  expect(wrapper.text()).toContain('2026-07-17 09:30')
  expect(wrapper.text()).toContain('充值成功')
  expect(wrapper.text()).toContain('王欣')
  expect(wrapper.text()).toContain('迪无界付款账户-1')
  expect(labels).not.toContain('日期')
  expect(labels).not.toContain('流水号')
  expect(labels).not.toContain('所属门店')
  expect(labels).not.toContain('充值方式')
  expect(labels).not.toContain('付款账户')
  expect(labels).not.toContain('收款账户')
  expect(labels).not.toContain('创建时间')
  expect(labels).not.toContain('操作人员')
  expect(labels).not.toContain('备注')
  expect(wrapper.find('[data-testid="voucher-thumbnail"]').exists()).toBe(true)
})

it('renders the approved withdrawal basic information fields without changing amount or voucher sections', async () => {
  const { wrapper } = await mountDetail('/detail/withdraw/withdraw-004')
  await waitForDetail(wrapper, 'TX2026000004')

  const labels = wrapper.findAll('.detail-field dt').map((field) => field.text())

  expect(wrapper.text()).toContain('提现详情')
  expect(wrapper.text()).toContain('提现金额')
  expect(wrapper.text()).toContain('¥5,900.00')
  expect(labels).toEqual([
    '商户实名编码',
    '商户名称',
    '交易时间',
    '更新时间',
    '交易流水号',
    '状态',
  ])
  expect(wrapper.text()).toContain('SM2026070018')
  expect(wrapper.text()).toContain('华北恒信通讯有限公司')
  expect(wrapper.text()).toContain('2026-03-06 10:05')
  expect(wrapper.text()).toContain('TX2026000004')
  expect(wrapper.text()).toContain('提现失败')
  expect(labels).not.toContain('日期')
  expect(labels).not.toContain('流水号')
  expect(labels).not.toContain('所属商户')
  expect(labels).not.toContain('所属门店')
  expect(labels).not.toContain('银行名称')
  expect(labels).not.toContain('失败原因')
  expect(labels).not.toContain('驳回原因')
  expect(labels).not.toContain('备注')
  expect(wrapper.text()).not.toContain('资金凭证')
  expect(wrapper.find('[data-testid="voucher-thumbnail"]').exists()).toBe(false)
  expect(wrapper.text()).not.toContain('undefined')
})

it('normalizes pending withdrawal statuses to in-review copy in the detail page', async () => {
  const { wrapper } = await mountDetail('/detail/withdraw/withdraw-001')
  await waitForDetail(wrapper, 'TX2026000001')

  expect(wrapper.findAll('.detail-field dt').map((field) => field.text())).toContain('状态')
  expect(wrapper.text()).toContain('提现中')
  expect(wrapper.text()).not.toContain('待处理')
  expect(wrapper.text()).not.toContain('资金凭证')
})

it('shows funding vouchers only for successful recharge and successful withdrawal details', async () => {
  const { wrapper: successfulRecharge } = await mountDetail('/detail/recharge/recharge-001')
  await waitForDetail(successfulRecharge, '充值成功')
  expect(successfulRecharge.find('[data-testid="voucher-thumbnail"]').exists()).toBe(true)

  const rechargeRecord = (await mockApi.fetchRecordDetail('recharge', 'recharge-001'))!
  if (rechargeRecord.type !== 'recharge') throw new Error('Expected recharge fixture')
  const failedRechargeRecord = {
    ...rechargeRecord,
    status: '充值失败' as const,
  }
  vi.spyOn(mockApi, 'fetchRecordDetail').mockResolvedValueOnce(failedRechargeRecord)
  const { wrapper: failedRecharge } = await mountDetail('/detail/recharge/recharge-001')
  await waitForDetail(failedRecharge, '充值失败')
  expect(failedRecharge.text()).not.toContain('资金凭证')

  const { wrapper: successfulWithdrawal } = await mountDetail('/detail/withdraw/withdraw-003')
  await waitForDetail(successfulWithdrawal, '提现成功')
  expect(successfulWithdrawal.find('[data-testid="voucher-thumbnail"]').exists()).toBe(true)
})

it('renders the approved deposit basic information fields while keeping the amount section unchanged', async () => {
  const { wrapper } = await mountDetail('/detail/deposit/deposit-005')
  await waitForDetail(wrapper, 'BZJ2026000005')

  const labels = wrapper.findAll('.detail-field dt').map((field) => field.text())

  expect(wrapper.text()).toContain('保证金详情')
  expect(wrapper.text()).toContain('变动金额')
  expect(wrapper.text()).toContain('¥6,000.00')
  expect(wrapper.text()).toContain('已驳回')
  expect(labels).toEqual([
    '商户实名编码',
    '商户名称',
    '交易项目',
    '交易时间',
    '交易流水号',
    '状态',
    '企微店铺',
    '付款名称',
    '收款名称',
    '添加时间',
    '更新时间',
  ])
  expect(wrapper.text()).toContain('SM2026070018')
  expect(wrapper.text()).toContain('华北恒信通讯有限公司')
  expect(wrapper.text()).toContain('国补加盟交纳保证金')
  expect(wrapper.text()).toContain('2026-07-17 09:30')
  expect(wrapper.text()).toContain('BZJ2026000005')
  expect(wrapper.text()).toContain('交易失败')
  expect(wrapper.text()).toContain('北京望京店')
  expect(wrapper.text()).toContain('平台资金账户')
  expect(labels).not.toContain('日期')
  expect(labels).not.toContain('流水号')
  expect(labels).not.toContain('所属商户')
  expect(labels).not.toContain('所属门店')
  expect(labels).not.toContain('类型')
  expect(labels).not.toContain('变动前余额')
  expect(labels).not.toContain('变动后余额')
  expect(labels).not.toContain('备注')
  expect(wrapper.text()).not.toContain('资金凭证')
  expect(wrapper.find('[data-testid="voucher-thumbnail"]').exists()).toBe(false)
})

it('renders returned deposit projects as national-subsidy franchise deposit returns', async () => {
  const { wrapper } = await mountDetail('/detail/deposit/deposit-004')
  await waitForDetail(wrapper, 'BZJ2026000004')

  expect(wrapper.text()).toContain('国补加盟退还保证金')
  expect(wrapper.text()).toContain('交易成功')
  expect(wrapper.get('[data-testid="detail-amount"]').text()).toBe('-¥5,000.00')
})

it.each([
  ['deposit-003', 'BZJ2026000003', '-¥4,000.00'],
  ['deposit-004', 'BZJ2026000004', '-¥5,000.00'],
])('renders %s movements with a negative signed summary', async (id, identifier, amount) => {
  const { wrapper } = await mountDetail(`/detail/deposit/${id}`)
  await waitForDetail(wrapper, identifier)

  expect(wrapper.get('[data-testid="detail-amount"]').text()).toBe(amount)
})

it('renders every sales field and never renders a voucher section', async () => {
  const { wrapper } = await mountDetail('/detail/sales/sales-003')
  await waitForDetail(wrapper, 'XS2026000003')

  for (const copy of [
    '销售详情',
    '销售单号',
    '商品名称',
    '商品型号',
    '商品数量',
    '商品单价',
    '订单金额',
    '优惠金额',
    '结款金额',
    '结款状态',
    '结款时间',
    '支付方式',
    '销售人员',
    '订单备注',
  ]) {
    expect(wrapper.text()).toContain(copy)
  }
  expect(wrapper.text()).toContain('已结款')
  expect(wrapper.text()).not.toContain('资金凭证')
})

it.each([
  ['/detail/recharge/recharge-001', '备注'],
  ['/detail/sales/sales-004', '订单备注'],
])('omits an optional empty remark field for %s', async (path, remarkLabel) => {
  const { wrapper } = await mountDetail(path)
  await vi.waitFor(() => expect(wrapper.findAll('.detail-field').length).toBeGreaterThan(0))

  expect(wrapper.findAll('.detail-field dt').map((field) => field.text())).not.toContain(remarkLabel)
  expect(wrapper.findAll('.detail-field dd').some((field) => field.text() === '无')).toBe(false)
})

it('omits a whitespace-only funding remark', async () => {
  vi.spyOn(mockApi, 'fetchRecordDetail').mockResolvedValue({
    ...(await mockApi.fetchRecordDetail('recharge', 'recharge-001'))!,
    remark: '   ',
  })

  const { wrapper } = await mountDetail('/detail/recharge/recharge-001')
  await waitForDetail(wrapper, 'CZ2026000001')

  expect(wrapper.findAll('.detail-field dt').map((field) => field.text())).not.toContain('备注')
})

it.each([
  ['/detail/sales/sales-003', '订单备注', '线下销售订单 3'],
])('preserves a nonempty optional remark for %s', async (path, remarkLabel, remarkCopy) => {
  const { wrapper } = await mountDetail(path)
  await waitForDetail(wrapper, remarkCopy)

  expect(wrapper.findAll('.detail-field dt').map((field) => field.text())).toContain(remarkLabel)
})

it('copies the complete serial number from its explicit copy control', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })
  const { wrapper } = await mountDetail('/detail/recharge/recharge-001')
  await waitForDetail(wrapper, 'CZ2026000001')

  await wrapper.get('[data-testid="copy-交易流水号"]').trigger('click')

  expect(writeText).toHaveBeenCalledWith('CZ2026000001')
  expect(wrapper.get('[data-testid="copy-交易流水号"]').text()).toBe('')
  expect(wrapper.text()).not.toContain('复制')
  expect(detailFieldSource).toContain('detail-field__copy-icon')
})

it('falls back to the matching records list when opening a detail page directly', async () => {
  const { wrapper, router } = await mountDetail('/detail/recharge/recharge-001')
  await waitForDetail(wrapper, 'CZ2026000001')

  await wrapper.get('[data-testid="detail-back"]').trigger('click')

  await vi.waitFor(() => {
    expect(router.currentRoute.value.fullPath).toBe('/records/recharge')
  })
})

it('shows the dedicated funding-voucher empty state', async () => {
  const { wrapper } = await mountDetail('/detail/recharge/recharge-003')
  await waitForDetail(wrapper, 'CZ2026000003')

  expect(wrapper.text()).toContain('资金凭证')
  expect(wrapper.text()).toContain('暂无资金凭证')
})

it('shows an expired-record fallback for an unknown record id', async () => {
  const { wrapper } = await mountDetail('/detail/deposit/not-found')

  await waitForDetail(wrapper, '记录不存在或已失效')
  expect(wrapper.text()).toContain('返回记录列表')
})

it('shows differentiated API errors and retries the same record', async () => {
  mockApi.setScenario('network')
  const { wrapper } = await mountDetail('/detail/recharge/recharge-001')
  await waitForDetail(wrapper, '数据加载失败，请重新加载')

  mockApi.setScenario('normal')
  await wrapper.get('[data-testid="detail-retry"]').trigger('click')
  await waitForDetail(wrapper, 'CZ2026000001')

  expect(wrapper.text()).not.toContain('数据加载失败，请重新加载')
})

it('keeps copy icon compact and back controls at least 80px square in design space', () => {
  expect(detailFieldSource).toMatch(/\.detail-field__copy\s*\{[^}]*width:\s*36px[^}]*height:\s*36px/s)
  expect(detailFieldSource).not.toMatch(/\.detail-field__copy\s*\{[^}]*min-height:\s*80px/s)
  expect(recordDetailSource).toMatch(
    /\.record-detail-view__bar button\s*\{[^}]*min-width:\s*80px[^}]*min-height:\s*80px/s,
  )
})
