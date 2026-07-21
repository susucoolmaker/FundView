import { createPinia } from 'pinia'
import Vant from 'vant'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'

import { recordConfigs } from '@/config/record-config'
import { stores } from '@/mock/merchant'
import type { QueryCondition } from '@/types'

import RecordFilter from './RecordFilter.vue'

const defaultQuery: QueryCondition = {
  datePreset: 'month',
  startDate: '2026-07-01',
  endDate: '2026-07-31',
  storeId: 'all',
  keyword: '',
}

const mountFilter = () =>
  mount(
    defineComponent({
      components: { RecordFilter },
      setup() {
        const query = ref<QueryCondition>({ ...defaultQuery })
        const queries = ref(0)
        const resets = ref(0)
        const update = (patch: Partial<QueryCondition>) => Object.assign(query.value, patch)

        return { query, queries, resets, update, stores, config: recordConfigs.recharge }
      },
      template: `
        <RecordFilter
          :config="config"
          :query="query"
          :stores="stores"
          @update="update"
          @query="queries += 1"
          @reset="resets += 1"
        />
        <output data-testid="query-count">{{ queries }}</output>
        <output data-testid="reset-count">{{ resets }}</output>
      `,
    }),
    { global: { plugins: [createPinia(), Vant] } },
  )

it('applies quick date presets from the date selector', async () => {
  const wrapper = mountFilter()

  expect(wrapper.get('[data-testid="date-trigger"]').text()).toContain('本月')
  await wrapper.get('[data-testid="date-trigger"]').trigger('click')
  await nextTick()
  await wrapper.get('[data-testid="preset-today"]').trigger('click')

  expect(wrapper.get('[data-testid="date-trigger"]').text()).toContain('今天')
})

it('opens a range calendar and writes the confirmed custom dates', async () => {
  const wrapper = mountFilter()

  await wrapper.get('[data-testid="date-trigger"]').trigger('click')
  await nextTick()
  await wrapper.get('[data-testid="preset-custom"]').trigger('click')
  await nextTick()

  const calendar = wrapper.getComponent({ name: 'VanCalendar' })
  expect(calendar.props('type')).toBe('range')
  expect(calendar.props('show')).toBe(true)

  calendar.vm.$emit('confirm', [new Date(2026, 6, 3), new Date(2026, 6, 9)])
  await nextTick()

  expect(wrapper.get('[data-testid="date-trigger"]').text()).toContain('07/03 - 07/09')
})

it('selects a store through the popup picker', async () => {
  const wrapper = mountFilter()

  await wrapper.get('[data-testid="filter-store-trigger"]').trigger('click')
  await nextTick()
  await wrapper.get('[data-testid="filter-store-option-store-wangjing"]').trigger('click')
  await nextTick()

  expect(wrapper.get('[data-testid="filter-store-trigger"]').text()).toContain('北京望京店')
})

it('edits the keyword and exposes query and reset actions', async () => {
  const wrapper = mountFilter()

  expect(wrapper.get('[data-testid="keyword-input"]').attributes('aria-label')).toBe(
    '充值记录关键词',
  )

  await wrapper.get('[data-testid="keyword-input"]').setValue('CZ2026000001')
  await wrapper.get('[data-testid="query-button"]').trigger('click')
  await wrapper.get('[data-testid="reset-button"]').trigger('click')
  await flushPromises()

  expect(wrapper.get('[data-testid="query-count"]').text()).toBe('1')
  expect(wrapper.get('[data-testid="reset-count"]').text()).toBe('1')
})
