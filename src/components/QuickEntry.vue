<script setup lang="ts">
import { useRouter } from 'vue-router'

import type { BusinessType } from '@/types'

const router = useRouter()
const entries: Array<{ type: BusinessType; label: string; shortLabel: string }> = [
  { type: 'recharge', label: '充值明细', shortLabel: '充' },
  { type: 'withdraw', label: '提现明细', shortLabel: '提' },
  { type: 'deposit', label: '保证金', shortLabel: '保' },
  { type: 'sales', label: '销售明细', shortLabel: '售' },
]

const navigate = (type: BusinessType) => router.push(`/records/${type}`)
</script>

<template>
  <section class="quick-entry" aria-labelledby="quick-entry-title">
    <h2 id="quick-entry-title">常用功能</h2>
    <div class="quick-entry__grid">
      <button
        v-for="entry in entries"
        :key="entry.type"
        type="button"
        :data-testid="`quick-entry-${entry.type}`"
        @click="navigate(entry.type)"
      >
        <span class="quick-entry__icon" aria-hidden="true">{{ entry.shortLabel }}</span>
        <span>{{ entry.label }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped lang="scss">
.quick-entry {
  padding: 30px 24px 26px;
  background: var(--color-card-background);
  border: 1px solid rgb(38 38 38 / 5%);
  border-radius: 24px;
  box-shadow: 0 8px 28px rgb(38 38 38 / 4%);
}

.quick-entry h2 {
  margin: 0 8px 24px;
  font-size: 30px;
  line-height: 1.35;
  font-weight: 650;
}

.quick-entry__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.quick-entry button {
  display: flex;
  min-width: 0;
  min-height: 128px;
  padding: 12px 4px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--color-text-secondary);
  font-size: 22px;
  line-height: 1.25;
  background: transparent;
  border: 0;
  border-radius: 16px;
}

.quick-entry button:active {
  color: var(--color-primary);
  background: var(--color-primary-lighter);
}

.quick-entry__icon {
  display: grid;
  width: 64px;
  height: 64px;
  place-items: center;
  color: var(--color-primary);
  font-size: 27px;
  font-weight: 650;
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary-border);
  border-radius: 18px;
}
</style>
