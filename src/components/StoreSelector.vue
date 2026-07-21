<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { Store } from '@/types'

interface StoreOption {
  text: string
  value: string
}

const props = defineProps<{
  stores: Store[]
  selectedStoreId: string
}>()

const emit = defineEmits<{
  confirm: [id: string]
}>()

const showPicker = ref(false)
const pickerValue = ref<Array<string | number>>([props.selectedStoreId])
const options = computed<StoreOption[]>(() => [
  { text: '全部门店', value: 'all' },
  ...props.stores.map((store) => ({ text: store.name, value: store.id })),
])
const selectedStoreName = computed(() => {
  if (props.stores.length === 1) return props.stores[0]!.name
  return options.value.find((option) => option.value === props.selectedStoreId)?.text ?? '全部门店'
})
const canSwitch = computed(() => props.stores.length > 1)

watch(
  () => props.selectedStoreId,
  (value) => {
    pickerValue.value = [value]
  },
)

const selectStore = (id: string) => {
  pickerValue.value = [id]
  emit('confirm', id)
  showPicker.value = false
}

const handleConfirm = ({ selectedOptions }: { selectedOptions: StoreOption[] }) => {
  const option = selectedOptions[0]
  if (option) selectStore(option.value)
}

const handleOptionClick = ({ currentOption }: { currentOption: StoreOption }) => {
  selectStore(currentOption.value)
}
</script>

<template>
  <div class="store-selector">
    <button
      type="button"
      class="store-selector__trigger"
      :class="{ 'store-selector__trigger--static': !canSwitch }"
      data-testid="store-trigger"
      :aria-label="canSwitch ? '选择门店' : `当前门店：${selectedStoreName}`"
      :aria-haspopup="canSwitch ? 'dialog' : undefined"
      :aria-expanded="canSwitch ? showPicker : undefined"
      :disabled="!canSwitch"
      @click="showPicker = true"
    >
      <span class="store-selector__caption">当前门店</span>
      <span class="store-selector__name">{{ selectedStoreName }}</span>
      <span v-if="canSwitch" class="store-selector__chevron" aria-hidden="true">⌄</span>
    </button>

    <van-popup
      v-if="canSwitch"
      v-model:show="showPicker"
      position="bottom"
      round
      safe-area-inset-bottom
      closeable
      aria-label="选择门店"
    >
      <van-picker
        v-model="pickerValue"
        title="选择门店"
        :columns="options"
        :columns-field-names="{ text: 'text', value: 'value' }"
        @confirm="handleConfirm"
        @cancel="showPicker = false"
        @click-option="handleOptionClick"
      >
        <template #option="option">
          <span :data-testid="`store-option-${option.value}`">{{ option.text }}</span>
        </template>
      </van-picker>
    </van-popup>
  </div>
</template>

<style scoped lang="scss">
.store-selector {
  flex: 0 1 286px;
  min-width: 0;
}

.store-selector__trigger {
  position: relative;
  display: grid;
  width: 100%;
  min-height: 88px;
  padding: 12px 48px 12px 22px;
  color: var(--color-text-primary);
  text-align: left;
  background: var(--color-primary-lighter);
  border: 1px solid var(--color-primary-border);
  border-radius: 18px;
}

.store-selector__trigger:active {
  background: var(--color-primary-light);
}

.store-selector__trigger--static {
  padding-right: 22px;
}

.store-selector__trigger:disabled {
  opacity: 1;
}

.store-selector__caption {
  color: var(--color-text-tertiary);
  font-size: 20px;
  line-height: 1.3;
}

.store-selector__name {
  overflow: hidden;
  font-size: 26px;
  line-height: 1.35;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.store-selector__chevron {
  position: absolute;
  top: 50%;
  right: 20px;
  color: var(--color-primary);
  font-size: 28px;
  transform: translateY(-58%);
}

:deep(.van-popup) {
  overflow: hidden;
}

:deep(.van-picker__confirm) {
  color: var(--color-primary);
}
</style>
