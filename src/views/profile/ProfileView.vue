<script setup lang="ts">
import { computed } from 'vue'

import StoreCard from '@/components/StoreCard.vue'
import { useMerchantStore } from '@/stores/merchant'

const merchantStore = useMerchantStore()
const avatarInitials = computed(() => merchantStore.merchant.name.slice(0, 2))
</script>

<template>
  <section class="profile-view">
    <header class="profile-view__header">
      <p>商户资金管理</p>
      <h1>我的</h1>
    </header>

    <div class="profile-view__content">
      <article class="merchant-card">
        <div class="merchant-card__avatar" aria-hidden="true">{{ avatarInitials }}</div>
        <div class="merchant-card__identity">
          <h2>{{ merchantStore.merchant.name }}</h2>
          <span>{{ merchantStore.merchant.role }}</span>
        </div>
        <dl class="merchant-card__details">
          <div>
            <dt>实名编码</dt>
            <dd>{{ merchantStore.merchant.realNameCode }}</dd>
          </div>
          <div>
            <dt>管理员</dt>
            <dd>
              {{ merchantStore.merchant.administrator }}
              {{ merchantStore.merchant.maskedPhone }}
            </dd>
          </div>
        </dl>
      </article>

      <section class="profile-section" aria-labelledby="account-notices-title">
        <div class="profile-section__heading">
          <h2 id="account-notices-title">账户提示</h2>
          <span>{{ merchantStore.notices.length }} 条</span>
        </div>
        <div class="notice-list">
          <article
            v-for="notice in merchantStore.notices"
            :key="notice.id"
            class="notice-card"
            :class="`notice-card--${notice.tone}`"
          >
            <span class="notice-card__marker" aria-hidden="true"></span>
            <div>
              <h3>{{ notice.title }}</h3>
              <p>{{ notice.content }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="profile-section" aria-labelledby="merchant-stores-title">
        <div class="profile-section__heading">
          <h2 id="merchant-stores-title">我的店铺</h2>
          <span>共 {{ merchantStore.stores.length }} 家</span>
        </div>
        <div class="store-list">
          <StoreCard
            v-for="store in merchantStore.stores"
            :key="store.id"
            :store="store"
          />
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped lang="scss">
.profile-view {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
}

.profile-view__header {
  padding: 26px 32px 22px;
  background: var(--color-card-background);
  border-bottom: 1px solid var(--color-divider);
}

.profile-view__header p,
.profile-view__header h1 {
  margin: 0;
}

.profile-view__header p {
  margin-bottom: 5px;
  color: var(--color-text-tertiary);
  font-size: 22px;
  line-height: 1.3;
}

.profile-view__header h1 {
  font-size: 36px;
  line-height: 1.25;
  font-weight: 650;
}

.profile-view__content {
  width: 100%;
  max-width: 750px;
  margin: 0 auto;
  padding: 28px 28px 48px;
}

.merchant-card {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 0 22px;
  padding: 30px;
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  box-shadow: 0 8px 24px rgb(38 38 38 / 5%);
}

.merchant-card__avatar {
  display: grid;
  place-items: center;
  width: 88px;
  height: 88px;
  color: #fff;
  background: var(--color-primary);
  font-size: 29px;
  line-height: 1;
  font-weight: 650;
  border-radius: 50%;
}

.merchant-card__identity {
  min-width: 0;
  align-self: center;
}

.merchant-card__identity h2 {
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--color-text-primary);
  font-size: 29px;
  line-height: 1.35;
  font-weight: 650;
}

.merchant-card__identity span {
  display: inline-block;
  margin-top: 9px;
  padding: 4px 12px;
  color: var(--color-primary);
  background: var(--color-primary-light);
  font-size: 19px;
  line-height: 1.4;
  border-radius: 999px;
}

.merchant-card__details {
  grid-column: 1 / -1;
  display: grid;
  gap: 18px;
  margin: 28px 0 0;
  padding-top: 24px;
  border-top: 1px solid var(--color-divider);
}

.merchant-card__details div {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.merchant-card__details dt,
.merchant-card__details dd {
  margin: 0;
  font-size: 22px;
  line-height: 1.45;
}

.merchant-card__details dt {
  flex: none;
  color: var(--color-text-tertiary);
}

.merchant-card__details dd {
  min-width: 0;
  color: var(--color-text-primary);
  text-align: right;
  overflow-wrap: anywhere;
}

.profile-section {
  margin-top: 30px;
}

.profile-section__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;
  padding: 0 4px;
}

.profile-section__heading h2 {
  margin: 0;
  font-size: 28px;
  line-height: 1.35;
  font-weight: 650;
}

.profile-section__heading span {
  color: var(--color-text-tertiary);
  font-size: 20px;
}

.notice-list,
.store-list {
  display: grid;
  gap: 16px;
}

.notice-card {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 23px 24px;
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 18px;
}

.notice-card__marker {
  flex: none;
  width: 12px;
  height: 12px;
  margin-top: 9px;
  background: var(--color-neutral);
  border-radius: 50%;
}

.notice-card--success .notice-card__marker {
  background: var(--color-success);
}

.notice-card--failure .notice-card__marker {
  background: var(--color-failure);
}

.notice-card--warning .notice-card__marker {
  background: var(--color-processing);
}

.notice-card h3,
.notice-card p {
  margin: 0;
}

.notice-card h3 {
  color: var(--color-text-primary);
  font-size: 23px;
  line-height: 1.4;
  font-weight: 650;
}

.notice-card p {
  margin-top: 5px;
  color: var(--color-text-secondary);
  font-size: 21px;
  line-height: 1.5;
}
</style>
