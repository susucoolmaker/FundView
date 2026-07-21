import { mount } from '@vue/test-utils'

import LiveInfoBadge from './LiveInfoBadge.vue'

it('renders live information as a compact status badge', () => {
  const wrapper = mount(LiveInfoBadge)

  expect(wrapper.get('[data-testid="live-info-badge"]').text()).toBe('实时信息')
  expect(wrapper.get('[data-testid="live-info-badge"]').classes()).toContain(
    'live-info-badge--compact',
  )
  expect(wrapper.find('.live-info-badge__rail').exists()).toBe(false)
})
