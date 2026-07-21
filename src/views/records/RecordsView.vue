<script setup lang="ts">
import { computed, nextTick, onActivated, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'

import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'
import RecordCard from '@/components/RecordCard.vue'
import RecordFilter from '@/components/RecordFilter.vue'
import RecordTabs from '@/components/RecordTabs.vue'
import { recordConfigs } from '@/config/record-config'
import { useMerchantStore } from '@/stores/merchant'
import { useRecordsStore, type RecordErrorKind } from '@/stores/records'
import type { BusinessRecord, BusinessType, DatePreset, QueryCondition } from '@/types'

const route = useRoute()
const router = useRouter()
const merchantStore = useMerchantStore()
const recordsStore = useRecordsStore()

const type = computed(() => route.params.type as BusinessType)
const config = computed(() => recordConfigs[type.value])
const state = computed(() => recordsStore.stateFor(type.value))
let restorationToken = 0
let scrollOwner: BusinessType | null = null

const dateLabels: Record<DatePreset, string> = {
  today: '今天',
  month: '本月',
  lastMonth: '上月',
  custom: '自定义',
}
const errorContent: Record<RecordErrorKind, { title: string; description: string }> = {
  network: {
    title: '网络连接异常，请检查网络后重试',
    description: '已保留当前查询条件，网络恢复后可直接重试。',
  },
  expired: {
    title: '登录状态已过期，请重新登录',
    description: '重新进入企业微信工作台后再查看。',
  },
  forbidden: {
    title: '暂无权限查看该类记录',
    description: '如需查看，请联系商户管理员开通权限。',
  },
}

const storeName = (storeId: string) =>
  storeId === 'all'
    ? '全部门店'
    : (merchantStore.stores.find((store) => store.id === storeId)?.name ?? '未知门店')

const dateSummary = (query: QueryCondition) =>
  query.datePreset === 'custom'
    ? `${query.startDate.slice(5).replace('-', '/')} - ${query.endDate.slice(5).replace('-', '/')}`
    : dateLabels[query.datePreset]

const appliedSummary = computed(() => {
  const query = state.value.appliedQuery
  return [
    dateSummary(query),
    storeName(query.storeId),
    query.keyword ? `关键词：${query.keyword}` : '',
    `共 ${state.value.total} 条`,
  ]
    .filter(Boolean)
    .join(' · ')
})

const hasAppliedFilters = computed(() => {
  const query = state.value.appliedQuery
  return query.datePreset !== 'month' || query.storeId !== 'all' || Boolean(query.keyword)
})

const ensureLoadedAndRestore = async (businessType: BusinessType) => {
  const currentToken = ++restorationToken
  scrollOwner = null
  recordsStore.initializeFromStore(businessType, merchantStore.selectedStoreId)
  await nextTick()
  const listState = recordsStore.stateFor(businessType)
  if (listState.page === 0 && !listState.loading) await recordsStore.loadMore(businessType)
  await nextTick()
  if (currentToken !== restorationToken || type.value !== businessType) return
  window.scrollTo({
    top: recordsStore.restoreScroll(businessType),
    behavior: 'auto',
  })
  scrollOwner = businessType
}

watch(type, ensureLoadedAndRestore, { immediate: true })

onBeforeRouteUpdate((to, from) => {
  const previousType = from.params.type as BusinessType
  if (to.params.type !== previousType) {
    if (scrollOwner === previousType) {
      recordsStore.saveScroll(previousType, window.scrollY)
    }
    scrollOwner = null
  }
})

onBeforeRouteLeave((_to, from) => {
  restorationToken += 1
  const previousType = from.params.type as BusinessType
  if (scrollOwner === previousType) {
    recordsStore.saveScroll(previousType, window.scrollY)
  }
  scrollOwner = null
})

onActivated(async () => {
  await nextTick()
  window.scrollTo({
    top: recordsStore.restoreScroll(type.value),
    behavior: 'auto',
  })
  scrollOwner = type.value
})

const switchType = (nextType: BusinessType) => {
  if (nextType !== type.value) router.push(`/records/${nextType}`)
}

const updateDraft = (patch: Partial<QueryCondition>) => recordsStore.setDraft(type.value, patch)

const applyQuery = async () => {
  recordsStore.setDraft(type.value, { keyword: state.value.draftQuery.keyword.trim() })
  await recordsStore.applyQuery(type.value)
}

const resetQuery = () => recordsStore.resetQuery(type.value)
const retry = () => recordsStore.refresh(type.value)
const openDetail = (record: BusinessRecord) => router.push(`/detail/${record.type}/${record.id}`)
</script>

<template>
  <section class="records-view">
    <RecordTabs :active-type="type" @select="switchType" />
    <RecordFilter
      :config="config"
      :query="state.draftQuery"
      :stores="merchantStore.stores"
      @update="updateDraft"
      @query="applyQuery"
      @reset="resetQuery"
    />

    <div class="records-view__summary" data-testid="applied-summary">
      <span>{{ appliedSummary }}</span>
      <span>已应用条件</span>
    </div>

    <div class="records-view__content">
      <van-pull-refresh
        :key="type"
        v-model="state.refreshing"
        data-testid="records-pull-refresh"
        @refresh="recordsStore.refresh(type)"
      >
        <van-list
          data-testid="records-list"
          :loading="state.loading"
          :finished="Boolean(state.errorKind) || !state.hasMore"
          :finished-text="
            !state.errorKind && state.items.length && !state.hasMore ? '没有更多数据了' : ''
          "
          @load="recordsStore.loadMore(type)"
        >
          <LoadingState v-if="state.loading && !state.items.length" />

          <EmptyState
            v-else-if="state.errorKind"
            :title="errorContent[state.errorKind].title"
            :description="errorContent[state.errorKind].description"
            action-label="重试"
            action-test-id="retry-button"
            @action="retry"
          />

          <EmptyState
            v-else-if="!state.items.length && !state.hasMore"
            :title="
              hasAppliedFilters ? '没有找到符合条件的记录' : config.emptyText
            "
            :description="
              hasAppliedFilters
                ? '请调整筛选条件后重新查询。'
                : '该分类暂时还没有业务记录。'
            "
            :action-label="hasAppliedFilters ? '重置条件' : undefined"
            action-test-id="empty-reset-button"
            @action="resetQuery"
          />

          <div v-else class="records-view__list">
            <RecordCard
              v-for="record in state.items"
              :key="record.id"
              :record="record"
              @open="openDetail"
            />
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </section>
</template>

<style scoped lang="scss">
.records-view {
  width: 100%;
  max-width: 750px;
  min-height: 100vh;
  margin: 0 auto;
  overflow-x: hidden;
}

.records-view__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin: 22px 24px 0;
  padding: 0 4px;
  color: var(--color-text-secondary);
  font-size: 22px;
  line-height: 1.45;
}

.records-view__summary span:first-child {
  min-width: 0;
  overflow-wrap: anywhere;
}

.records-view__summary span:last-child {
  flex: none;
  color: var(--color-text-tertiary);
  font-size: 19px;
}

.records-view__content {
  margin: 16px 24px 0;
}

.records-view__list {
  display: grid;
  gap: 18px;
}

:deep(.van-list__finished-text),
:deep(.van-list__loading) {
  min-height: 88px;
  color: var(--color-text-tertiary);
  font-size: 22px;
  line-height: 88px;
}
</style>
