<template>
  <header class="merchant-header">
    <div class="merchant-header__title-wrap">
      <p>商户资金管理</p>
      <h1>资金看板</h1>
    </div>
    <slot />
  </header>
</template>

<style scoped lang="scss">
.merchant-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 26px 32px 22px;
  background: var(--color-card-background);
  border-bottom: 1px solid var(--color-divider);
}

.merchant-header__title-wrap {
  min-width: 0;
}

.merchant-header p,
.merchant-header h1 {
  margin: 0;
}

.merchant-header p {
  margin-bottom: 5px;
  color: var(--color-text-tertiary);
  font-size: 22px;
  line-height: 1.3;
}

.merchant-header h1 {
  font-size: 36px;
  line-height: 1.25;
  font-weight: 650;
}
</style>
