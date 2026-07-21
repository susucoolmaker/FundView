import { mount } from '@vue/test-utils'

import FundOverview from './FundOverview.vue'

const props = {
  merchantName: '华北恒信通讯有限公司',
  walletBalance: 568420.36,
  monthlyRecharge: 328000,
  monthlySuccessfulWithdraw: 126500,
  currentDepositBalance: 200000,
}

it('renders the glass merchant fund board while keeping two monthly entries', () => {
  const wrapper = mount(FundOverview, { props })

  expect(wrapper.find('[data-testid="merchant-icon"]').exists()).toBe(true)
  expect(wrapper.get('.fund-overview').classes()).toContain('fund-overview--glass')
  expect(wrapper.get('[data-testid="merchant-contract-badge"]').text()).toContain('已签约商户')
  expect(wrapper.get('[data-testid="wallet-card"]').text()).toContain('钱包余额（全部门店共用）')
  expect(wrapper.find('[data-testid="wallet-visual"]').exists()).toBe(true)
  expect(wrapper.get('[data-testid="deposit-row"]').text()).toContain('当前保证金')
  expect(wrapper.get('[data-testid="deposit-row"]').text()).toContain('¥200,000.00')
  expect(wrapper.find('[data-testid="deposit-icon"]').exists()).toBe(true)
  expect(wrapper.find('[data-testid="monthly-recharge-icon"]').exists()).toBe(true)
  expect(wrapper.find('[data-testid="monthly-withdraw-icon"]').exists()).toBe(true)
  expect(wrapper.find('[data-testid="monthly-recharge-chart"]').exists()).toBe(true)
  expect(wrapper.find('[data-testid="monthly-withdraw-chart"]').exists()).toBe(true)
  expect(wrapper.get('[data-testid="transaction-summary"]').text()).toContain(
    '近7日交易笔数 128 笔，较上月 ↑ 12%',
  )
  expect(wrapper.findAll('[data-fund-metric="true"]')).toHaveLength(2)
})

it.each([
  ['deposit-row', 'deposit'],
  ['monthly-recharge-entry', 'recharge'],
  ['monthly-withdraw-entry', 'withdraw'],
])('opens %s as a records entry', async (testId, type) => {
  const wrapper = mount(FundOverview, { props })

  await wrapper.get(`[data-testid="${testId}"]`).trigger('click')

  expect(wrapper.emitted('openRecords')).toEqual([[type]])
})
