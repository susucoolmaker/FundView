<script setup lang="ts">
import StatusTag from '@/components/StatusTag.vue'
import type { Notice } from '@/types'

defineProps<{
  typeLabel: string
  title: string
  status?: string
  statusTone?: Notice['tone']
}>()
</script>

<template>
  <header class="record-card-header">
    <div class="record-card-header__heading">
      <span>{{ typeLabel }}</span>
      <strong>{{ title }}</strong>
    </div>
    <StatusTag v-if="status" :status="status" :tone="statusTone" />
  </header>
</template>

<style scoped lang="scss">
.record-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.record-card-header__heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.record-card-header__heading span {
  flex: none;
  padding: 5px 12px;
  color: var(--color-primary);
  font-size: 19px;
  font-weight: 600;
  background: var(--color-primary-light);
  border-radius: 8px;
}

.record-card-header__heading strong {
  overflow: hidden;
  min-width: 0;
  font-size: 27px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
