<script setup lang="ts">
import AmountDisplay from '@/components/AmountDisplay.vue'

defineProps<{
  label: string
  value: number
  sign?: '+' | '-'
}>()
</script>

<template>
  <div class="record-amount-row">
    <span class="record-amount-row__label">{{ label }}</span>
    <div class="record-amount-row__value-side">
      <AmountDisplay :value="value" :sign="sign" class="record-amount-row__value" />
      <span class="record-amount-row__arrow" aria-hidden="true">›</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.record-amount-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 20px;
  padding: 20px 0;
  border-top: 1px solid var(--color-divider);
  border-bottom: 1px solid var(--color-divider);
}

.record-amount-row__label {
  flex: none;
  color: var(--color-text-tertiary);
  font-size: 20px;
}

.record-amount-row__value-side {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  margin-left: auto;
}

.record-amount-row__value {
  color: var(--color-text-primary);
  font-size: 36px;
  line-height: 1.2;
  font-weight: 700;
  text-align: right;
}

.record-amount-row__arrow {
  flex: none;
  color: var(--color-text-tertiary);
  font-size: 45px;
  line-height: 1;
}
</style>
