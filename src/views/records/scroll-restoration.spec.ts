import { createPinia } from 'pinia'
import Vant from 'vant'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import {
  createMemoryHistory,
  createRouter,
  RouterView,
  type Router,
} from 'vue-router'

import { rechargeRecords, salesRecords } from '@/mock/records'
import { mockApi, type PageResult } from '@/mock/service'
import { useRecordsStore } from '@/stores/records'
import type { BusinessRecord } from '@/types'

import RecordsView from './RecordsView.vue'

const DetailStub = defineComponent({ template: '<div>详情页</div>' })
const PageHost = defineComponent({
  components: { RouterView },
  template: '<RouterView />',
})

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    scrollBehavior: (to) => (to.path.startsWith('/records/') ? false : { top: 0 }),
    routes: [
      { path: '/records/:type(recharge|withdraw|deposit|sales)', component: RecordsView },
      { path: '/detail/:type/:id', component: DetailStub },
    ],
  })

const mountAt = async (router: Router, path: string, pinia = createPinia()) => {
  await router.push(path)
  await router.isReady()
  const wrapper = mount(PageHost, { global: { plugins: [pinia, router, Vant] } })
  await flushPromises()
  return { wrapper, pinia }
}

const deferredPage = () => {
  let resolve!: (result: PageResult<BusinessRecord>) => void
  const promise = new Promise<PageResult<BusinessRecord>>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

const seedLoadedBusiness = (
  recordsStore: ReturnType<typeof useRecordsStore>,
  type: 'recharge' | 'sales',
  record: BusinessRecord,
) => {
  const state = recordsStore.stateFor(type)
  state.initialized = true
  state.items = [record]
  state.page = 1
  state.total = 1
  state.hasMore = false
}

beforeEach(() => {
  vi.mocked(window.scrollTo).mockClear()
})

afterEach(() => {
  mockApi.setScenario('normal')
  vi.restoreAllMocks()
})

it('restores the saved list position after returning to a business list', async () => {
  const pinia = createPinia()
  useRecordsStore(pinia).saveScroll('recharge', 860)

  const { wrapper } = await mountAt(createTestRouter(), '/records/recharge', pinia)

  await vi.waitFor(() => {
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 860, behavior: 'auto' })
  })
  wrapper.unmount()
})

it('saves the current scroll position before opening a detail page', async () => {
  const router = createTestRouter()
  const { wrapper, pinia } = await mountAt(router, '/records/withdraw')

  await vi.waitFor(() => {
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 612 })

  await router.push('/detail/withdraw/withdraw-001')
  await flushPromises()

  expect(useRecordsStore(pinia).restoreScroll('withdraw')).toBe(612)
  wrapper.unmount()
})

it('keeps independent saved positions when switching business tabs', async () => {
  const router = createTestRouter()
  const pinia = createPinia()
  const recordsStore = useRecordsStore(pinia)
  recordsStore.saveScroll('recharge', 320)
  recordsStore.saveScroll('sales', 940)
  const { wrapper } = await mountAt(router, '/records/recharge', pinia)

  await vi.waitFor(() => {
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 320, behavior: 'auto' })
  })
  vi.mocked(window.scrollTo).mockClear()

  await router.push('/records/sales')
  await flushPromises()

  await vi.waitFor(() => {
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 940, behavior: 'auto' })
  })
  wrapper.unmount()
})

it('retains applied and draft state and does not refetch after list-detail-list navigation', async () => {
  const router = createTestRouter()
  const fetchRecords = vi.spyOn(mockApi, 'fetchRecords')
  const { wrapper, pinia } = await mountAt(router, '/records/recharge')
  const recordsStore = useRecordsStore(pinia)

  await vi.waitFor(() => {
    expect(recordsStore.stateFor('recharge').page).toBe(1)
  })
  recordsStore.setDraft('recharge', { keyword: '85000' })
  await recordsStore.applyQuery('recharge')
  recordsStore.setDraft('recharge', { keyword: '尚未查询的草稿' })
  const retainedIds = recordsStore.stateFor('recharge').items.map(({ id }) => id)
  const fetchCountBeforeDetail = fetchRecords.mock.calls.length
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 860 })
  vi.mocked(window.scrollTo).mockClear()

  await wrapper.get('[data-testid="record-card"]').trigger('click')
  await flushPromises()
  expect(router.currentRoute.value.fullPath).toBe('/detail/recharge/recharge-001')

  router.back()
  await vi.waitFor(() => {
    expect(router.currentRoute.value.fullPath).toBe('/records/recharge')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 860, behavior: 'auto' })
  })

  const restoredState = recordsStore.stateFor('recharge')
  expect(restoredState.appliedQuery.keyword).toBe('85000')
  expect(restoredState.draftQuery.keyword).toBe('尚未查询的草稿')
  expect(restoredState.page).toBe(1)
  expect(restoredState.items.map(({ id }) => id)).toEqual(retainedIds)
  expect(fetchRecords).toHaveBeenCalledTimes(fetchCountBeforeDetail)
  wrapper.unmount()
})

it('does not save the previous business scroll into an unrestored intermediate route', async () => {
  const router = createTestRouter()
  const pinia = createPinia()
  const recordsStore = useRecordsStore(pinia)
  seedLoadedBusiness(recordsStore, 'recharge', rechargeRecords[0]!)
  seedLoadedBusiness(recordsStore, 'sales', salesRecords[0]!)
  recordsStore.saveScroll('recharge', 320)
  recordsStore.saveScroll('sales', 940)
  const delayedWithdraw = deferredPage()
  vi.spyOn(mockApi, 'fetchRecords').mockImplementation((type) => {
    if (type === 'withdraw') return delayedWithdraw.promise
    throw new Error(`Unexpected request for ${type}`)
  })
  const { wrapper } = await mountAt(router, '/records/recharge', pinia)

  await vi.waitFor(() => {
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 320, behavior: 'auto' })
  })
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 320 })
  await router.push('/records/withdraw')
  await flushPromises()
  expect(recordsStore.stateFor('withdraw').loading).toBe(true)

  await router.push('/records/sales')
  await flushPromises()
  await vi.waitFor(() => {
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 940, behavior: 'auto' })
  })

  expect(recordsStore.restoreScroll('recharge')).toBe(320)
  expect(recordsStore.restoreScroll('withdraw')).toBe(0)
  delayedWithdraw.resolve({ items: [], total: 0, hasMore: false })
  await flushPromises()
  expect(window.scrollTo).not.toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  wrapper.unmount()
})
