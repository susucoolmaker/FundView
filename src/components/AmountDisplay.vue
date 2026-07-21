<script setup lang="ts">
import { formatMoney } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    value: number
    sign?: '+' | '-'
    size?: 'hero' | 'metric' | 'record'
    testId?: string
  }>(),
  { size: 'record' },
)
</script>

<template>
  <span
    class="amount-display"
    :class="`amount-display--${props.size}`"
    :data-testid="props.testId"
  >
    {{ formatMoney(props.value, props.sign ? { sign: props.sign } : {}) }}
  </span>
</template>

<style scoped lang="scss">
.amount-display {
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  font-weight: 650;
  white-space: nowrap;
}

.amount-display--hero {
  color: var(--color-primary);
  font-size: 58px;
  line-height: 1.16;
  letter-spacing: -1px;
}

.amount-display--metric {
  font-size: 28px;
  line-height: 1.25;
}

.amount-display--record {
  font-size: 30px;
  line-height: 1.25;
}
</style>
