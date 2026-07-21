<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { RecordConfig } from '@/config/record-config'
import { mockReferenceDate } from '@/mock/reference'
import type { DatePreset, QueryCondition, Store } from '@/types'
import { getDateRange } from '@/utils/format'

interface StoreOption {
  text: string
  value: string
}

const props = defineProps<{
  config: RecordConfig
  query: QueryCondition
  stores: Store[]
}>()

const emit = defineEmits<{
  update: [patch: Partial<QueryCondition>]
  query: []
  reset: []
}>()

const showDatePopup = ref(false)
const showCalendar = ref(false)
const showStorePopup = ref(false)
const pickerValue = ref<Array<string | number>>([props.query.storeId])

const datePresetLabels: Record<DatePreset, string> = {
  today: '今天',
  month: '本月',
  lastMonth: '上月',
  custom: '自定义',
}

const storeOptions = computed<StoreOption[]>(() => [
  { text: '全部门店', value: 'all' },
  ...props.stores.map((store) => ({ text: store.name, value: store.id })),
])
const selectedStoreName = computed(
  () => storeOptions.value.find((option) => option.value === props.query.storeId)?.text ?? '全部门店',
)
const dateLabel = computed(() => {
  if (props.query.datePreset !== 'custom') return datePresetLabels[props.query.datePreset]
  return `${props.query.startDate.slice(5).replace('-', '/')} - ${props.query.endDate
    .slice(5)
    .replace('-', '/')}`
})

watch(
  () => props.query.storeId,
  (storeId) => {
    pickerValue.value = [storeId]
  },
)

const toCalendarDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year!, month! - 1, day)
}

const calendarDefaultDate = computed(() => [
  toCalendarDate(props.query.startDate),
  toCalendarDate(props.query.endDate),
])

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`

const selectPreset = (preset: Exclude<DatePreset, 'custom'>) => {
  emit('update', { datePreset: preset, ...getDateRange(preset, mockReferenceDate) })
  showDatePopup.value = false
}

const openCalendar = () => {
  showDatePopup.value = false
  showCalendar.value = true
}

const confirmRange = (dates: Date[]) => {
  const [startDate, endDate] = dates
  if (!startDate || !endDate) return
  emit('update', {
    datePreset: 'custom',
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  })
  showCalendar.value = false
}

const selectStore = (id: string) => {
  pickerValue.value = [id]
  emit('update', { storeId: id })
  showStorePopup.value = false
}

const confirmStore = ({ selectedOptions }: { selectedOptions: StoreOption[] }) => {
  const option = selectedOptions[0]
  if (option) selectStore(option.value)
}

const clickStoreOption = ({ currentOption }: { currentOption: StoreOption }) => {
  selectStore(currentOption.value)
}
</script>

<template>
  <section class="record-filter" aria-labelledby="record-filter-title">
    <header class="record-filter__header">
      <div>
        <h1 id="record-filter-title">{{ config.listTitle }}</h1>
        <p>按日期、门店或关键词查询</p>
      </div>
      <button
        type="button"
        class="record-filter__reset"
        data-testid="reset-button"
        @click="emit('reset')"
      >
        重置
      </button>
    </header>

    <div class="record-filter__selectors">
      <button
        type="button"
        class="record-filter__selector"
        data-testid="date-trigger"
        aria-haspopup="dialog"
        :aria-expanded="showDatePopup"
        @click="showDatePopup = true"
      >
        <span class="record-filter__selector-caption">日期</span>
        <span>{{ dateLabel }}</span>
        <span class="record-filter__chevron" aria-hidden="true">⌄</span>
      </button>
      <button
        type="button"
        class="record-filter__selector"
        data-testid="filter-store-trigger"
        aria-haspopup="dialog"
        :aria-expanded="showStorePopup"
        @click="showStorePopup = true"
      >
        <span class="record-filter__selector-caption">门店</span>
        <span class="record-filter__selector-value">{{ selectedStoreName }}</span>
        <span class="record-filter__chevron" aria-hidden="true">⌄</span>
      </button>
    </div>

    <div class="record-filter__search-row">
      <label class="record-filter__search">
        <span class="record-filter__search-icon" aria-hidden="true">⌕</span>
        <input
          :value="query.keyword"
          type="search"
          enterkeyhint="search"
          data-testid="keyword-input"
          :aria-label="`${config.listTitle}关键词`"
          :placeholder="config.searchPlaceholder"
          @input="emit('update', { keyword: ($event.target as HTMLInputElement).value })"
          @keyup.enter="emit('query')"
        />
      </label>
      <button
        type="button"
        class="record-filter__query"
        data-testid="query-button"
        @click="emit('query')"
      >
        查询
      </button>
    </div>

    <van-popup
      v-model:show="showDatePopup"
      position="bottom"
      round
      closeable
      safe-area-inset-bottom
      aria-label="选择日期"
    >
      <div class="record-filter__date-sheet">
        <h2>选择日期</h2>
        <div class="record-filter__preset-grid">
          <button type="button" data-testid="preset-today" @click="selectPreset('today')">
            今天
          </button>
          <button type="button" data-testid="preset-month" @click="selectPreset('month')">
            本月
          </button>
          <button
            type="button"
            data-testid="preset-last-month"
            @click="selectPreset('lastMonth')"
          >
            上月
          </button>
          <button type="button" data-testid="preset-custom" @click="openCalendar">
            自定义范围
          </button>
        </div>
      </div>
    </van-popup>

    <van-calendar
      v-model:show="showCalendar"
      type="range"
      title="选择日期范围"
      color="#6E20AF"
      :default-date="calendarDefaultDate"
      :min-date="new Date(2025, 0, 1)"
      :max-date="mockReferenceDate"
      @confirm="confirmRange"
    />

    <van-popup
      v-model:show="showStorePopup"
      position="bottom"
      round
      closeable
      safe-area-inset-bottom
      aria-label="选择门店"
    >
      <van-picker
        v-model="pickerValue"
        title="选择门店"
        :columns="storeOptions"
        :columns-field-names="{ text: 'text', value: 'value' }"
        @confirm="confirmStore"
        @cancel="showStorePopup = false"
        @click-option="clickStoreOption"
      >
        <template #option="option">
          <span :data-testid="`filter-store-option-${option.value}`">{{ option.text }}</span>
        </template>
      </van-picker>
    </van-popup>
  </section>
</template>

<style scoped lang="scss">
.record-filter {
  margin: 20px 24px 0;
  padding: 26px 24px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 22px;
}

.record-filter__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.record-filter__header h1,
.record-filter__header p,
.record-filter__date-sheet h2 {
  margin: 0;
}

.record-filter__header h1 {
  font-size: 32px;
  line-height: 1.3;
}

.record-filter__header p {
  margin-top: 6px;
  color: var(--color-text-tertiary);
  font-size: 21px;
  line-height: 1.35;
}

.record-filter__reset {
  flex: none;
  min-width: 88px;
  min-height: 88px;
  margin: -10px -12px 0 0;
  color: var(--color-text-tertiary);
  font-size: 24px;
  background: transparent;
  border: 0;
}

.record-filter__selectors,
.record-filter__search-row {
  display: flex;
  gap: 16px;
  width: 100%;
}

.record-filter__selector {
  position: relative;
  display: grid;
  flex: 1 1 50%;
  min-width: 0;
  min-height: 88px;
  padding: 12px 44px 12px 20px;
  color: var(--color-text-primary);
  text-align: left;
  background: var(--color-primary-lighter);
  border: 1px solid var(--color-primary-border);
  border-radius: 14px;
}

.record-filter__selector-caption {
  color: var(--color-text-tertiary);
  font-size: 19px;
  line-height: 1.2;
}

.record-filter__selector-value,
.record-filter__selector > span:nth-child(2) {
  overflow: hidden;
  font-size: 24px;
  line-height: 1.35;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-filter__chevron {
  position: absolute;
  top: 50%;
  right: 16px;
  color: var(--color-primary);
  font-size: 24px;
  transform: translateY(-55%);
}

.record-filter__search-row {
  margin-top: 16px;
}

.record-filter__search {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  min-width: 0;
  min-height: 88px;
  padding: 0 18px;
  background: #f7f7f8;
  border: 1px solid var(--color-border);
  border-radius: 14px;
}

.record-filter__search-icon {
  flex: none;
  margin-right: 10px;
  color: var(--color-text-tertiary);
  font-size: 28px;
}

.record-filter__search input {
  width: 100%;
  min-width: 0;
  padding: 0;
  color: var(--color-text-primary);
  font-size: 24px;
  background: transparent;
  border: 0;
  outline: 0;
}

.record-filter__search input::placeholder {
  color: var(--color-text-tertiary);
}

.record-filter__query {
  flex: 0 0 160px;
  min-height: 88px;
  color: #fff;
  font-size: 26px;
  font-weight: 600;
  background: var(--color-primary);
  border: 0;
  border-radius: 14px;
}

.record-filter__query:active {
  background: var(--color-primary-active);
}

.record-filter__date-sheet {
  padding: 42px 30px calc(40px + env(safe-area-inset-bottom));
}

.record-filter__date-sheet h2 {
  font-size: 30px;
  text-align: center;
}

.record-filter__preset-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 32px;
}

.record-filter__preset-grid button {
  min-height: 88px;
  color: var(--color-primary);
  font-size: 25px;
  background: var(--color-primary-lighter);
  border: 1px solid var(--color-primary-border);
  border-radius: 14px;
}

:deep(.van-picker__confirm),
:deep(.van-calendar__confirm) {
  color: var(--color-primary);
}
</style>
