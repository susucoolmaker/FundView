<script setup lang="ts">
import RecentRecordList from '@/components/RecentRecordList.vue'
import finalDesignUrl from '@/assets/dashboard/merchant-fund-final-design.png'
import { depositRecords, rechargeRecords, salesRecords, withdrawRecords } from '@/mock/records'
import { stores } from '@/mock/merchant'

const recentRecords = [...rechargeRecords, ...withdrawRecords, ...depositRecords, ...salesRecords]
</script>

<template>
  <main class="dashboard-view dashboard-view--final-static" data-testid="final-design-page">
    <div class="dashboard-view__visual-shell ignore-vw">
      <img
        class="dashboard-view__final-design ignore-vw"
        data-testid="final-design-image"
        :src="finalDesignUrl"
        alt="商户资金看板最终验收稿"
        draggable="false"
      />
      <a
        class="dashboard-view__message-card ignore-vw"
        data-testid="new-order-message"
        href="#/records/sales"
        aria-label="查看新订单"
      >
        <span
          class="dashboard-view__message-icon dashboard-view__message-icon--plain ignore-vw"
          data-testid="message-clear-icon"
          aria-hidden="true"
        >
          <svg viewBox="0 0 64 64" focusable="false">
            <path d="M16 19c0-5 4-9 9-9h14c5 0 9 4 9 9v13c0 5-4 9-9 9h-9l-10 9v-9h-4c-5 0-9-4-9-9V19Z" />
            <path d="M23 24h18" />
            <path d="M23 32h12" />
            <circle cx="46" cy="15" r="7" />
          </svg>
        </span>
        <span class="dashboard-view__message-text">新订单提醒：刚产生 1 笔新订单，点击查看</span>
        <span class="dashboard-view__message-arrow" aria-hidden="true">›</span>
      </a>
      <a
        class="dashboard-view__hotspot dashboard-view__hotspot--deposit ignore-vw"
        data-testid="deposit-hotspot"
        href="#/records/deposit"
        aria-label="查看保证金"
      />
      <a
        class="dashboard-view__hotspot dashboard-view__hotspot--recharge ignore-vw"
        data-testid="monthly-recharge-hotspot"
        href="#/records/recharge"
        aria-label="查看本月充值"
      />
      <a
        class="dashboard-view__hotspot dashboard-view__hotspot--withdraw ignore-vw"
        data-testid="monthly-withdraw-hotspot"
        href="#/records/withdraw"
        aria-label="查看本月提现"
      />
    </div>
    <div
      class="dashboard-view__recent dashboard-view__recent--main-card-width ignore-vw"
      data-testid="recent-records-shell"
    >
      <RecentRecordList :records="recentRecords" :stores="stores" selected-store-id="all" />
    </div>
  </main>
</template>

<style lang="scss">
.dashboard-view {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  background: #f5f2ff;
}

.dashboard-view--final-static {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  margin: 0 auto;
  max-width: 941px;
}

.dashboard-view__visual-shell.ignore-vw {
  position: relative;
  width: 100%;
  max-width: 941px;
}

.dashboard-view__final-design.ignore-vw {
  display: block;
  width: 100%;
  max-width: 941px;
  height: auto;
  user-select: none;
  pointer-events: none;
}

.dashboard-view__message-card.ignore-vw {
  position: absolute;
  z-index: 3;
  top: 90.36%;
  left: 5.52%;
  display: flex;
  align-items: center;
  width: 88.95%;
  height: 6.82%;
  padding: 0 3.35%;
  color: #36168b;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgb(244 236 255 / 98%) 0%, rgb(236 224 255 / 98%) 100%);
  border: 1px solid rgb(255 255 255 / 68%);
  border-radius: 34px;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 78%),
    0 12px 28px rgb(101 48 188 / 11%);
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

.dashboard-view__message-icon.ignore-vw {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 8.7%;
  aspect-ratio: 1;
  margin-right: 4.1%;
  color: #4d18ad;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

.dashboard-view__message-icon.ignore-vw svg {
  width: 86%;
  height: 86%;
  overflow: visible;
}

.dashboard-view__message-icon.ignore-vw path,
.dashboard-view__message-icon.ignore-vw circle {
  fill: none;
  stroke: currentcolor;
  stroke-width: 5;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter:
    drop-shadow(0 1px 0 rgb(255 255 255 / 68%))
    drop-shadow(0 2px 3px rgb(72 30 146 / 12%));
}

.dashboard-view__message-text {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  font-size: 27px;
  font-weight: 650;
  line-height: 1.25;
  letter-spacing: -0.02em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-view__message-arrow {
  flex: 0 0 auto;
  margin-left: 3%;
  color: #6b5a91;
  font-family: Arial, sans-serif;
  font-size: 58px;
  font-weight: 300;
  line-height: 1;
}

.dashboard-view__hotspot.ignore-vw {
  position: absolute;
  z-index: 2;
  display: block;
  background: transparent;
  border: 0;
  border-radius: 28px;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.dashboard-view__hotspot.ignore-vw:focus-visible {
  box-shadow: 0 0 0 4px rgb(110 32 175 / 24%);
}

.dashboard-view__hotspot--deposit.ignore-vw {
  top: 41.45%;
  left: 6.27%;
  width: 87.25%;
  height: 12.44%;
}

.dashboard-view__hotspot--recharge.ignore-vw {
  top: 57.95%;
  left: 5.95%;
  width: 42.3%;
  height: 30.45%;
}

.dashboard-view__hotspot--withdraw.ignore-vw {
  top: 57.95%;
  left: 50.37%;
  width: 43.15%;
  height: 30.45%;
}

.dashboard-view__recent.ignore-vw {
  width: 100%;
  max-width: 941px;
  padding: 0 24px 162px;
}
</style>
