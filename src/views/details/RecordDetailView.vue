<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AmountDisplay from '@/components/AmountDisplay.vue'
import DetailField from '@/components/DetailField.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'
import StatusTag from '@/components/StatusTag.vue'
import VoucherPreview from '@/components/VoucherPreview.vue'
import { recordConfigs } from '@/config/record-config'
import { mockApi, type MockScenario } from '@/mock/service'
import { useMerchantStore } from '@/stores/merchant'
import type {
  BusinessRecord,
  BusinessType,
  DepositRecord,
  RechargeRecord,
  SalesRecord,
  WithdrawRecord,
} from '@/types'
import { formatDateTime, formatMoney } from '@/utils/format'

type DetailErrorKind = Exclude<MockScenario, 'normal'>

const route = useRoute()
const router = useRouter()
const merchantStore = useMerchantStore()

const loading = ref(true)
const record = ref<BusinessRecord>()
const errorKind = ref<DetailErrorKind>()
const notFound = ref(false)
let activeRequest = 0

const type = computed(() => route.params.type as BusinessType)
const recordId = computed(() => String(route.params.id))
const config = computed(() => recordConfigs[type.value])
const rechargeRecord = computed<RechargeRecord | undefined>(() =>
  record.value?.type === 'recharge' ? record.value : undefined,
)
const withdrawRecord = computed<WithdrawRecord | undefined>(() =>
  record.value?.type === 'withdraw' ? record.value : undefined,
)
const depositRecord = computed<DepositRecord | undefined>(() =>
  record.value?.type === 'deposit' ? record.value : undefined,
)
const salesRecord = computed<SalesRecord | undefined>(() =>
  record.value?.type === 'sales' ? record.value : undefined,
)
const fundingRecord = computed(() => {
  if (rechargeRecord.value?.status === '充值成功') return rechargeRecord.value
  if (withdrawRecord.value?.status === '提现成功') return withdrawRecord.value
  return undefined
})
const storeName = computed(
  () =>
    merchantStore.stores.find((store) => store.id === record.value?.storeId)?.name ??
    '未知门店',
)
const summaryStatus = computed(() => {
  if (withdrawRecord.value) return getWithdrawDisplayStatus(withdrawRecord.value.status)
  if (depositRecord.value) return depositRecord.value.status
  if (salesRecord.value) return salesRecord.value.settlementStatus
  return undefined
})
const summarySign = computed<'-' | undefined>(() =>
  depositRecord.value &&
  ['保证金扣除', '保证金退回'].includes(depositRecord.value.depositType)
    ? '-'
    : undefined,
)
const normalizedRemark = (value?: string) => value?.trim() ?? ''
const getWithdrawDisplayStatus = (status: WithdrawRecord['status']) =>
  status === '提现成功' || status === '提现失败' ? status : '提现中'
const isDepositReturn = (depositType: DepositRecord['depositType']) =>
  depositType === '保证金扣除' || depositType === '保证金退回'
const getDepositTransactionProject = (depositType: DepositRecord['depositType']) =>
  isDepositReturn(depositType) ? '国补加盟退还保证金' : '国补加盟交纳保证金'
const getDepositTransactionStatus = (status: DepositRecord['status']) =>
  status === '已生效' || status === '已完成' ? '交易成功' : '交易失败'

const errorCopy: Record<DetailErrorKind, { title: string; description: string }> = {
  network: {
    title: '数据加载失败，请重新加载',
    description: '请检查网络连接，当前记录地址已保留。',
  },
  expired: {
    title: '登录状态已过期，请重新登录',
    description: '重新进入企业微信工作台后再查看。',
  },
  forbidden: {
    title: '暂无权限查看该记录',
    description: '如需查看，请联系商户管理员开通权限。',
  },
}

const getErrorKind = (error: unknown): DetailErrorKind => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'kind' in error &&
    ['network', 'expired', 'forbidden'].includes(String(error.kind))
  ) {
    return error.kind as DetailErrorKind
  }
  return 'network'
}

const loadDetail = async () => {
  const request = ++activeRequest
  loading.value = true
  record.value = undefined
  errorKind.value = undefined
  notFound.value = false

  try {
    const result = await mockApi.fetchRecordDetail(type.value, recordId.value)
    if (request !== activeRequest) return
    record.value = result
    notFound.value = !result
  } catch (error) {
    if (request !== activeRequest) return
    errorKind.value = getErrorKind(error)
  } finally {
    if (request === activeRequest) loading.value = false
  }
}

const goToList = () => router.push(`/records/${type.value}`)
const goBack = () => {
  if (router.options.history.state.back) {
    router.back()
    return
  }

  goToList()
}

watch([type, recordId], loadDetail, { immediate: true })
</script>

<template>
  <section class="record-detail-view">
    <header class="record-detail-view__bar">
      <button type="button" data-testid="detail-back" aria-label="返回上一页" @click="goBack">
        <span aria-hidden="true">‹</span>
        返回
      </button>
      <h1>{{ config.detailTitle }}</h1>
      <span aria-hidden="true"></span>
    </header>

    <main class="record-detail-view__content">
      <LoadingState v-if="loading" text="正在加载详情…" />

      <EmptyState
        v-else-if="errorKind"
        :title="errorCopy[errorKind].title"
        :description="errorCopy[errorKind].description"
        action-label="重新加载"
        action-test-id="detail-retry"
        @action="loadDetail"
      />

      <EmptyState
        v-else-if="notFound"
        title="记录不存在或已失效"
        description="该记录可能已删除、失效或当前账号无权访问。"
        action-label="返回记录列表"
        action-test-id="detail-list-link"
        @action="goToList"
      />

      <template v-else-if="record">
        <section class="record-detail-view__summary">
          <p>{{ config.amountLabel }}</p>
          <AmountDisplay
            :value="record.amount"
            :sign="summarySign"
            size="hero"
            test-id="detail-amount"
          />
          <StatusTag v-if="summaryStatus" :status="summaryStatus" />
        </section>

        <section class="record-detail-view__card">
          <h2>基础信息</h2>
          <dl v-if="rechargeRecord">
            <DetailField label="商户实名编码" :value="merchantStore.merchant.realNameCode" />
            <DetailField label="商户名称" :value="merchantStore.merchant.name" />
            <DetailField label="交易时间" :value="formatDateTime(rechargeRecord.date)" />
            <DetailField label="交易流水号" :value="rechargeRecord.serialNumber" copyable />
            <DetailField label="状态" :value="rechargeRecord.status" />
            <DetailField label="来款姓名" :value="rechargeRecord.payerName" />
            <DetailField label="来款账号" :value="rechargeRecord.payerAccount ?? '—'" />
          </dl>

          <dl v-else-if="withdrawRecord">
            <DetailField label="商户实名编码" :value="merchantStore.merchant.realNameCode" />
            <DetailField label="商户名称" :value="merchantStore.merchant.name" />
            <DetailField label="交易时间" :value="formatDateTime(withdrawRecord.date)" />
            <DetailField label="更新时间" :value="formatDateTime(withdrawRecord.updatedAt)" />
            <DetailField label="交易流水号" :value="withdrawRecord.serialNumber" copyable />
            <DetailField label="状态" :value="getWithdrawDisplayStatus(withdrawRecord.status)" />
          </dl>

          <dl v-else-if="depositRecord">
            <DetailField label="商户实名编码" :value="merchantStore.merchant.realNameCode" />
            <DetailField label="商户名称" :value="merchantStore.merchant.name" />
            <DetailField
              label="交易项目"
              :value="getDepositTransactionProject(depositRecord.depositType)"
            />
            <DetailField label="交易时间" :value="formatDateTime(depositRecord.date)" />
            <DetailField label="交易流水号" :value="depositRecord.serialNumber" copyable />
            <DetailField
              label="状态"
              :value="getDepositTransactionStatus(depositRecord.status)"
            />
            <DetailField label="企微店铺" :value="storeName" />
            <DetailField label="付款名称" :value="depositRecord.payerName" />
            <DetailField label="收款名称" :value="depositRecord.payeeName" />
            <DetailField label="添加时间" :value="formatDateTime(depositRecord.createdAt)" />
            <DetailField label="更新时间" :value="formatDateTime(depositRecord.updatedAt)" />
          </dl>

          <dl v-else-if="salesRecord">
            <DetailField label="日期" :value="formatDateTime(salesRecord.date)" />
            <DetailField label="销售单号" :value="salesRecord.salesOrderNumber" copyable />
            <DetailField label="所属商户" :value="merchantStore.merchant.name" />
            <DetailField label="所属门店" :value="storeName" />
            <DetailField label="商品名称" :value="salesRecord.productName" />
            <DetailField label="商品型号" :value="salesRecord.productModel" />
            <DetailField label="商品数量" :value="`${salesRecord.quantity} 件`" />
            <DetailField label="商品单价" :value="formatMoney(salesRecord.unitPrice)" />
            <DetailField label="订单金额" :value="formatMoney(salesRecord.amount)" />
            <DetailField label="优惠金额" :value="formatMoney(salesRecord.discountAmount)" />
            <DetailField label="结款金额" :value="formatMoney(salesRecord.settlementAmount)" />
            <DetailField label="结款状态" :value="salesRecord.settlementStatus" />
            <DetailField
              v-if="salesRecord.settlementTime"
              label="结款时间"
              :value="formatDateTime(salesRecord.settlementTime)"
            />
            <DetailField label="支付方式" :value="salesRecord.paymentMethod" />
            <DetailField label="销售人员" :value="salesRecord.salesperson" />
            <DetailField
              v-if="normalizedRemark(salesRecord.remark)"
              label="订单备注"
              :value="normalizedRemark(salesRecord.remark)"
            />
          </dl>
        </section>

        <section v-if="fundingRecord" class="record-detail-view__card">
          <h2>资金凭证</h2>
          <VoucherPreview :images="fundingRecord.voucherImages" />
        </section>
      </template>
    </main>
  </section>
</template>

<style scoped lang="scss">
.record-detail-view {
  width: 100%;
  max-width: 750px;
  min-height: 100vh;
  margin: 0 auto;
  overflow-x: hidden;
}

.record-detail-view__bar {
  position: sticky;
  z-index: 10;
  top: 0;
  display: grid;
  grid-template-columns: 150px 1fr 150px;
  min-height: 92px;
  align-items: center;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid var(--color-divider);
}

.record-detail-view__bar button {
  display: inline-flex;
  min-width: 80px;
  min-height: 80px;
  align-items: center;
  gap: 8px;
  padding: 0;
  color: var(--color-primary);
  font-size: 24px;
  background: transparent;
  border: 0;
}

.record-detail-view__bar button span {
  font-size: 46px;
  line-height: 1;
}

.record-detail-view__bar h1 {
  margin: 0;
  overflow: hidden;
  font-size: 30px;
  line-height: 1.3;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-detail-view__content {
  display: grid;
  gap: 22px;
  padding: 24px 24px calc(40px + env(safe-area-inset-bottom));
}

.record-detail-view__summary,
.record-detail-view__card {
  background: var(--color-card-background);
  border: 1px solid var(--color-border);
  border-radius: 22px;
  box-shadow: 0 5px 18px rgb(38 38 38 / 4%);
}

.record-detail-view__summary {
  display: grid;
  min-height: 230px;
  place-items: center;
  align-content: center;
  gap: 13px;
  padding: 30px;
}

.record-detail-view__summary p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 23px;
}

.record-detail-view__card {
  padding: 26px;
}

.record-detail-view__card h2 {
  margin: 0 0 10px;
  font-size: 28px;
  line-height: 1.4;
}

.record-detail-view__card dl {
  margin: 0;
}
</style>
