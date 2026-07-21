<script setup lang="ts">
import type { BusinessRecord } from '@/types'

import DepositRecordBody from './record-cards/DepositRecordBody.vue'
import RechargeRecordBody from './record-cards/RechargeRecordBody.vue'
import SalesRecordBody from './record-cards/SalesRecordBody.vue'
import WithdrawRecordBody from './record-cards/WithdrawRecordBody.vue'

const props = defineProps<{
  record: BusinessRecord
}>()

const emit = defineEmits<{
  open: [record: BusinessRecord]
}>()
</script>

<template>
  <article
    class="record-card"
    role="button"
    tabindex="0"
    data-testid="record-card"
    :data-record-id="record.id"
    :data-record-type="record.type"
    @click="emit('open', record)"
    @keydown.enter="emit('open', record)"
    @keydown.space.prevent="emit('open', record)"
  >
    <RechargeRecordBody v-if="record.type === 'recharge'" :record="record" />
    <WithdrawRecordBody v-else-if="record.type === 'withdraw'" :record="record" />
    <DepositRecordBody v-else-if="record.type === 'deposit'" :record="record" />
    <SalesRecordBody v-else :record="record" />
  </article>
</template>

<style scoped lang="scss">
.record-card {
  width: 100%;
  padding: 24px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  box-shadow: 0 5px 18px rgb(38 38 38 / 5%);
  cursor: pointer;
}

.record-card:active {
  background: var(--color-primary-lighter);
}

.record-card:focus-visible {
  outline: 4px solid var(--color-primary-border);
  outline-offset: 2px;
}

</style>
