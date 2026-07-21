import { computed } from 'vue'

import { useMerchantStore } from '@/stores/merchant'

export const useRecordStoreName = (getStoreId: () => string) => {
  const merchantStore = useMerchantStore()

  return computed(
    () =>
      merchantStore.stores.find((store) => store.id === getStoreId())?.name ?? '未知门店',
  )
}
