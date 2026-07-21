<script setup lang="ts">
import { Icon as VanIcon } from 'vant'
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useRecordsStore } from '@/stores/records'
import type { BusinessType } from '@/types'

const route = useRoute()
const router = useRouter()
const recordsStore = useRecordsStore()

const navItems = [
  { name: 'dashboard', label: '首页', icon: 'wap-home-o' },
  { name: 'records', label: '销售明细', icon: 'orders-o' },
  { name: 'profile', label: '我的', icon: 'user-o' },
] as const

watch(
  () => route.path,
  (path) => {
    const match = path.match(/^\/records\/(recharge|withdraw|deposit|sales)$/)
    if (match) recordsStore.rememberBusinessType(match[1] as BusinessType)
  },
  { immediate: true },
)

const active = computed(() =>
  route.path.startsWith('/records')
    ? 'records'
    : route.path === '/profile'
      ? 'profile'
      : 'dashboard',
)

const navigate = (name: (typeof navItems)[number]['name']) => {
  const destinations = {
    dashboard: '/dashboard',
    records: '/records/sales',
    profile: '/profile',
  }
  if (route.path !== destinations[name]) router.push(destinations[name])
}
</script>

<template>
  <nav class="bottom-navigation" aria-label="主导航">
    <button
      v-for="item in navItems"
      :key="item.name"
      :class="{ active: active === item.name }"
      :data-nav="item.name"
      :aria-current="active === item.name ? 'page' : undefined"
      @click="navigate(item.name)"
    >
      <VanIcon :name="item.icon" aria-hidden="true" />
      <span>{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped lang="scss">
.bottom-navigation button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 92px;
  padding: 9px 12px 7px;
  font-size: 20px;
  line-height: 1.2;
  border: 0;
}

.bottom-navigation :deep(.van-icon) {
  font-size: 39px;
  line-height: 1;
}

.bottom-navigation button.active span {
  font-weight: 650;
}
</style>
