<script setup lang="ts">
import { computed } from 'vue'

import type { SalesRecord } from '@/types'
import { formatDateTime } from '@/utils/format'

import RecordAmountRow from './RecordAmountRow.vue'
import RecordCardHeader from './RecordCardHeader.vue'
import RecordMetaRow from './RecordMetaRow.vue'

const props = defineProps<{
  record: SalesRecord
}>()

const displaySettlementStatus = computed(() => {
  if (props.record.settlementStatus === '待结款') return '待审核'
  if (props.record.settlementStatus === '部分结款') return '无需结款'
  return props.record.settlementStatus
})
const settlementStatusTone = computed(() =>
  displaySettlementStatus.value === '无需结款' ? 'neutral' : undefined,
)
</script>

<template>
  <div class="record-body">
    <RecordCardHeader
      type-label="销售"
      title="销售订单"
      :status="displaySettlementStatus"
      :status-tone="settlementStatusTone"
    />
    <dl class="record-body__meta record-body__meta--before-amount">
      <RecordMetaRow label="商品名称" :value="record.productName" />
      <RecordMetaRow label="销售日期" :value="formatDateTime(record.date)" />
      <RecordMetaRow label="销售单ID" :value="record.salesOrderNumber" identifier />
    </dl>
    <RecordAmountRow label="订单金额" :value="record.amount" />
  </div>
</template>

<style scoped lang="scss">
.record-body__meta {
  display: grid;
  gap: 12px;
  margin: 18px 0 0;
}

.record-body__meta--before-amount {
  margin-top: 18px;
  margin-bottom: 0;
}
</style>
