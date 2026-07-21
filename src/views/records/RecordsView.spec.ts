import { createPinia, type Pinia } from 'pinia'
import Vant from 'vant'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'

import { mockApi } from '@/mock/service'
import { useMerchantStore } from '@/stores/merchant'
import { useRecordsStore } from '@/stores/records'

import RecordsView from './RecordsView.vue'

interface MountedRecords {
  wrapper: VueWrapper
  router: Router
  pinia: Pinia
}

const DetailStub = defineComponent({ template: '<div>详情页</div>' })
const DashboardStub = defineComponent({ template: '<div>首页</div>' })

const createRecordsRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/dashboard', component: DashboardStub },
      { path: '/records/:type(recharge|withdraw|deposit|sales)', component: RecordsView },
      { path: '/detail/:type/:id', component: DetailStub },
    ],
  })

const mountRecords = async (
  path: string,
  options: { selectedStoreId?: string; pinia?: Pinia; router?: Router } = {},
): Promise<MountedRecords> => {
  const pinia = options.pinia ?? createPinia()
  if (options.selectedStoreId) useMerchantStore(pinia).selectStore(options.selectedStoreId)

  const router = options.router ?? createRecordsRouter()
  await router.push(path)
  await router.isReady()

  const wrapper = mount(RecordsView, {
    global: { plugins: [pinia, router, Vant] },
  })

  return { wrapper, router, pinia }
}

const waitForLoad = async (wrapper: VueWrapper) => {
  await vi.waitFor(() => {
    expect(wrapper.find('[data-testid="record-card"]').exists()).toBe(true)
  })
}

afterEach(() => {
  mockApi.setScenario('normal')
  vi.restoreAllMocks()
})

it('switches from recharge to sales by route and changes the search prompt', async () => {
  const { wrapper, router } = await mountRecords('/records/recharge')

  await wrapper.get('[data-testid="tab-sales"]').trigger('click')
  await flushPromises()

  expect(router.currentRoute.value.fullPath).toBe('/records/sales')
  expect(wrapper.get('input').attributes('placeholder')).toBe('输入销售单号或商品名称')
})

it('applies and resets keyword filters while the summary reflects only applied conditions', async () => {
  const { wrapper } = await mountRecords('/records/recharge')
  await waitForLoad(wrapper)

  await wrapper.get('input').setValue('CZ2026000001')
  expect(wrapper.get('[data-testid="applied-summary"]').text()).not.toContain('CZ2026000001')

  await wrapper.get('[data-testid="query-button"]').trigger('click')
  await vi.waitFor(() => {
    expect(wrapper.get('[data-testid="applied-summary"]').text()).toContain('CZ2026000001')
  })

  await wrapper.get('[data-testid="reset-button"]').trigger('click')
  await vi.waitFor(() => {
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('')
  })
  expect(wrapper.get('[data-testid="applied-summary"]').text()).not.toContain('CZ2026000001')
})

it('inherits the dashboard store once and explicit reset returns to all stores', async () => {
  const { wrapper, pinia } = await mountRecords('/records/recharge', {
    selectedStoreId: 'store-wangjing',
  })

  await vi.waitFor(() => {
    expect(wrapper.get('[data-testid="applied-summary"]').text()).toContain('北京望京店')
  })
  expect(useRecordsStore(pinia).stateFor('recharge').appliedQuery.storeId).toBe('store-wangjing')

  await wrapper.get('[data-testid="reset-button"]').trigger('click')
  await vi.waitFor(() => {
    expect(wrapper.get('[data-testid="applied-summary"]').text()).toContain('全部门店')
  })
  expect(useRecordsStore(pinia).stateFor('recharge').appliedQuery.storeId).toBe('all')
})

it('does not inherit a different dashboard store after the first request failed', async () => {
  mockApi.setScenario('network')
  const firstVisit = await mountRecords('/records/recharge', {
    selectedStoreId: 'store-wangjing',
  })

  await vi.waitFor(() => {
    expect(firstVisit.wrapper.text()).toContain('网络连接异常')
  })
  expect(useRecordsStore(firstVisit.pinia).stateFor('recharge').appliedQuery.storeId).toBe(
    'store-wangjing',
  )

  firstVisit.wrapper.unmount()
  await firstVisit.router.push('/dashboard')
  useMerchantStore(firstVisit.pinia).selectStore('store-guomao')

  const secondVisit = await mountRecords('/records/recharge', {
    pinia: firstVisit.pinia,
    router: firstVisit.router,
  })

  expect(useRecordsStore(secondVisit.pinia).stateFor('recharge').appliedQuery.storeId).toBe(
    'store-wangjing',
  )
  expect(secondVisit.wrapper.get('[data-testid="applied-summary"]').text()).toContain(
    '北京望京店',
  )
})

it.each([
  ['/records/recharge', 'CZ2026000001', '充值金额'],
  ['/records/withdraw', 'TX2026000001', '提现金额'],
  ['/records/deposit', 'BZJ2026000005', '国补加盟交纳保证金'],
  ['/records/sales', 'XS2026000001', '待审核'],
])('renders the focused fields for %s cards', async (path, identifier, focusedField) => {
  const { wrapper } = await mountRecords(path)
  await waitForLoad(wrapper)

  const card = wrapper.findAll('[data-testid="record-card"]')[0]!
  expect(card.text()).toContain(identifier)
  expect(card.text()).toContain(focusedField)
})

it('keeps the focused sales card fields and opens detail from the whole card', async () => {
  const { wrapper, router } = await mountRecords('/records/sales')
  await waitForLoad(wrapper)

  const card = wrapper.findAll('[data-testid="record-card"]')[0]!
  expect(card.text()).toContain('XS2026000001')
  expect(card.text()).toContain('商品名称')
  expect(card.text()).toContain('销售日期')
  expect(card.text()).toContain('销售单ID')
  expect(card.text()).toContain('订单金额')
  expect(card.text()).toContain('待审核')
  expect(card.find('.record-card-header .status-tag').exists()).toBe(true)
  expect(card.findAll('.record-meta-row dt').map((field) => field.text())).not.toContain(
    '结款状态',
  )
  expect(card.text()).not.toContain('门店与时间')
  expect(card.text()).not.toContain('商品信息')
  expect(card.text()).not.toContain('支付与销售')

  await card.trigger('click')
  await flushPromises()

  expect(router.currentRoute.value.fullPath).toBe('/detail/sales/sales-001')
})

it('distinguishes a completely empty category from filters with no matches', async () => {
  vi.spyOn(mockApi, 'fetchRecords').mockResolvedValueOnce({ items: [], total: 0, hasMore: false })
  const { wrapper } = await mountRecords('/records/recharge')

  await vi.waitFor(() => {
    expect(wrapper.text()).toContain('暂无充值记录')
  })

  vi.restoreAllMocks()
  await wrapper.get('input').setValue('不存在的流水号')
  await wrapper.get('[data-testid="query-button"]').trigger('click')

  await vi.waitFor(() => {
    expect(wrapper.text()).toContain('没有找到符合条件的记录')
  })
})

it.each([
  ['network', '网络连接异常，请检查网络后重试'],
  ['expired', '登录状态已过期，请重新登录'],
  ['forbidden', '暂无权限查看该类记录'],
] as const)('shows the %s error state and retry action', async (scenario, message) => {
  mockApi.setScenario(scenario)
  const { wrapper } = await mountRecords('/records/recharge')

  await vi.waitFor(() => {
    expect(wrapper.text()).toContain(message)
  })
  expect(wrapper.get('[data-testid="retry-button"]').text()).toContain('重试')
})

it('uses pull refresh and list paging with the finished copy', async () => {
  const { wrapper } = await mountRecords('/records/recharge')
  await waitForLoad(wrapper)

  expect(wrapper.getComponent({ name: 'VanPullRefresh' }).vm.$options.name).toBe('van-pull-refresh')
  expect(wrapper.getComponent({ name: 'VanList' }).vm.$options.name).toBe('van-list')
  expect(wrapper.text()).toContain('没有更多数据了')
})

it('delegates pull refresh and list load events to the active business store actions', async () => {
  const { wrapper, pinia } = await mountRecords('/records/recharge')
  await waitForLoad(wrapper)
  const recordsStore = useRecordsStore(pinia)
  const refresh = vi.spyOn(recordsStore, 'refresh').mockResolvedValue()
  const loadMore = vi.spyOn(recordsStore, 'loadMore').mockResolvedValue()

  const pullRefresh = wrapper.getComponent({ name: 'VanPullRefresh' })
  const list = wrapper.getComponent({ name: 'VanList' })
  expect(pullRefresh.attributes('data-testid')).toBe('records-pull-refresh')
  expect(list.attributes('data-testid')).toBe('records-list')

  pullRefresh.vm.$emit('refresh')
  list.vm.$emit('load')
  await flushPromises()

  expect(refresh).toHaveBeenCalledWith('recharge')
  expect(loadMore).toHaveBeenCalledWith('recharge')
})
