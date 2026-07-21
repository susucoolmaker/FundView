import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'

import StoreCard from '@/components/StoreCard.vue'

import ProfileView from './ProfileView.vue'

const mountProfile = () =>
  mount(ProfileView, {
    global: { plugins: [createPinia()] },
  })

it('renders the canonical merchant identity and administrator details', () => {
  const wrapper = mountProfile()

  expect(wrapper.text()).toContain('华北恒信通讯有限公司')
  expect(wrapper.text()).toContain('商户管理员')
  expect(wrapper.text()).toContain('SM2026070018')
  expect(wrapper.text()).toContain('张丽 138****8899')
})

it('renders both notices and all three stores with binding text', () => {
  const wrapper = mountProfile()

  expect(wrapper.text()).toContain('当前商户账户状态正常')
  expect(wrapper.text()).toContain('北京国贸店有 1 名员工尚未完成绑定')
  expect(wrapper.findAll('[data-testid="store-card"]')).toHaveLength(3)
  expect(wrapper.text()).toContain('北京望京店')
  expect(wrapper.text()).toContain('北京中关村店')
  expect(wrapper.text()).toContain('北京国贸店')
  expect(wrapper.text()).toContain('6 人')
  expect(wrapper.text()).toContain('8 人')
  expect(wrapper.text()).toContain('4 人')
  expect(wrapper.text()).toContain('绑定异常')
})

it('uses semantic status classes while keeping binding status visible', () => {
  const wrapper = mountProfile()
  const cards = wrapper.findAll('[data-testid="store-card"]')

  expect(cards[0]!.get('[data-testid="binding-status"]').classes()).toContain(
    'store-card__status--success',
  )
  expect(cards[2]!.get('[data-testid="binding-status"]').classes()).toContain(
    'store-card__status--failure',
  )
  expect(cards[2]!.get('[data-testid="binding-status"]').text()).toBe('绑定异常')
})

it.each(['未绑定', '已停用'] as const)('uses a neutral state for %s stores', (bindingStatus) => {
  const wrapper = mount(StoreCard, {
    props: {
      store: {
        id: 'store-neutral',
        name: '测试门店',
        code: 'TEST001',
        boundEmployeeCount: 0,
        bindingStatus,
        currentDepositBalance: 0,
      },
    },
  })

  const status = wrapper.get('[data-testid="binding-status"]')
  expect(status.text()).toBe(bindingStatus)
  expect(status.classes()).toContain('store-card__status--neutral')
})
