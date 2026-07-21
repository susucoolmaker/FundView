<template>
  <div
    class="live-info-badge live-info-badge--compact"
    data-testid="live-info-badge"
    aria-label="实时信息"
  >
    <span class="live-info-badge__dot" aria-hidden="true"></span>
    <span class="live-info-badge__text">实时信息</span>
  </div>
</template>

<style scoped lang="scss">
.live-info-badge {
  position: relative;
  align-self: flex-start;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 42px;
  margin-top: 2px;
  padding: 8px 15px;
  color: var(--color-primary);
  background: var(--color-primary-lighter);
  border: 1px solid var(--color-primary-border);
  border-radius: 999px;
}

.live-info-badge__dot {
  width: 8px;
  height: 8px;
  margin-right: 8px;
  background: var(--color-primary);
  border-radius: 999px;
  box-shadow: 0 0 0 5px rgb(110 32 175 / 10%);
}

.live-info-badge__text {
  position: relative;
  font-size: 20px;
  line-height: 1.2;
  font-weight: 650;
  white-space: nowrap;
}
</style>
