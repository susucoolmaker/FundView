<script setup lang="ts">
import { computed } from 'vue'

import type { Store } from '@/types'

const props = defineProps<{
  store: Store
}>()

const statusTone = computed(() => {
  if (props.store.bindingStatus === '已绑定') return 'success'
  if (props.store.bindingStatus === '绑定异常') return 'failure'
  return 'neutral'
})
</script>

<template>
  <article class="store-card" data-testid="store-card">
    <div class="store-card__heading">
      <div>
        <h3>{{ store.name }}</h3>
        <p>门店编码 {{ store.code }}</p>
      </div>
      <span
        class="store-card__status"
        :class="`store-card__status--${statusTone}`"
        data-testid="binding-status"
      >
        {{ store.bindingStatus }}
      </span>
    </div>

    <div class="store-card__employees">
      <span>已绑定员工</span>
      <strong>{{ store.boundEmployeeCount }} 人</strong>
    </div>
  </article>
</template>

<style scoped lang="scss">
.store-card {
  padding: 28px;
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  box-shadow: 0 6px 20px rgb(38 38 38 / 4%);
}

.store-card__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.store-card h3,
.store-card p {
  margin: 0;
}

.store-card h3 {
  color: var(--color-text-primary);
  font-size: 28px;
  line-height: 1.35;
  font-weight: 650;
}

.store-card p {
  margin-top: 8px;
  color: var(--color-text-tertiary);
  font-size: 21px;
  line-height: 1.4;
}

.store-card__status {
  display: inline-flex;
  flex: none;
  align-items: center;
  min-height: 42px;
  padding: 5px 14px;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: 999px;
}

.store-card__status--success {
  color: var(--color-success);
  background: #edf7ee;
  border-color: #cbe8ce;
}

.store-card__status--failure {
  color: var(--color-failure);
  background: #fff0f0;
  border-color: #f3c8cb;
}

.store-card__status--neutral {
  color: var(--color-neutral);
  background: #f5f5f5;
  border-color: #e2e2e2;
}

.store-card__employees {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  padding-top: 22px;
  color: var(--color-text-secondary);
  font-size: 22px;
  line-height: 1.4;
  border-top: 1px solid var(--color-divider);
}

.store-card__employees strong {
  color: var(--color-text-primary);
  font-size: 24px;
  font-weight: 650;
}
</style>
