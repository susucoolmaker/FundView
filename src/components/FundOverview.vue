<script setup lang="ts">
import walletYuanUrl from '@/assets/dashboard/wallet-yuan.png'
import rechargeBarsUrl from '@/assets/dashboard/recharge-bars.png'
import withdrawLineUrl from '@/assets/dashboard/withdraw-line.png'
import AmountDisplay from '@/components/AmountDisplay.vue'
import { Icon as VanIcon } from 'vant'

defineProps<{
  merchantName: string
  walletBalance: number
  monthlyRecharge: number
  monthlySuccessfulWithdraw: number
  currentDepositBalance: number
}>()

const emit = defineEmits<{
  openRecords: [type: 'recharge' | 'withdraw' | 'deposit']
}>()
</script>

<template>
  <section class="fund-overview fund-overview--glass" aria-labelledby="wallet-heading">
    <header class="fund-overview__merchant-panel">
      <span
        class="fund-overview__merchant-icon"
        data-testid="merchant-icon"
        aria-hidden="true"
      >
        <VanIcon name="shop-o" />
      </span>
      <div class="fund-overview__merchant-copy">
        <p>{{ merchantName }}</p>
        <span class="fund-overview__contract" data-testid="merchant-contract-badge">
          <VanIcon name="checked" aria-hidden="true" />
          已签约商户
        </span>
      </div>
    </header>

    <section class="fund-overview__wallet-card" data-testid="wallet-card" aria-labelledby="wallet-heading">
      <div class="fund-overview__wallet-copy">
        <h2 id="wallet-heading">钱包余额<span>（全部门店共用）</span></h2>
        <AmountDisplay :value="walletBalance" size="hero" test-id="wallet-balance" />
      </div>
      <img
        class="fund-overview__wallet-visual"
        data-testid="wallet-visual"
        :src="walletYuanUrl"
        alt=""
        aria-hidden="true"
      />
    </section>

    <button
      type="button"
      class="fund-overview__deposit-card"
      data-testid="deposit-row"
      aria-label="查看保证金记录"
      @click="emit('openRecords', 'deposit')"
    >
      <span class="fund-overview__deposit-icon" data-testid="deposit-icon" aria-hidden="true">
        <VanIcon name="certificate" />
      </span>
      <span class="fund-overview__deposit-copy">
        <strong>当前保证金</strong>
        <small>合作保证金</small>
      </span>
      <AmountDisplay :value="currentDepositBalance" size="metric" test-id="deposit-balance" />
      <VanIcon class="fund-overview__entry-arrow" name="arrow" aria-hidden="true" />
    </button>

    <div class="fund-overview__metric-grid">
      <button
        type="button"
        class="fund-overview__metric-card"
        data-fund-metric="true"
        data-testid="monthly-recharge-entry"
        aria-label="查看充值明细"
        @click="emit('openRecords', 'recharge')"
      >
        <span class="fund-overview__metric-heading">
          <span
            class="fund-overview__metric-icon"
            data-testid="monthly-recharge-icon"
            aria-hidden="true"
          >
            <VanIcon name="down" />
          </span>
          <strong>本月充值</strong>
        </span>
        <span class="fund-overview__metric-amount">
          <AmountDisplay :value="monthlyRecharge" size="metric" test-id="monthly-recharge" />
          <VanIcon class="fund-overview__metric-arrow" name="arrow" aria-hidden="true" />
        </span>
        <small>按当前门店统计</small>
        <img
          class="fund-overview__metric-chart fund-overview__metric-chart--bars"
          data-testid="monthly-recharge-chart"
          :src="rechargeBarsUrl"
          alt=""
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        class="fund-overview__metric-card"
        data-fund-metric="true"
        data-testid="monthly-withdraw-entry"
        aria-label="查看提现明细"
        @click="emit('openRecords', 'withdraw')"
      >
        <span class="fund-overview__metric-heading">
          <span
            class="fund-overview__metric-icon"
            data-testid="monthly-withdraw-icon"
            aria-hidden="true"
          >
            <VanIcon name="upgrade" />
          </span>
          <strong>本月提现</strong>
        </span>
        <span class="fund-overview__metric-amount">
          <AmountDisplay
            :value="monthlySuccessfulWithdraw"
            size="metric"
            test-id="monthly-withdraw"
          />
          <VanIcon class="fund-overview__metric-arrow" name="arrow" aria-hidden="true" />
        </span>
        <small>仅统计提现成功金额</small>
        <img
          class="fund-overview__metric-chart"
          data-testid="monthly-withdraw-chart"
          :src="withdrawLineUrl"
          alt=""
          aria-hidden="true"
        />
      </button>
    </div>

    <button
      type="button"
      class="fund-overview__trend"
      data-testid="transaction-summary"
      aria-label="查看近7日交易笔数"
    >
      <span class="fund-overview__trend-icon" aria-hidden="true">
        <VanIcon name="chart-trending-o" />
      </span>
      <span>近7日交易笔数 128 笔，较上月 ↑ 12%</span>
      <VanIcon class="fund-overview__trend-arrow" name="arrow" aria-hidden="true" />
    </button>
  </section>
</template>

<style scoped lang="scss">
.fund-overview {
  position: relative;
  overflow: hidden;
  padding: 42px 28px 30px;
  color: #160d2f;
  background:
    radial-gradient(circle at 88% 18%, rgb(157 104 255 / 18%) 0 16%, transparent 30%),
    radial-gradient(circle at 5% 0%, rgb(136 80 255 / 16%) 0 11%, transparent 26%),
    linear-gradient(180deg, #f9f6ff 0%, #ffffff 68%, #fbf9ff 100%);
  border: 1px solid rgb(157 111 244 / 25%);
  border-radius: 34px;
  box-shadow:
    0 22px 54px rgb(112 73 179 / 16%),
    inset 0 0 0 1px rgb(255 255 255 / 82%);
}

.fund-overview::before,
.fund-overview::after {
  position: absolute;
  z-index: 0;
  pointer-events: none;
  content: '';
}

.fund-overview::before {
  right: 22px;
  top: 122px;
  width: 134px;
  height: 112px;
  opacity: 0.48;
  background-image: radial-gradient(circle, rgb(116 56 210 / 32%) 0 2px, transparent 2px);
  background-size: 22px 22px;
}

.fund-overview::after {
  right: -26px;
  top: 208px;
  width: 180px;
  height: 116px;
  background: linear-gradient(135deg, rgb(149 98 235 / 17%), rgb(149 98 235 / 3%));
  border-radius: 78% 22% 0 52%;
  transform: rotate(-7deg);
}

.fund-overview > * {
  position: relative;
  z-index: 1;
}

.fund-overview__merchant-panel {
  display: grid;
  grid-template-columns: 94px minmax(0, 1fr);
  gap: 20px;
  align-items: center;
  min-height: 104px;
  padding: 0 10px 34px;
}

.fund-overview__merchant-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 94px;
  height: 94px;
  color: #6730c2;
  background: #ebe1ff;
  border-radius: 50%;
  font-size: 54px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 72%);
}

.fund-overview__merchant-copy {
  min-width: 0;
}

.fund-overview__merchant-copy p {
  margin: 0;
  color: #0c0b10;
  font-size: 34px;
  line-height: 1.18;
  font-weight: 760;
  letter-spacing: -1px;
}

.fund-overview__contract {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  color: #4f23a7;
  font-size: 25px;
  line-height: 1.2;
  font-weight: 650;
}

.fund-overview__contract :deep(.van-icon) {
  color: #fff;
  background: linear-gradient(145deg, #9e6cff, #6830c8);
  border-radius: 9px;
  padding: 5px;
  font-size: 20px;
  box-shadow: 0 8px 18px rgb(104 48 200 / 24%);
}

.fund-overview__wallet-card {
  position: relative;
  min-height: 308px;
  overflow: hidden;
  padding: 82px 36px 50px;
  background:
    linear-gradient(165deg, rgb(255 255 255 / 85%) 0%, rgb(244 237 255 / 64%) 48%, rgb(218 197 255 / 54%) 100%);
  border: 2px solid rgb(255 255 255 / 86%);
  border-radius: 36px;
  box-shadow:
    0 20px 40px rgb(104 69 167 / 19%),
    inset 0 2px 6px rgb(255 255 255 / 92%),
    inset 0 -8px 18px rgb(112 63 207 / 10%);
}

.fund-overview__wallet-card::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background:
    radial-gradient(circle at 7% 18%, rgb(255 255 255 / 88%) 0 12%, transparent 22%),
    linear-gradient(7deg, transparent 59%, rgb(255 255 255 / 62%) 60%, transparent 62%);
}

.fund-overview__wallet-card::after {
  position: absolute;
  right: 8px;
  bottom: 0;
  left: 28px;
  height: 88px;
  pointer-events: none;
  content: '';
  background: linear-gradient(152deg, transparent 12%, rgb(151 99 230 / 10%) 13%, rgb(151 99 230 / 24%) 100%);
  clip-path: polygon(14% 100%, 100% 4%, 100% 100%);
}

.fund-overview__wallet-copy {
  position: relative;
  z-index: 2;
  max-width: 62%;
}

.fund-overview__wallet-copy h2 {
  margin: 0 0 44px;
  color: #24125c;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 760;
}

.fund-overview__wallet-copy h2 span {
  color: #6d4ab0;
  font-size: 24px;
  font-weight: 520;
}

.fund-overview__wallet-copy :deep(.amount-display) {
  color: #2a1265;
  font-size: 56px;
  line-height: 1.05;
  letter-spacing: -2px;
}

.fund-overview__wallet-visual {
  position: absolute;
  z-index: 1;
  right: 12px;
  bottom: 24px;
  width: 202px;
  height: auto;
  mix-blend-mode: normal;
}

.fund-overview__deposit-card,
.fund-overview__metric-card,
.fund-overview__trend {
  width: 100%;
  margin: 0;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.fund-overview__deposit-card {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 148px;
  margin-top: 42px;
  padding: 24px 24px 24px 30px;
  color: #fff;
  background:
    radial-gradient(circle at 17% 0%, rgb(133 75 235 / 42%), transparent 33%),
    linear-gradient(135deg, #321071 0%, #1f0a58 100%);
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 25px;
  box-shadow:
    0 18px 28px rgb(57 23 125 / 22%),
    inset 0 2px 0 rgb(255 255 255 / 20%);
}

.fund-overview__deposit-icon {
  display: inline-flex;
  flex: 0 0 84px;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 84px;
  color: #fff;
  background: linear-gradient(145deg, #d694ff 0%, #7b3ae0 52%, #4c1bac 100%);
  border: 1px solid rgb(255 255 255 / 34%);
  border-radius: 25px;
  font-size: 46px;
  box-shadow:
    0 16px 25px rgb(23 5 72 / 28%),
    inset 0 3px 0 rgb(255 255 255 / 36%);
  transform: rotate(-30deg);
}

.fund-overview__deposit-icon :deep(.van-icon) {
  transform: rotate(30deg);
}

.fund-overview__deposit-copy {
  display: grid;
  flex: 1 1 170px;
  gap: 8px;
  min-width: 0;
}

.fund-overview__deposit-copy strong {
  font-size: 30px;
  line-height: 1.2;
  font-weight: 760;
  white-space: nowrap;
}

.fund-overview__deposit-copy small {
  color: rgb(255 255 255 / 82%);
  font-size: 24px;
  line-height: 1.25;
}

.fund-overview__deposit-card :deep(.amount-display) {
  flex: 0 0 auto;
  color: #fff;
  font-size: 30px;
  line-height: 1.2;
}

.fund-overview__entry-arrow {
  flex: 0 0 auto;
  color: rgb(255 255 255 / 82%);
  font-size: 34px;
}

.fund-overview__metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
  margin-top: 42px;
}

.fund-overview__metric-card {
  position: relative;
  min-width: 0;
  min-height: 430px;
  overflow: hidden;
  padding: 48px 30px 28px;
  color: #0e0b13;
  background: linear-gradient(180deg, #fff 0%, #fff 58%, #fbf9ff 100%);
  border: 1px solid rgb(187 164 230 / 16%);
  border-radius: 25px;
  box-shadow:
    0 18px 34px rgb(87 56 143 / 9%),
    inset 0 1px 0 rgb(255 255 255 / 94%);
}

.fund-overview__metric-card::before {
  position: absolute;
  inset: 18px 18px auto auto;
  width: 78px;
  height: 78px;
  pointer-events: none;
  content: '';
  background: radial-gradient(circle, rgb(146 84 222 / 11%), transparent 66%);
}

.fund-overview__metric-heading {
  display: flex;
  align-items: center;
  gap: 18px;
}

.fund-overview__metric-heading strong {
  font-size: 30px;
  line-height: 1.2;
  font-weight: 760;
}

.fund-overview__metric-icon {
  display: inline-flex;
  flex: 0 0 64px;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  color: #6a32c6;
  background: linear-gradient(145deg, #f1e9ff, #ddcdfb);
  border-radius: 50%;
  font-size: 36px;
  box-shadow:
    0 10px 18px rgb(91 48 184 / 16%),
    inset 0 2px 0 rgb(255 255 255 / 84%);
}

.fund-overview__metric-amount {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 46px;
}

.fund-overview__metric-card :deep(.amount-display) {
  color: #08070b;
  font-size: 34px;
  line-height: 1.15;
  letter-spacing: -0.5px;
}

.fund-overview__metric-arrow {
  flex: 0 0 auto;
  color: #6f6685;
  font-size: 32px;
}

.fund-overview__metric-card small {
  display: block;
  margin-top: 34px;
  color: #5c5774;
  font-size: 24px;
  line-height: 1.35;
}

.fund-overview__metric-chart {
  position: absolute;
  right: 28px;
  bottom: 34px;
  left: 28px;
  width: calc(100% - 56px);
  height: auto;
  object-fit: contain;
}

.fund-overview__metric-chart--bars {
  bottom: 36px;
}

.fund-overview__trend {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) 34px;
  gap: 22px;
  align-items: center;
  min-height: 112px;
  margin-top: 34px;
  padding: 18px 32px;
  color: #311487;
  background: linear-gradient(90deg, #efe8ff 0%, #f9f5ff 52%, #efe6ff 100%);
  border: 1px solid rgb(157 111 244 / 11%);
  border-radius: 25px;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 80%);
}

.fund-overview__trend-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  color: #3d179c;
  border: 5px solid #3d179c;
  border-radius: 18px;
  font-size: 34px;
  transform: rotate(-13deg);
}

.fund-overview__trend-icon :deep(.van-icon) {
  transform: rotate(13deg);
}

.fund-overview__trend span:nth-child(2) {
  min-width: 0;
  font-size: 25px;
  line-height: 1.35;
  font-weight: 650;
}

.fund-overview__trend-arrow {
  color: #5a4099;
  font-size: 32px;
}

.fund-overview__deposit-card:active,
.fund-overview__metric-card:active,
.fund-overview__trend:active {
  transform: translateY(1px);
  filter: brightness(0.985);
}
</style>
