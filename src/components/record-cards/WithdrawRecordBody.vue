<script setup lang="ts">
import type { WithdrawRecord } from '@/types'
import { formatDateTime } from '@/utils/format'

import RecordAmountRow from './RecordAmountRow.vue'
import RecordCardHeader from './RecordCardHeader.vue'
import RecordMetaRow from './RecordMetaRow.vue'

const props = defineProps<{
  record: WithdrawRecord
}>()
</script>

<template>
  <div class="record-body">
    <RecordCardHeader type-label="提现" title="商户提现" />
    <RecordAmountRow label="提现金额" :value="record.amount" sign="-" />
    <dl class="record-body__meta">
      <RecordMetaRow label="日期" :value="formatDateTime(record.date)" />
      <RecordMetaRow label="流水号" :value="record.serialNumber" identifier />
      <RecordMetaRow label="备注" :value="record.remark || '无备注'" />
    </dl>
  </div>
</template>

<style scoped lang="scss">
.record-body__meta {
  display: grid;
  gap: 12px;
  margin: 18px 0 0;
}
</style>
