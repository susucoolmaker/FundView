<script setup lang="ts">
import { recordConfigs } from '@/config/record-config'
import type { BusinessType } from '@/types'

defineProps<{
  activeType: BusinessType
}>()

const emit = defineEmits<{
  select: [type: BusinessType]
}>()

const types: BusinessType[] = ['recharge', 'withdraw', 'deposit', 'sales']
</script>

<template>
  <nav class="record-tabs" aria-label="明细类型">
    <button
      v-for="type in types"
      :key="type"
      type="button"
      class="record-tabs__tab"
      :class="{ 'record-tabs__tab--active': type === activeType }"
      :data-testid="`tab-${type}`"
      :aria-current="type === activeType ? 'page' : undefined"
      @click="emit('select', type)"
    >
      {{ recordConfigs[type].tabLabel }}
    </button>
  </nav>
</template>

<style scoped lang="scss">
.record-tabs {
  position: sticky;
  z-index: 15;
  top: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  width: 100%;
  background: #fff;
  border-bottom: 1px solid var(--color-divider);
}

.record-tabs__tab {
  position: relative;
  min-width: 0;
  min-height: 88px;
  padding: 0 8px;
  color: var(--color-text-secondary);
  font-size: 28px;
  font-weight: 500;
  background: transparent;
  border: 0;
}

.record-tabs__tab::after {
  position: absolute;
  right: 30%;
  bottom: 0;
  left: 30%;
  height: 5px;
  background: transparent;
  border-radius: 999px;
  content: '';
}

.record-tabs__tab--active {
  color: var(--color-primary);
  font-weight: 650;
}

.record-tabs__tab--active::after {
  background: var(--color-primary);
}
</style>
