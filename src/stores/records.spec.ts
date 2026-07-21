import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { rechargeRecords, salesRecords } from '@/mock/records'
import { mockReferenceDate } from '@/mock/reference'
import { mockApi, type MockScenario, type PageResult } from '@/mock/service'
import type { BusinessRecord } from '@/types'
import { getDateRange } from '@/utils/format'

import { useRecordsStore } from './records'

const finishRequest = async <T>(request: Promise<T>) => {
  await vi.advanceTimersByTimeAsync(200)
  return request
}

const deferredPage = () => {
  let resolve!: (result: PageResult<BusinessRecord>) => void
  const promise = new Promise<PageResult<BusinessRecord>>((resolvePromise) => {
    resolve = resolvePromise
  })

  return { promise, resolve }
}

describe('useRecordsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockApi.setScenario('normal')
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('derives the default month from the shared Mock reference date', () => {
    vi.setSystemTime(new Date('2031-02-10T12:00:00+08:00'))

    const store = useRecordsStore()
    const expectedRange = getDateRange('month', mockReferenceDate)

    expect(store.stateFor('recharge').draftQuery).toEqual({
      datePreset: 'month',
      ...expectedRange,
      storeId: 'all',
      keyword: '',
    })
    expect(store.stateFor('recharge').appliedQuery).toEqual(
      store.stateFor('recharge').draftQuery,
    )
  })

  it('does not apply or request draft filters until query is submitted', async () => {
    const fetchRecords = vi.spyOn(mockApi, 'fetchRecords')
    const store = useRecordsStore()

    store.setDraft('recharge', { keyword: '85000' })

    expect(store.stateFor('recharge').appliedQuery.keyword).toBe('')
    expect(fetchRecords).not.toHaveBeenCalled()

    await finishRequest(store.applyQuery('recharge'))

    expect(store.stateFor('recharge').appliedQuery.keyword).toBe('85000')
    expect(store.stateFor('recharge').page).toBe(1)
    expect(store.stateFor('recharge').items.map(({ id }) => id)).toEqual(['recharge-001'])
    expect(fetchRecords).toHaveBeenCalledWith(
      'recharge',
      store.stateFor('recharge').appliedQuery,
      1,
      20,
    )
  })

  it('resets to this month, all stores, and an empty keyword, then refreshes immediately', async () => {
    const store = useRecordsStore()
    store.setDraft('sales', {
      datePreset: 'custom',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      storeId: 'store-wangjing',
      keyword: 'Mate',
    })
    await finishRequest(store.applyQuery('sales'))

    const fetchRecords = vi.spyOn(mockApi, 'fetchRecords')
    await finishRequest(store.resetQuery('sales'))

    const expectedQuery = {
      datePreset: 'month' as const,
      ...getDateRange('month', mockReferenceDate),
      storeId: 'all',
      keyword: '',
    }
    expect(store.stateFor('sales').draftQuery).toEqual(expectedQuery)
    expect(store.stateFor('sales').appliedQuery).toEqual(expectedQuery)
    expect(store.stateFor('sales').page).toBe(1)
    expect(fetchRecords).toHaveBeenCalledWith('sales', expectedQuery, 1, 20)
  })

  it('initializes a business from the current store only once and reset keeps it initialized', async () => {
    const store = useRecordsStore()
    const storeWithInitializer = store as typeof store & {
      initializeFromStore: (type: 'recharge', storeId: string) => void
    }

    storeWithInitializer.initializeFromStore('recharge', 'store-wangjing')
    storeWithInitializer.initializeFromStore('recharge', 'store-guomao')

    expect(store.stateFor('recharge').draftQuery.storeId).toBe('store-wangjing')
    expect(store.stateFor('recharge').appliedQuery.storeId).toBe('store-wangjing')
    expect((store.stateFor('recharge') as { initialized?: boolean }).initialized).toBe(true)
    expect((store.stateFor('withdraw') as { initialized?: boolean }).initialized).toBe(false)

    await finishRequest(store.resetQuery('recharge'))
    storeWithInitializer.initializeFromStore('recharge', 'store-guomao')

    expect(store.stateFor('recharge').draftQuery.storeId).toBe('all')
    expect(store.stateFor('recharge').appliedQuery.storeId).toBe('all')
    expect((store.stateFor('recharge') as { initialized?: boolean }).initialized).toBe(true)
  })

  it('keeps each business query, records, and scroll position independent', async () => {
    const store = useRecordsStore()

    store.setDraft('withdraw', { keyword: 'TX2026000003' })
    store.saveScroll('withdraw', 648)
    await finishRequest(store.applyQuery('withdraw'))

    expect(store.stateFor('withdraw').items.map(({ id }) => id)).toEqual(['withdraw-003'])
    expect(store.restoreScroll('withdraw')).toBe(648)
    expect(store.stateFor('recharge').draftQuery.keyword).toBe('')
    expect(store.stateFor('recharge').items).toEqual([])
    expect(store.restoreScroll('recharge')).toBe(0)
    expect(useRecordsStore().restoreScroll('withdraw')).toBe(648)
  })

  it('loads exactly one 20-record page, ignores concurrent requests, and de-duplicates records', async () => {
    const store = useRecordsStore()
    store.setDraft('sales', {
      datePreset: 'custom',
      startDate: '2025-01-01',
      endDate: '2026-12-31',
    })
    await finishRequest(store.applyQuery('sales'))

    expect(store.stateFor('sales').items).toHaveLength(20)
    expect(store.stateFor('sales').hasMore).toBe(true)

    const duplicate = store.stateFor('sales').items[0]!
    const originalFetchRecords = mockApi.fetchRecords.bind(mockApi)
    const fetchRecords = vi
      .spyOn(mockApi, 'fetchRecords')
      .mockImplementation(async (...args: Parameters<typeof mockApi.fetchRecords>) => {
        const result = await originalFetchRecords(...args)
        return { ...result, items: [duplicate, ...result.items] }
      })
    const firstLoad = store.loadMore('sales')
    const duplicateLoad = store.loadMore('sales')
    await vi.advanceTimersByTimeAsync(200)
    await Promise.all([firstLoad, duplicateLoad])

    const ids = store.stateFor('sales').items.map(({ id }) => id)
    expect(fetchRecords).toHaveBeenCalledTimes(1)
    expect(fetchRecords).toHaveBeenCalledWith(
      'sales',
      store.stateFor('sales').appliedQuery,
      2,
      20,
    )
    expect(ids).toHaveLength(24)
    expect(new Set(ids).size).toBe(24)
    expect(store.stateFor('sales').page).toBe(2)
    expect(store.stateFor('sales').hasMore).toBe(false)
  })

  it('lets a new applied query supersede an in-flight load-more response', async () => {
    const store = useRecordsStore()
    store.setDraft('sales', {
      datePreset: 'custom',
      startDate: '2025-01-01',
      endDate: '2026-12-31',
    })
    await finishRequest(store.applyQuery('sales'))

    const oldPage = deferredPage()
    const newPage = deferredPage()
    const fetchRecords = vi
      .spyOn(mockApi, 'fetchRecords')
      .mockReturnValueOnce(oldPage.promise)
      .mockReturnValueOnce(newPage.promise)

    const loadMoreRequest = store.loadMore('sales')
    store.setDraft('sales', { keyword: 'XS2026000002' })
    const applyRequest = store.applyQuery('sales')

    newPage.resolve({ items: [salesRecords[1]!], total: 1, hasMore: false })
    await applyRequest
    oldPage.resolve({ items: [salesRecords[20]!], total: 24, hasMore: false })
    await loadMoreRequest

    expect(fetchRecords).toHaveBeenCalledTimes(2)
    expect(fetchRecords).toHaveBeenNthCalledWith(
      1,
      'sales',
      expect.objectContaining({ keyword: '' }),
      2,
      20,
    )
    expect(fetchRecords).toHaveBeenNthCalledWith(
      2,
      'sales',
      expect.objectContaining({ keyword: 'XS2026000002' }),
      1,
      20,
    )
    expect(store.stateFor('sales').appliedQuery.keyword).toBe('XS2026000002')
    expect(store.stateFor('sales').items.map(({ id }) => id)).toEqual(['sales-002'])
    expect(store.stateFor('sales').page).toBe(1)
    expect(store.stateFor('sales').total).toBe(1)
  })

  it('lets reset supersede an in-flight refresh response', async () => {
    const store = useRecordsStore()
    store.setDraft('recharge', { keyword: '85000' })
    await finishRequest(store.applyQuery('recharge'))

    const oldPage = deferredPage()
    const resetPage = deferredPage()
    const fetchRecords = vi
      .spyOn(mockApi, 'fetchRecords')
      .mockReturnValueOnce(oldPage.promise)
      .mockReturnValueOnce(resetPage.promise)

    const refreshRequest = store.refresh('recharge')
    const resetRequest = store.resetQuery('recharge')

    resetPage.resolve({
      items: [rechargeRecords[1]!, rechargeRecords[2]!],
      total: 2,
      hasMore: false,
    })
    await resetRequest
    oldPage.resolve({ items: [rechargeRecords[0]!], total: 1, hasMore: false })
    await refreshRequest

    const defaultQuery = {
      datePreset: 'month' as const,
      ...getDateRange('month', mockReferenceDate),
      storeId: 'all',
      keyword: '',
    }
    expect(fetchRecords).toHaveBeenCalledTimes(2)
    expect(fetchRecords).toHaveBeenNthCalledWith(
      1,
      'recharge',
      expect.objectContaining({ keyword: '85000' }),
      1,
      20,
    )
    expect(fetchRecords).toHaveBeenNthCalledWith(2, 'recharge', defaultQuery, 1, 20)
    expect(store.stateFor('recharge').draftQuery).toEqual(defaultQuery)
    expect(store.stateFor('recharge').appliedQuery).toEqual(defaultQuery)
    expect(store.stateFor('recharge').items.map(({ id }) => id)).toEqual([
      'recharge-002',
      'recharge-003',
    ])
    expect(store.stateFor('recharge').page).toBe(1)
    expect(store.stateFor('recharge').total).toBe(2)
  })

  it.each([
    ['refresh', (store: ReturnType<typeof useRecordsStore>) => store.refresh('sales')],
    [
      'applyQuery',
      (store: ReturnType<typeof useRecordsStore>) => {
        store.setDraft('sales', { keyword: 'XS2026000001' })
        return store.applyQuery('sales')
      },
    ],
    ['resetQuery', (store: ReturnType<typeof useRecordsStore>) => store.resetQuery('sales')],
  ])('does not let loadMore supersede an in-flight page-one %s request', async (_, pageOne) => {
    const store = useRecordsStore()
    const pageOneResult = deferredPage()
    const pageTwoResult = deferredPage()
    const fetchRecords = vi
      .spyOn(mockApi, 'fetchRecords')
      .mockReturnValueOnce(pageOneResult.promise)
      .mockReturnValueOnce(pageTwoResult.promise)

    const pageOneRequest = pageOne(store)
    const loadMoreRequest = store.loadMore('sales')

    pageTwoResult.resolve({ items: [salesRecords[20]!], total: 24, hasMore: false })
    pageOneResult.resolve({ items: [salesRecords[0]!], total: 1, hasMore: false })
    await Promise.all([pageOneRequest, loadMoreRequest])

    expect(fetchRecords).toHaveBeenCalledTimes(1)
    expect(fetchRecords).toHaveBeenCalledWith(
      'sales',
      store.stateFor('sales').appliedQuery,
      1,
      20,
    )
    expect(store.stateFor('sales')).toMatchObject({
      items: [salesRecords[0]],
      page: 1,
      total: 1,
      hasMore: false,
      loading: false,
      refreshing: false,
    })
  })

  it.each<Exclude<MockScenario, 'normal'>>(['network', 'expired', 'forbidden'])(
    'preserves the %s error kind',
    async (scenario) => {
      const store = useRecordsStore()
      mockApi.setScenario(scenario)

      await finishRequest(store.refresh('deposit'))

      expect(store.stateFor('deposit').errorKind).toBe(scenario)
      expect(store.stateFor('deposit').loading).toBe(false)
      expect(store.stateFor('deposit').refreshing).toBe(false)
    },
  )
})
