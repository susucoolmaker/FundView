<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  actionLabel?: string
  actionTestId?: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <section class="empty-state" role="status">
    <span class="empty-state__icon" aria-hidden="true">○</span>
    <h2>{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
    <button
      v-if="actionLabel"
      type="button"
      :data-testid="actionTestId"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>
  </section>
</template>

<style scoped lang="scss">
.empty-state {
  display: grid;
  min-height: 330px;
  place-items: center;
  align-content: center;
  padding: 42px 28px;
  text-align: center;
}

.empty-state__icon {
  display: grid;
  width: 82px;
  height: 82px;
  place-items: center;
  color: var(--color-primary);
  font-size: 72px;
  line-height: 1;
  background: var(--color-primary-lighter);
  border-radius: 50%;
}

.empty-state h2,
.empty-state p {
  margin: 0;
}

.empty-state h2 {
  margin-top: 20px;
  color: var(--color-text-primary);
  font-size: 28px;
}

.empty-state p {
  max-width: 540px;
  margin-top: 10px;
  color: var(--color-text-tertiary);
  font-size: 22px;
  line-height: 1.5;
}

.empty-state button {
  min-width: 176px;
  min-height: 88px;
  margin-top: 26px;
  padding: 0 28px;
  color: var(--color-primary);
  font-size: 24px;
  font-weight: 600;
  background: #fff;
  border: 1px solid var(--color-primary);
  border-radius: 14px;
}
</style>
