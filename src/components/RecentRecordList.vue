<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import AmountDisplay from '@/components/AmountDisplay.vue'
import StatusTag from '@/components/StatusTag.vue'
import type { BusinessRecord, BusinessType, Notice, Store } from '@/types'
import { formatDateTime } from '@/utils/format'

const props = defineProps<{
  records: BusinessRecord[]
  stores: Store[]
  selectedStoreId: string
}>()

const router = useRouter()
const storeNames = computed(() => new Map(props.stores.map((store) => [store.id, store.name])))
const visibleRecords = computed(() =>
  props.records
    .filter(
      (record) => props.selectedStoreId === 'all' || record.storeId === props.selectedStoreId,
    )
    .slice()
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 5),
)

const typeLabels: Record<BusinessType, string> = {
  recharge: '充值',
  withdraw: '提现',
  deposit: '保证金',
  sales: '销售',
}

const getTitle = (record: BusinessRecord) => {
  if (record.type === 'deposit') return record.depositType
  if (record.type === 'sales') return record.productName
  return `${typeLabels[record.type]}记录`
}

const getStatus = (record: BusinessRecord): { label: string; tone?: Notice['tone'] } => {
  if (record.type === 'recharge') return { label: '充值成功', tone: 'success' }
  if (record.type === 'sales') return { label: record.settlementStatus }
  return { label: record.status }
}

const getAmountSign = (record: BusinessRecord): '+' | '-' => {
  if (record.type === 'withdraw') return '-'
  if (
    record.type === 'deposit' &&
    (record.depositType === '保证金扣除' || record.depositType === '保证金退回')
  ) {
    return '-'
  }
  return '+'
}

const navigateToDetail = (record: BusinessRecord) =>
  router.push(`/detail/${record.type}/${record.id}`)
</script>

<template>
  <section class="recent-records" aria-labelledby="recent-records-title">
    <div class="recent-records__heading">
      <div>
        <h2 id="recent-records-title">最近记录</h2>
        <p>按业务时间展示最近 5 条</p>
      </div>
      <span>{{ selectedStoreId === 'all' ? '全部门店' : '当前门店' }}</span>
    </div>

    <div v-if="visibleRecords.length" class="recent-records__list">
      <button
        v-for="record in visibleRecords"
        :key="`${record.type}-${record.id}`"
        type="button"
        class="recent-records__card"
        data-testid="recent-record"
        :data-record-id="record.id"
        :data-record-type="record.type"
        :data-store-id="record.storeId"
        @click="navigateToDetail(record)"
      >
        <span class="recent-records__topline">
          <span class="recent-records__type">{{ typeLabels[record.type] }}</span>
          <StatusTag :status="getStatus(record).label" :tone="getStatus(record).tone" />
        </span>
        <span class="recent-records__mainline">
          <span class="recent-records__title">{{ getTitle(record) }}</span>
          <AmountDisplay :value="record.amount" :sign="getAmountSign(record)" />
        </span>
        <span class="recent-records__meta">
          <span>{{ storeNames.get(record.storeId) ?? '未知门店' }}</span>
          <time :datetime="record.date">{{ formatDateTime(record.date) }}</time>
        </span>
      </button>
    </div>

    <div v-else class="recent-records__empty">当前门店暂无记录</div>
  </section>
</template>

<style scoped lang="scss">
.recent-records {
  overflow: hidden;
  background: var(--color-card-background);
  border: 1px solid rgb(38 38 38 / 5%);
  border-radius: 24px;
  box-shadow: 0 8px 28px rgb(38 38 38 / 4%);
}

.recent-records__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 30px 32px 24px;
  border-bottom: 1px solid var(--color-divider);
}

.recent-records__heading h2,
.recent-records__heading p {
  margin: 0;
}

.recent-records__heading h2 {
  font-size: 30px;
  line-height: 1.35;
  font-weight: 650;
}

.recent-records__heading p {
  margin-top: 5px;
  color: var(--color-text-tertiary);
  font-size: 20px;
  line-height: 1.35;
}

.recent-records__heading > span {
  margin-top: 3px;
  color: var(--color-primary);
  font-size: 20px;
  line-height: 1.4;
  white-space: nowrap;
}

.recent-records__list {
  padding: 0 24px;
}

.recent-records__card {
  display: block;
  width: 100%;
  min-height: 176px;
  padding: 26px 8px;
  color: var(--color-text-primary);
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--color-divider);
}

.recent-records__card:last-child {
  border-bottom: 0;
}

.recent-records__card:active {
  background: var(--color-primary-lighter);
}

.recent-records__topline,
.recent-records__mainline,
.recent-records__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  gap: 20px;
}

.recent-records__topline {
  margin-bottom: 14px;
}

.recent-records__type {
  color: var(--color-primary);
  font-size: 20px;
  line-height: 1.3;
  font-weight: 650;
}

.recent-records__mainline {
  margin-bottom: 12px;
}

.recent-records__title {
  min-width: 0;
  overflow: hidden;
  font-size: 27px;
  line-height: 1.35;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-records__meta {
  justify-content: flex-start;
  color: var(--color-text-tertiary);
  font-size: 20px;
  line-height: 1.35;
}

.recent-records__meta span {
  position: relative;
  padding-right: 20px;
}

.recent-records__meta span::after {
  position: absolute;
  top: 50%;
  right: 0;
  width: 4px;
  height: 4px;
  background: var(--color-text-tertiary);
  border-radius: 50%;
  content: '';
  transform: translateY(-50%);
}

.recent-records__empty {
  padding: 80px 32px;
  color: var(--color-text-tertiary);
  font-size: 24px;
  text-align: center;
}
</style>
