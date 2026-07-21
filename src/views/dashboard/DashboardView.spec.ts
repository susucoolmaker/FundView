import { mount } from '@vue/test-utils'

import DashboardView from './DashboardView.vue'

it('renders the approved static final design and keeps the original recent records section', () => {
  const wrapper = mount(DashboardView)
  const image = wrapper.get('[data-testid="final-design-image"]')

  expect(wrapper.get('[data-testid="final-design-page"]').classes()).toContain(
    'dashboard-view--final-static',
  )
  expect(image.attributes('alt')).toBe('商户资金看板最终验收稿')
  expect(image.attributes('src')).toContain('merchant-fund-final-design')
  expect(wrapper.find('[data-testid="wallet-balance"]').exists()).toBe(false)
  expect(wrapper.find('[data-testid="deposit-row"]').exists()).toBe(false)
  expect(wrapper.find('[data-testid="monthly-recharge-entry"]').exists()).toBe(false)
  expect(wrapper.find('[data-testid="monthly-withdraw-entry"]').exists()).toBe(false)
  expect(wrapper.get('[data-testid="deposit-hotspot"]').attributes('href')).toBe(
    '#/records/deposit',
  )
  expect(wrapper.get('[data-testid="monthly-recharge-hotspot"]').attributes('href')).toBe(
    '#/records/recharge',
  )
  expect(wrapper.get('[data-testid="monthly-withdraw-hotspot"]').attributes('href')).toBe(
    '#/records/withdraw',
  )
  expect(wrapper.find('[data-testid="recharge-clear-icon"]').exists()).toBe(false)
  expect(wrapper.find('[data-testid="withdraw-clear-icon"]').exists()).toBe(false)
  expect(wrapper.get('[data-testid="new-order-message"]').text()).toContain(
    '新订单提醒：刚产生 1 笔新订单，点击查看',
  )
  expect(wrapper.get('[data-testid="message-clear-icon"]').attributes('aria-hidden')).toBe('true')
  expect(wrapper.get('[data-testid="message-clear-icon"]').classes()).toContain(
    'dashboard-view__message-icon--plain',
  )
  expect(wrapper.text()).toContain('最近记录')
  expect(wrapper.get('[data-testid="recent-records-shell"]').classes()).toContain(
    'dashboard-view__recent--main-card-width',
  )
  expect(wrapper.findAll('[data-testid="recent-record"]')).toHaveLength(5)
  expect(wrapper.text()).not.toContain('商户资金管理')
  expect(wrapper.text()).not.toContain('资金看板')
})
