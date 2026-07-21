import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { merchant, notices, stores } from '@/mock/merchant'

export const useMerchantStore = defineStore('merchant', () => {
  const selectedStoreId = ref<'all' | string>('all')
  const walletBalance = computed(() => merchant.walletBalance)
  const currentDepositBalance = computed(() =>
    selectedStoreId.value === 'all'
      ? stores.reduce((total, store) => total + store.currentDepositBalance, 0)
      : (stores.find((store) => store.id === selectedStoreId.value)?.currentDepositBalance ?? 0),
  )

  const selectStore = (id: 'all' | string) => {
    selectedStoreId.value = id
  }

  return {
    merchant,
    stores,
    notices,
    selectedStoreId,
    walletBalance,
    currentDepositBalance,
    selectStore,
  }
})
