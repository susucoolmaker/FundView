<script setup lang="ts">
defineProps<{
  label: string
  value: string
  identifier?: boolean
}>()
</script>

<template>
  <div class="record-meta-row">
    <dt>{{ label }}</dt>
    <dd :class="{ 'record-meta-row__identifier': identifier }">{{ value }}</dd>
  </div>
</template>

<style scoped lang="scss">
.record-meta-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.record-meta-row dt,
.record-meta-row dd {
  margin: 0;
  font-size: 21px;
  line-height: 1.45;
}

.record-meta-row dt {
  flex: none;
  color: var(--color-text-tertiary);
}

.record-meta-row dd {
  min-width: 0;
  color: var(--color-text-secondary);
  text-align: right;
  overflow-wrap: anywhere;
}

.record-meta-row .record-meta-row__identifier {
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
</style>
