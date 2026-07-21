<script setup lang="ts">
withDefaults(
  defineProps<{
    text?: string
  }>(),
  { text: '正在加载明细…' },
)
</script>

<template>
  <section class="loading-state" role="status" aria-live="polite">
    <div v-for="index in 3" :key="index" class="loading-state__card" aria-hidden="true">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <p>{{ text }}</p>
  </section>
</template>

<style scoped lang="scss">
.loading-state {
  display: grid;
  gap: 18px;
}

.loading-state__card {
  display: grid;
  gap: 18px;
  min-height: 210px;
  padding: 26px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 20px;
}

.loading-state__card span {
  height: 25px;
  background: #f1edf4;
  border-radius: 999px;
}

.loading-state__card span:nth-child(1) {
  width: 45%;
}

.loading-state__card span:nth-child(2) {
  width: 68%;
}

.loading-state__card span:nth-child(3) {
  width: 88%;
}

.loading-state p {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: 22px;
  text-align: center;
}
</style>
