<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  label: string
  value: string | number
  copyable?: boolean
}>()

const copied = ref(false)

const copyWithFallback = (value: string) => {
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

const copyValue = async () => {
  const value = String(props.value)
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value)
    else copyWithFallback(value)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1200)
  } catch {
    copyWithFallback(value)
  }
}
</script>

<template>
  <div class="detail-field">
    <dt>{{ label }}</dt>
    <dd>
      <span>{{ value }}</span>
      <button
        v-if="copyable"
        type="button"
        class="detail-field__copy"
        :aria-label="`复制${label}`"
        :data-testid="`copy-${label}`"
        :data-copied="copied"
        @click="copyValue"
      >
        <svg class="detail-field__copy-icon" viewBox="0 0 40 40" focusable="false" aria-hidden="true">
          <rect x="14" y="10" width="14" height="17" rx="3" />
          <path d="M12 15H10c-2 0-3 1-3 3v12c0 2 1 3 3 3h12c2 0 3-1 3-3v-1" />
        </svg>
      </button>
    </dd>
  </div>
</template>

<style scoped lang="scss">
.detail-field {
  display: grid;
  grid-template-columns: 154px minmax(0, 1fr);
  gap: 24px;
  padding: 22px 0;
  border-bottom: 1px solid var(--color-divider);
}

.detail-field:last-child {
  border-bottom: 0;
}

.detail-field dt,
.detail-field dd {
  margin: 0;
  font-size: 24px;
  line-height: 1.55;
}

.detail-field dt {
  color: var(--color-text-tertiary);
}

.detail-field dd {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  color: var(--color-text-primary);
  text-align: right;
}

.detail-field dd span {
  min-width: 0;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.detail-field__copy {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: var(--color-primary);
  background: transparent;
  border: 0;
  border-radius: 50%;
}

.detail-field__copy:active {
  background: var(--color-primary-lighter);
}

.detail-field__copy-icon {
  width: 28px;
  height: 28px;
}

.detail-field__copy-icon rect,
.detail-field__copy-icon path {
  fill: none;
  stroke: currentcolor;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
