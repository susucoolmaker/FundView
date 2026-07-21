<script setup lang="ts">
import { computed } from 'vue'

import type { Notice } from '@/types'
import { getStatusTone } from '@/utils/status'

const props = defineProps<{
  status: string
  tone?: Notice['tone']
}>()

const resolvedTone = computed(() => props.tone ?? getStatusTone(props.status))
</script>

<template>
  <span class="status-tag" :class="`status-tag--${resolvedTone}`">{{ status }}</span>
</template>

<style scoped lang="scss">
.status-tag {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 4px 14px;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: 999px;
}

.status-tag--success {
  color: var(--color-success);
  background: #edf7ee;
  border-color: #cbe8ce;
}

.status-tag--warning {
  color: var(--color-processing);
  background: #fff7e8;
  border-color: #f5d9a5;
}

.status-tag--failure {
  color: var(--color-failure);
  background: #fff0f0;
  border-color: #f3c8cb;
}

.status-tag--neutral {
  color: var(--color-neutral);
  background: #f5f5f5;
  border-color: #e2e2e2;
}
</style>
