import Vant from 'vant'
import { mount } from '@vue/test-utils'

import { stores } from '@/mock/merchant'

import StoreSelector from './StoreSelector.vue'

it('presents one supplied store without a misleading switch affordance', async () => {
  const onlyStore = stores[0]!
  const wrapper = mount(StoreSelector, {
    props: {
      stores: [onlyStore],
      selectedStoreId: onlyStore.id,
    },
    global: { plugins: [Vant] },
  })

  const trigger = wrapper.get('[data-testid="store-trigger"]')
  expect(trigger.text()).toContain(onlyStore.name)
  expect(trigger.attributes('disabled')).toBeDefined()
  expect(trigger.attributes('aria-label')).toBe(`当前门店：${onlyStore.name}`)
  expect(wrapper.find('.store-selector__chevron').exists()).toBe(false)

  await trigger.trigger('click')
  expect(wrapper.find('[aria-label="选择门店"]').exists()).toBe(false)
})

it('shows the sole store name when the inherited selection is still all stores', () => {
  const onlyStore = stores[0]!
  const wrapper = mount(StoreSelector, {
    props: {
      stores: [onlyStore],
      selectedStoreId: 'all',
    },
    global: { plugins: [Vant] },
  })

  const trigger = wrapper.get('[data-testid="store-trigger"]')
  expect(trigger.text()).toContain(onlyStore.name)
  expect(trigger.text()).not.toContain('全部门店')
  expect(trigger.attributes('disabled')).toBeDefined()
  expect(trigger.attributes('aria-label')).toBe(`当前门店：${onlyStore.name}`)
  expect(wrapper.find('.store-selector__chevron').exists()).toBe(false)
})

it('keeps the canonical multi-store selector interactive', () => {
  const wrapper = mount(StoreSelector, {
    props: { stores, selectedStoreId: 'all' },
    global: { plugins: [Vant] },
  })

  const trigger = wrapper.get('[data-testid="store-trigger"]')
  expect(trigger.attributes('disabled')).toBeUndefined()
  expect(trigger.attributes('aria-label')).toBe('选择门店')
  expect(wrapper.find('.store-selector__chevron').exists()).toBe(true)
})
