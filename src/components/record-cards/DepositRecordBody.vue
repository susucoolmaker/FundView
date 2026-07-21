<script setup lang="ts">
import { computed } from 'vue'

import type { DepositRecord } from '@/types'
import { formatDateTime, formatMoney } from '@/utils/format'

import RecordAmountRow from './RecordAmountRow.vue'
import RecordCardHeader from './RecordCardHeader.vue'
import RecordMetaRow from './RecordMetaRow.vue'

const props = defineProps<{
  record: DepositRecord
}>()

const isDepositReturn = computed(
  () => props.record.depositType === '保证金扣除' || props.record.depositType === '保证金退回',
)
const amountSign = computed<'+' | '-'>(() =>
  isDepositReturn.value ? '-' : '+',
)
const normalizedDepositType = computed(() =>
  isDepositReturn.value ? '国补加盟退还保证金' : '国补加盟交纳保证金',
)
</script>

<template>
  <div class="record-body">
    <RecordCardHeader type-label="保证金" title="保证金记录" />
    <RecordAmountRow label="金额" :value="record.amount" :sign="amountSign" />
    <dl class="record-body__meta">
      <RecordMetaRow label="日期" :value="formatDateTime(record.date)" />
      <RecordMetaRow label="流水号" :value="record.serialNumber" identifier />
      <RecordMetaRow label="类型" :value="normalizedDepositType" />
      <RecordMetaRow label="状态" :value="record.status" />
      <RecordMetaRow
        v-if="record.balanceAfter !== undefined"
        label="变动后余额"
        :value="formatMoney(record.balanceAfter)"
      />
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
