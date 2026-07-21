import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

import { mockReferenceDate } from '@/mock/reference'
import { mockApi } from '@/mock/service'
import type { BusinessRecord, BusinessType, QueryCondition } from '@/types'
import { getDateRange } from '@/utils/format'

const PAGE_SIZE = 20
const businessTypes: BusinessType[] = ['recharge', 'withdraw', 'deposit', 'sales']

export type RecordErrorKind = 'network' | 'expired' | 'forbidden'

export interface RecordListState {
  initialized: boolean
  draftQuery: QueryCondition
  appliedQuery: QueryCondition
  items: BusinessRecord[]
  page: number
  total: number
  hasMore: boolean
  loading: boolean
  refreshing: boolean
  errorKind: RecordErrorKind | null
  scrollTop: number
}

const createDefaultQuery = (): QueryCondition => ({
  datePreset: 'month',
  ...getDateRange('month', mockReferenceDate),
  storeId: 'all',
  keyword: '',
})

const createListState = (): RecordListState => {
  const defaultQuery = createDefaultQuery()

  return {
    initialized: false,
    draftQuery: { ...defaultQuery },
    appliedQuery: { ...defaultQuery },
    items: [],
    page: 0,
    total: 0,
    hasMore: true,
    loading: false,
    refreshing: false,
    errorKind: null,
    scrollTop: 0,
  }
}

const getErrorKind = (error: unknown): RecordErrorKind => {
  if (typeof error === 'object' && error !== null && 'kind' in error) {
    const { kind } = error as { kind?: unknown }
    if (kind === 'expired' || kind === 'forbidden') return kind
  }

  return 'network'
}

const uniqueRecords = (records: BusinessRecord[]) => {
  const seen = new Set<string>()
  return records.filter((record) => {
    if (seen.has(record.id)) return false
    seen.add(record.id)
    return true
  })
}

export const useRecordsStore = defineStore('records', () => {
  const lastVisitedType = ref<BusinessType>('recharge')
  const states = reactive(
    Object.fromEntries(businessTypes.map((type) => [type, createListState()])) as Record<
      BusinessType,
      RecordListState
    >,
  )
  const requestTokens = Object.fromEntries(businessTypes.map((type) => [type, 0])) as Record<
    BusinessType,
    number
  >
  const activeLoadMoreTokens = Object.fromEntries(
    businessTypes.map((type) => [type, null]),
  ) as Record<BusinessType, number | null>

  const stateFor = (type: BusinessType) => states[type]

  const rememberBusinessType = (type: BusinessType) => {
    lastVisitedType.value = type
  }

  const setDraft = (type: BusinessType, patch: Partial<QueryCondition>) => {
    Object.assign(stateFor(type).draftQuery, patch)
  }

  const initializeFromStore = (type: BusinessType, storeId: string) => {
    const state = stateFor(type)
    if (state.initialized) return

    state.initialized = true
    state.draftQuery = { ...state.draftQuery, storeId }
    state.appliedQuery = { ...state.appliedQuery, storeId }
  }

  const requestPage = async (
    type: BusinessType,
    page: number,
    options: { append: boolean; refreshing: boolean },
  ) => {
    const state = stateFor(type)
    if (options.append && activeLoadMoreTokens[type] === requestTokens[type]) return

    const requestToken = ++requestTokens[type]
    if (options.append) activeLoadMoreTokens[type] = requestToken
    const query = { ...state.appliedQuery }

    state.loading = !options.refreshing
    state.refreshing = options.refreshing
    state.errorKind = null

    try {
      const result = await mockApi.fetchRecords(type, query, page, PAGE_SIZE)
      if (requestToken !== requestTokens[type]) return

      state.items = uniqueRecords(options.append ? [...state.items, ...result.items] : result.items)
      state.page = page
      state.total = result.total
      state.hasMore = result.hasMore
    } catch (error) {
      if (requestToken !== requestTokens[type]) return
      state.errorKind = getErrorKind(error)
    } finally {
      if (activeLoadMoreTokens[type] === requestToken) activeLoadMoreTokens[type] = null
      if (requestToken === requestTokens[type]) {
        state.loading = false
        state.refreshing = false
      }
    }
  }

  const applyQuery = async (type: BusinessType) => {
    const state = stateFor(type)
    state.appliedQuery = { ...state.draftQuery }
    await requestPage(type, 1, { append: false, refreshing: false })
  }

  const resetQuery = async (type: BusinessType) => {
    const state = stateFor(type)
    const defaultQuery = createDefaultQuery()
    state.draftQuery = { ...defaultQuery }
    state.appliedQuery = { ...defaultQuery }
    await requestPage(type, 1, { append: false, refreshing: true })
  }

  const refresh = async (type: BusinessType) => {
    await requestPage(type, 1, { append: false, refreshing: true })
  }

  const loadMore = async (type: BusinessType) => {
    const state = stateFor(type)
    if (!state.hasMore || state.loading || state.refreshing) return
    await requestPage(type, state.page + 1, { append: true, refreshing: false })
  }

  const saveScroll = (type: BusinessType, scrollTop: number) => {
    stateFor(type).scrollTop = scrollTop
  }

  const restoreScroll = (type: BusinessType) => stateFor(type).scrollTop

  return {
    lastVisitedType,
    states,
    stateFor,
    rememberBusinessType,
    initializeFromStore,
    setDraft,
    applyQuery,
    resetQuery,
    refresh,
    loadMore,
    saveScroll,
    restoreScroll,
  }
})
