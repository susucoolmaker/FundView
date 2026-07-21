# Merchant Fund Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, runnable, interactive Vue 3 mobile H5 demo for merchant wallet, funding records, deposits, sales, details, vouchers, and merchant profile.

**Architecture:** Use a route-driven app shell with Pinia stores for merchant selection and persisted record-query state. Keep business data behind a typed asynchronous Mock Service; share list/detail infrastructure through small components and typed business configuration rather than large conditional templates.

**Tech Stack:** Vue 3.5, TypeScript 5.9, Vite 8, Vue Router 4, Pinia 3, Vant 4.10, Sass, PostCSS 8 viewport conversion, Vitest 4, Vue Test Utils, jsdom.

## Global Constraints

- Use Vue 3, TypeScript, Vite, Vue Router, Pinia, Vant 4, Sass, Composition API, and `<script setup lang="ts">`.
- The project must start with `npm install` and `npm run dev`.
- Use local typed Mock data only; do not add login or a real backend.
- Use `#6E20AF` as the global brand color and `#59158F` as its active state.
- Author project styles against a 750px design width and configure `viewportWidth: 750`.
- Exclude `node_modules` so Vant styles are not converted.
- Support `env(safe-area-inset-bottom)` and prohibit page-level horizontal scrolling.
- Wallet balance is merchant-scoped, shared by all stores, and never changes with store selection.
- Recharge, successful-withdraw totals, current deposit balance, recent records, and record-list defaults follow the selected store.
- Store deposit balances are 80000, 70000, and 50000; the all-store total is 200000.
- All monetary values are numbers in the data layer and render with `¥`, thousands separators, and two decimals.
- Lists use Vant PullRefresh and List, page in groups of 20, and distinguish empty, no-result, network, expired-login, forbidden, and no-more states.
- Detail pages hide bottom navigation; list pages show it.

---

## Planned File Map

```text
package.json                         scripts and dependency versions
index.html                           Vite entry document and mobile viewport
vite.config.ts                       Vue plugin and Vitest/jsdom settings
postcss.config.cjs                   750px viewport conversion and exclusions
tsconfig.json                        project references
tsconfig.app.json                    application TypeScript settings
tsconfig.node.json                   Vite configuration TypeScript settings
src/main.ts                          Vue/Pinia/Router/Vant bootstrap
src/App.vue                          route shell and bottom-nav visibility
src/env.d.ts                         Vite type references
src/styles/variables.scss            brand and semantic tokens
src/styles/global.scss               reset, safe areas, typography, cards
src/router/index.ts                  all required routes and route metadata
src/types/index.ts                   domain unions and interfaces
src/utils/format.ts                  money/date/copy helpers
src/utils/query.ts                   date ranges, record matching, pagination
src/utils/status.ts                  semantic status mapping
src/mock/merchant.ts                 merchant, stores, notices
src/mock/records.ts                  recharge/withdraw/deposit/sales fixtures
src/mock/service.ts                  delayed filtering/paging/detail API
src/stores/merchant.ts               merchant wallet and selected-store state
src/stores/records.ts                per-business query, paging, and scroll state
src/config/record-config.ts           typed per-business display configuration
src/components/*.vue                 reusable UI units required by the spec
src/views/dashboard/DashboardView.vue dashboard composition
src/views/records/RecordsView.vue     shared four-business list page
src/views/details/RecordDetailView.vue shared business detail page
src/views/profile/ProfileView.vue     merchant/account/store bindings
src/tests/setup.ts                    DOM/Vant test setup
src/**/*.spec.ts                      unit and component behavior tests
README.md                             install, run, build, and demo notes
```

### Task 1: Establish the runnable mobile application shell

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `postcss.config.cjs`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `src/env.d.ts`
- Create: `src/main.ts`
- Create: `src/App.vue`
- Create: `src/router/index.ts`
- Create: `src/components/BottomNavigation.vue`
- Create: `src/views/dashboard/DashboardView.vue`
- Create: `src/views/records/RecordsView.vue`
- Create: `src/views/details/RecordDetailView.vue`
- Create: `src/views/profile/ProfileView.vue`
- Create: `src/styles/variables.scss`
- Create: `src/styles/global.scss`
- Create: `src/tests/setup.ts`
- Test: `src/App.spec.ts`

**Interfaces:**
- Consumes: no earlier task.
- Produces: `router`, route meta property `hideBottomNav`, CSS variables, and a mounted Vue app used by every later task.

- [ ] **Step 1: Write the failing app-shell test**

```ts
// src/App.spec.ts
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import App from './App.vue'
import router from './router'

it('redirects to the dashboard and renders the three bottom navigation items', async () => {
  router.push('/')
  await router.isReady()
  const wrapper = mount(App, {
    global: { plugins: [createTestingPinia({ stubActions: false }), router] },
  })
  expect(router.currentRoute.value.fullPath).toBe('/dashboard')
  expect(wrapper.text()).toContain('首页')
  expect(wrapper.text()).toContain('明细')
  expect(wrapper.text()).toContain('我的')
})
```

- [ ] **Step 2: Add package and test configuration, then confirm the test fails**

```json
{
  "name": "merchant-fund-dashboard",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vue-tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vant/touch-emulator": "^1.4.0",
    "pinia": "^3.0.3",
    "vant": "^4.10.0",
    "vue": "^3.5.39",
    "vue-router": "^4.6.3"
  },
  "devDependencies": {
    "@pinia/testing": "^1.0.2",
    "@types/node": "^24.10.0",
    "@vitejs/plugin-vue": "^6.0.4",
    "@vue/test-utils": "^2.4.6",
    "jsdom": "^27.4.0",
    "postcss-px-to-viewport-8-plugin": "^1.2.2",
    "sass": "^1.97.0",
    "typescript": "~5.9.3",
    "vite": "^8.1.3",
    "vitest": "^4.1.10",
    "vue-tsc": "^3.1.5"
  }
}
```

Run: `npm install && npm test -- src/App.spec.ts`  
Expected: FAIL because `App.vue`, router, and bottom navigation do not exist yet.

- [ ] **Step 3: Implement Vite, viewport conversion, router, shell, and tokens**

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'jsdom', setupFiles: ['./src/tests/setup.ts'], globals: true },
})
```

```js
// postcss.config.cjs
module.exports = {
  plugins: {
    'postcss-px-to-viewport-8-plugin': {
      unitToConvert: 'px',
      viewportWidth: 750,
      unitPrecision: 6,
      propList: ['*'],
      viewportUnit: 'vw',
      selectorBlackList: ['.ignore-vw'],
      minPixelValue: 1,
      mediaQuery: false,
      exclude: [/node_modules/],
    },
  },
}
```

```ts
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: () => import('@/views/dashboard/DashboardView.vue') },
    { path: '/records/:type(recharge|withdraw|deposit|sales)', component: () => import('@/views/records/RecordsView.vue') },
    { path: '/detail/:type(recharge|withdraw|deposit|sales)/:id', component: () => import('@/views/details/RecordDetailView.vue'), meta: { hideBottomNav: true } },
    { path: '/profile', component: () => import('@/views/profile/ProfileView.vue') },
  ],
})
```

```scss
// src/styles/variables.scss
:root {
  --color-primary: #6e20af;
  --color-primary-active: #59158f;
  --color-primary-light: #f5eefa;
  --color-primary-lighter: #faf7fc;
  --color-primary-border: #dcc4ed;
  --color-page-background: #f0f2f5;
  --color-card-background: #fff;
  --color-text-primary: #262626;
  --color-text-secondary: #666;
  --color-text-tertiary: #999;
  --color-border: #e5e6eb;
  --color-divider: #eee;
  --color-success: #2e7d32;
  --color-processing: #d97706;
  --color-failure: #d9363e;
  --color-neutral: #8c8c8c;
}
```

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNavigation from '@/components/BottomNavigation.vue'

const route = useRoute()
const showBottomNavigation = computed(() => !route.meta.hideBottomNav)
</script>

<template>
  <main class="app-shell" :class="{ 'app-shell--with-nav': showBottomNavigation }">
    <RouterView />
  </main>
  <BottomNavigation v-if="showBottomNavigation" />
</template>
```

```ts
// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vant from 'vant'
import 'vant/lib/index.css'
import '@/styles/variables.scss'
import '@/styles/global.scss'
import App from './App.vue'
import router from './router'

createApp(App).use(createPinia()).use(router).use(Vant).mount('#app')
```

```vue
<!-- src/components/BottomNavigation.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const active = computed(() => route.path.startsWith('/records') ? 'records' : route.path === '/profile' ? 'profile' : 'dashboard')
const navigate = (name: string) => router.push(name === 'records' ? '/records/recharge' : name === 'profile' ? '/profile' : '/dashboard')
</script>

<template>
  <nav class="bottom-navigation" aria-label="主导航">
    <button v-for="item in [{ name: 'dashboard', label: '首页' }, { name: 'records', label: '明细' }, { name: 'profile', label: '我的' }]" :key="item.name" :class="{ active: active === item.name }" @click="navigate(item.name)">
      <span aria-hidden="true">●</span><span>{{ item.label }}</span>
    </button>
  </nav>
</template>
```

```scss
// src/styles/global.scss
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body, #app { min-height: 100%; margin: 0; }
body { overflow-x: hidden; color: var(--color-text-primary); background: var(--color-page-background); font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; }
button, input { font: inherit; }
.app-shell { width: 100%; min-height: 100vh; overflow-x: hidden; }
.app-shell--with-nav { padding-bottom: calc(120px + env(safe-area-inset-bottom)); }
.bottom-navigation { position: fixed; z-index: 20; right: 0; bottom: 0; left: 0; display: flex; height: calc(112px + env(safe-area-inset-bottom)); padding-bottom: env(safe-area-inset-bottom); background: #fff; border-top: 1px solid var(--color-divider); }
.bottom-navigation button { flex: 1; min-width: 0; color: var(--color-text-tertiary); background: transparent; }
.bottom-navigation button.active { color: var(--color-primary); }
```

Create initial view files with exact visible labels so dynamic imports compile before their feature tasks replace the contents:

```vue
<!-- src/views/dashboard/DashboardView.vue -->
<template><section>资金看板</section></template>
```

```vue
<!-- src/views/records/RecordsView.vue -->
<template><section>明细</section></template>
```

```vue
<!-- src/views/details/RecordDetailView.vue -->
<template><section>详情</section></template>
```

```vue
<!-- src/views/profile/ProfileView.vue -->
<template><section>我的</section></template>
```

- [ ] **Step 4: Run the shell test and production build**

Run: `npm test -- src/App.spec.ts && npm run build`  
Expected: one passing shell test and a successful Vite production build.

- [ ] **Step 5: Commit the runnable foundation**

```bash
git add package.json package-lock.json index.html vite.config.ts postcss.config.cjs tsconfig*.json src
git commit -m "feat: scaffold merchant fund dashboard"
```

### Task 2: Define domain types and deterministic formatting/query utilities

**Files:**
- Create: `src/types/index.ts`
- Create: `src/utils/format.ts`
- Create: `src/utils/query.ts`
- Create: `src/utils/status.ts`
- Test: `src/utils/format.spec.ts`
- Test: `src/utils/query.spec.ts`
- Test: `src/utils/status.spec.ts`

**Interfaces:**
- Consumes: Vitest configuration from Task 1.
- Produces: `BusinessType`, `Merchant`, `Store`, record interfaces, `QueryCondition`, `formatMoney`, `formatDateTime`, `getDateRange`, `matchesRecord`, `paginate`, and `getStatusTone`.

- [ ] **Step 1: Write failing tests for money, dates, matching, paging, and status tones**

```ts
const condition = { datePreset: 'custom', startDate: '2026-07-01', endDate: '2026-07-31', storeId: 'all', keyword: '' } as const
const recharge = { id: 'r1', type: 'recharge', merchantId: 'm1', storeId: 's1', date: '2026-07-16T14:35:00+08:00', amount: 50000, serialNumber: 'CZ202607160001', voucherImages: [] } as const
const sale = { id: 's1', type: 'sales', merchantId: 'm1', storeId: 's1', date: '2026-07-16T15:00:00+08:00', amount: 6999, salesOrderNumber: 'XS202607160001', productName: '华为 Mate 系列手机', productModel: 'Mate', quantity: 1, unitPrice: 6999, discountAmount: 0, settlementAmount: 6999, settlementStatus: '已结款', paymentMethod: '微信支付', salesperson: '李明' } as const

expect(formatMoney(328000)).toBe('¥328,000.00')
expect(formatMoney(20000, { sign: '-' })).toBe('-¥20,000.00')
expect(formatDateTime('2026-07-16T14:35:00+08:00')).toBe('2026-07-16 14:35')
expect(getDateRange('month', new Date('2026-07-17T12:00:00+08:00'))).toEqual({ startDate: '2026-07-01', endDate: '2026-07-31' })
expect(matchesRecord(recharge, { ...condition, keyword: '50000' })).toBe(true)
expect(matchesRecord(sale, { ...condition, keyword: 'Mate' })).toBe(true)
expect(paginate(Array.from({ length: 21 }), 1, 20)).toHaveLength(20)
expect(getStatusTone('提现失败')).toBe('failure')
```

- [ ] **Step 2: Run utility tests and verify they fail**

Run: `npm test -- src/utils`  
Expected: FAIL with unresolved imports from `types`, `format`, `query`, and `status`.

- [ ] **Step 3: Implement exact domain and utility interfaces**

```ts
export type BusinessType = 'recharge' | 'withdraw' | 'deposit' | 'sales'
export type RecordStatus = '待处理' | '处理中' | '提现成功' | '提现失败' | '已驳回' | '已取消' | '已生效' | '已完成' | '已失效'
export type DepositType = '保证金缴纳' | '保证金补缴' | '保证金扣除' | '保证金退回' | '保证金调整'
export type SettlementStatus = '待结款' | '结款中' | '已结款' | '结款失败' | '部分结款'
export type DatePreset = 'today' | 'month' | 'lastMonth' | 'custom'

export interface Merchant { id: string; name: string; realNameCode: string; walletBalance: number; administrator: string; maskedPhone: string; role: string }
export interface Store { id: string; name: string; code: string; boundEmployeeCount: number; bindingStatus: '已绑定' | '未绑定' | '绑定异常' | '已停用'; currentDepositBalance: number }
export interface QueryCondition { datePreset: DatePreset; startDate: string; endDate: string; storeId: 'all' | string; keyword: string }
export interface BaseRecord { id: string; merchantId: string; storeId: string; date: string; amount: number; remark?: string; voucherImages: string[] }
export interface RechargeRecord extends BaseRecord { type: 'recharge'; serialNumber: string; rechargeMethod?: string; payerAccount?: string; receiverAccount?: string; createdAt?: string; operator?: string }
export interface WithdrawRecord extends BaseRecord { type: 'withdraw'; serialNumber: string; status: Extract<RecordStatus, '待处理' | '处理中' | '提现成功' | '提现失败' | '已驳回' | '已取消'>; failureReason?: string; rejectReason?: string; bankName?: string }
export interface DepositRecord extends BaseRecord { type: 'deposit'; serialNumber: string; depositType: DepositType; status: Extract<RecordStatus, '待处理' | '处理中' | '已生效' | '已完成' | '已驳回' | '已失效'>; balanceBefore?: number; balanceAfter?: number }
export interface SalesRecord extends Omit<BaseRecord, 'voucherImages'> { type: 'sales'; salesOrderNumber: string; productName: string; productModel: string; quantity: number; unitPrice: number; discountAmount: number; settlementAmount: number; settlementStatus: SettlementStatus; settlementTime?: string; paymentMethod: string; salesperson: string }
export type BusinessRecord = RechargeRecord | WithdrawRecord | DepositRecord | SalesRecord
export interface Notice { id: string; title: string; content: string; tone: 'success' | 'warning' | 'failure' | 'neutral' }
```

```ts
export const formatMoney = (value: number, options: { sign?: '+' | '-' } = {}) => `${options.sign ?? ''}¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const formatDateTime = (value: string) => value.slice(0, 16).replace('T', ' ')
```

`matchesRecord(record, condition)` first filters ISO date and store, then matches sales order/product for sales or serial/precise numeric amount for funding records. `paginate(records, page, pageSize)` returns `records.slice((page - 1) * pageSize, page * pageSize)`.

- [ ] **Step 4: Run all utility tests**

Run: `npm test -- src/utils`  
Expected: all utility test files pass.

- [ ] **Step 5: Commit domain contracts**

```bash
git add src/types src/utils
git commit -m "feat: add funding domain types and utilities"
```

### Task 3: Build Mock data, asynchronous service, and merchant-level funding store

**Files:**
- Create: `src/mock/merchant.ts`
- Create: `src/mock/records.ts`
- Create: `src/mock/service.ts`
- Create: `src/stores/merchant.ts`
- Test: `src/stores/merchant.spec.ts`
- Test: `src/mock/service.spec.ts`

**Interfaces:**
- Consumes: `Merchant`, `Store`, `BusinessRecord`, `BusinessType`, `QueryCondition`, `matchesRecord`, and `paginate` from Task 2.
- Produces: `merchant`, `stores`, `notices`, four fixture arrays, `mockApi.fetchRecords`, `mockApi.fetchRecordDetail`, `mockApi.setScenario`, and `useMerchantStore`.

- [ ] **Step 1: Write failing store and service tests**

```ts
const defaultQuery = { datePreset: 'custom', startDate: '2025-01-01', endDate: '2026-12-31', storeId: 'all', keyword: '' } as const

it('keeps merchant wallet fixed while store metrics change', () => {
  const store = useMerchantStore()
  expect(store.walletBalance).toBe(568420.36)
  store.selectStore('store-wangjing')
  expect(store.walletBalance).toBe(568420.36)
  expect(store.currentDepositBalance).toBe(80000)
  store.selectStore('store-guomao')
  expect(store.walletBalance).toBe(568420.36)
  expect(store.currentDepositBalance).toBe(50000)
})

it('returns 20 sales records on the first page and one or more on the second', async () => {
  const first = await mockApi.fetchRecords('sales', defaultQuery, 1, 20)
  const second = await mockApi.fetchRecords('sales', defaultQuery, 2, 20)
  expect(first.items).toHaveLength(20)
  expect(second.items.length).toBeGreaterThan(0)
})

it('can expose the dedicated network failure state without changing data', async () => {
  mockApi.setScenario('network')
  await expect(mockApi.fetchRecords('recharge', defaultQuery, 1, 20)).rejects.toMatchObject({ kind: 'network' })
  mockApi.setScenario('normal')
})
```

- [ ] **Step 2: Run the tests and verify missing fixtures/store failures**

Run: `npm test -- src/stores/merchant.spec.ts src/mock/service.spec.ts`  
Expected: FAIL because merchant store and Mock Service do not exist.

- [ ] **Step 3: Add complete fixtures and typed Mock Service behavior**

Create one merchant with `walletBalance: 568420.36`, three stores with the confirmed deposit balances, two notices, 12 recharge records, 10 withdraw records, 10 deposit records, and 24 sales records. Dates span today, this month, last month, and older dates; records cover every requested status, store, long/empty remark, long product, rejection/failure reason, and empty voucher case.

```ts
export interface PageResult<T> { items: T[]; total: number; hasMore: boolean }
export type MockScenario = 'normal' | 'network' | 'expired' | 'forbidden'

let scenario: MockScenario = 'normal'
const assertScenario = () => {
  if (scenario !== 'normal') throw { kind: scenario }
}

export const mockApi = {
  setScenario(next: MockScenario) { scenario = next },
  async fetchRecords(type: BusinessType, query: QueryCondition, page: number, pageSize = 20): Promise<PageResult<BusinessRecord>> {
    await delay(180)
    assertScenario()
    const filtered = recordMap[type].filter(record => matchesRecord(record, query))
    const items = paginate(filtered, page, pageSize)
    return { items, total: filtered.length, hasMore: page * pageSize < filtered.length }
  },
  async fetchRecordDetail(type: BusinessType, id: string): Promise<BusinessRecord | undefined> {
    await delay(120)
    assertScenario()
    return recordMap[type].find(record => record.id === id)
  },
}
```

```ts
export const useMerchantStore = defineStore('merchant', () => {
  const selectedStoreId = ref<'all' | string>('all')
  const walletBalance = computed(() => merchant.walletBalance)
  const currentDepositBalance = computed(() => selectedStoreId.value === 'all'
    ? stores.reduce((sum, store) => sum + store.currentDepositBalance, 0)
    : stores.find(store => store.id === selectedStoreId.value)?.currentDepositBalance ?? 0)
  const selectStore = (id: 'all' | string) => { selectedStoreId.value = id }
  return { merchant, stores, notices, selectedStoreId, walletBalance, currentDepositBalance, selectStore }
})
```

- [ ] **Step 4: Run Mock and merchant tests**

Run: `npm test -- src/stores/merchant.spec.ts src/mock/service.spec.ts`  
Expected: all tests pass, including exact `200000` all-store deposit total.

- [ ] **Step 5: Commit reliable local data**

```bash
git add src/mock src/stores/merchant.ts src/stores/merchant.spec.ts
git commit -m "feat: add merchant funding mock service"
```

### Task 4: Implement the high-fidelity dashboard and store selection flow

**Files:**
- Create: `src/components/MerchantHeader.vue`
- Create: `src/components/StoreSelector.vue`
- Create: `src/components/AmountDisplay.vue`
- Create: `src/components/FundOverview.vue`
- Create: `src/components/QuickEntry.vue`
- Create: `src/components/RecentRecordList.vue`
- Create: `src/components/StatusTag.vue`
- Create: `src/views/dashboard/DashboardView.vue`
- Test: `src/views/dashboard/DashboardView.spec.ts`

**Interfaces:**
- Consumes: `useMerchantStore`, record fixtures, formatting/status utilities, and routes.
- Produces: `DashboardView`, store popup interaction, fixed merchant wallet card, store-linked metrics, quick entry routing, and recent-record routing.

- [ ] **Step 1: Write the failing dashboard interaction test**

```ts
it('shows the merchant wallet and keeps it fixed after selecting another store', async () => {
  const wrapper = mountDashboard()
  expect(wrapper.get('[data-testid="wallet-balance"]').text()).toContain('¥568,420.36')
  await wrapper.get('[data-testid="store-trigger"]').trigger('click')
  await wrapper.get('[data-testid="store-option-store-guomao"]').trigger('click')
  expect(wrapper.get('[data-testid="wallet-balance"]').text()).toContain('¥568,420.36')
  expect(wrapper.get('[data-testid="deposit-balance"]').text()).toContain('¥50,000.00')
  expect(wrapper.text()).toContain('全部门店共用余额')
})
```

- [ ] **Step 2: Run the dashboard test and verify it fails**

Run: `npm test -- src/views/dashboard/DashboardView.spec.ts`  
Expected: FAIL because dashboard components do not exist.

- [ ] **Step 3: Implement dashboard components and styles**

`FundOverview.vue` receives `merchantName`, `walletBalance`, `monthlyRecharge`, `monthlySuccessfulWithdraw`, and `currentDepositBalance`. It renders a white 24px-radius main card with merchant name in 24px text, wallet label, 58px purple amount, “全部门店共用余额”, and a lower three-metric grid. It never receives `selectedStoreId`, preventing accidental wallet linkage.

```vue
<FundOverview
  :merchant-name="merchantStore.merchant.name"
  :wallet-balance="merchantStore.walletBalance"
  :monthly-recharge="monthlyRecharge"
  :monthly-successful-withdraw="monthlySuccessfulWithdraw"
  :current-deposit-balance="merchantStore.currentDepositBalance"
/>
```

`StoreSelector.vue` wraps `van-popup position="bottom"` and `van-picker`, emits `confirm(id)`, and displays all stores plus “全部门店”. `QuickEntry.vue` routes to the four record URLs. `RecentRecordList.vue` sorts mixed records descending by date, filters by selected store, limits to five, shows type/status/store/date/amount, and routes to the matching detail URL on whole-card click.

- [ ] **Step 4: Run dashboard tests and inspect at 375px**

Run: `npm test -- src/views/dashboard/DashboardView.spec.ts && npm run build`  
Expected: dashboard test passes and build succeeds. In-browser inspection must show no horizontal overflow and wallet balance unchanged across all four store choices.

- [ ] **Step 5: Commit the dashboard**

```bash
git add src/components src/views/dashboard
git commit -m "feat: build merchant wallet dashboard"
```

### Task 5: Implement persisted record query state and per-business configuration

**Files:**
- Create: `src/config/record-config.ts`
- Create: `src/stores/records.ts`
- Test: `src/stores/records.spec.ts`
- Test: `src/config/record-config.spec.ts`

**Interfaces:**
- Consumes: `BusinessType`, `BusinessRecord`, `QueryCondition`, Mock Service.
- Produces: `recordConfigs`, `useRecordsStore`, `draftQuery`, `appliedQuery`, `applyQuery`, `resetQuery`, `refresh`, `loadMore`, `saveScroll`, and `restoreScroll`.

- [ ] **Step 1: Write failing tests for search, reset, page size, and preserved state**

```ts
it('does not apply draft filters until query is submitted', async () => {
  const store = useRecordsStore()
  store.setDraft('recharge', { keyword: '50000' })
  expect(store.stateFor('recharge').appliedQuery.keyword).toBe('')
  await store.applyQuery('recharge')
  expect(store.stateFor('recharge').appliedQuery.keyword).toBe('50000')
})

it('resets to this month, all stores, and an empty keyword', async () => {
  const store = useRecordsStore()
  await store.resetQuery('sales')
  expect(store.stateFor('sales').appliedQuery).toMatchObject({ datePreset: 'month', storeId: 'all', keyword: '' })
})
```

- [ ] **Step 2: Run store/config tests and verify they fail**

Run: `npm test -- src/stores/records.spec.ts src/config/record-config.spec.ts`  
Expected: FAIL because record config and state do not exist.

- [ ] **Step 3: Implement typed record config and Pinia state machine**

```ts
export interface RecordConfig {
  type: BusinessType
  tabLabel: string
  listTitle: string
  detailTitle: string
  searchPlaceholder: string
  emptyText: string
  amountLabel: string
  hasVoucher: boolean
}

export const recordConfigs: Record<BusinessType, RecordConfig> = {
  recharge: { type: 'recharge', tabLabel: '充值', listTitle: '充值记录', detailTitle: '充值详情', searchPlaceholder: '输入流水号或金额', emptyText: '暂无充值记录', amountLabel: '充值金额', hasVoucher: true },
  withdraw: { type: 'withdraw', tabLabel: '提现', listTitle: '提现记录', detailTitle: '提现详情', searchPlaceholder: '输入流水号或金额', emptyText: '暂无提现记录', amountLabel: '提现金额', hasVoucher: true },
  deposit: { type: 'deposit', tabLabel: '保证金', listTitle: '保证金记录', detailTitle: '保证金详情', searchPlaceholder: '输入流水号或金额', emptyText: '暂无保证金记录', amountLabel: '变动金额', hasVoucher: true },
  sales: { type: 'sales', tabLabel: '销售', listTitle: '销售明细', detailTitle: '销售详情', searchPlaceholder: '输入销售单号或商品名称', emptyText: '暂无销售记录', amountLabel: '订单金额', hasVoucher: false },
}
```

Each business owns an independent `RecordListState` containing `draftQuery`, `appliedQuery`, `items`, `page`, `total`, `hasMore`, `loading`, `refreshing`, `errorKind`, and `scrollTop`. `loadMore` ignores duplicate requests and appends exactly one 20-record page.

- [ ] **Step 4: Run state and configuration tests**

Run: `npm test -- src/stores/records.spec.ts src/config/record-config.spec.ts`  
Expected: all tests pass, including 20-item page boundary and independent business state.

- [ ] **Step 5: Commit record state infrastructure**

```bash
git add src/config src/stores/records.ts src/stores/records.spec.ts
git commit -m "feat: add persistent record query state"
```

### Task 6: Build the four interactive record-list experiences

**Files:**
- Create: `src/components/RecordTabs.vue`
- Create: `src/components/RecordFilter.vue`
- Create: `src/components/RecordCard.vue`
- Create: `src/components/EmptyState.vue`
- Create: `src/components/LoadingState.vue`
- Create: `src/views/records/RecordsView.vue`
- Test: `src/views/records/RecordsView.spec.ts`
- Test: `src/components/RecordFilter.spec.ts`

**Interfaces:**
- Consumes: `recordConfigs`, `useRecordsStore`, `useMerchantStore`, Vant Calendar/Popup/PullRefresh/List, formatter and status helpers.
- Produces: all `/records/*` pages with tabs, date/store/search filters, query/reset, paging, refresh, empty/error states, and whole-card navigation.

- [ ] **Step 1: Write failing interaction tests**

```ts
it('switches from recharge to sales by route and changes the search prompt', async () => {
  const wrapper = mountRecords('/records/recharge')
  await wrapper.get('[data-testid="tab-sales"]').trigger('click')
  expect(router.currentRoute.value.fullPath).toBe('/records/sales')
  expect(wrapper.get('input').attributes('placeholder')).toBe('输入销售单号或商品名称')
})

it('applies and resets keyword filters', async () => {
  const wrapper = mountRecords('/records/recharge')
  await wrapper.get('input').setValue('CZ202607160001')
  await wrapper.get('[data-testid="query-button"]').trigger('click')
  expect(wrapper.text()).toContain('CZ202607160001')
  await wrapper.get('[data-testid="reset-button"]').trigger('click')
  expect(wrapper.get('input').element.value).toBe('')
})
```

- [ ] **Step 2: Run list tests and verify missing-component failures**

Run: `npm test -- src/views/records/RecordsView.spec.ts src/components/RecordFilter.spec.ts`  
Expected: FAIL because list/filter components do not exist.

- [ ] **Step 3: Implement tabs, filters, cards, and Vant list lifecycle**

`RecordFilter.vue` keeps controls compact: two 50%-width selector buttons on row one; search plus 160px primary query button on row two; “重置” is a text action in the header. The custom range opens `van-calendar type="range"`. The store selector uses the same store choices as the dashboard.

`RecordCard.vue` receives one `BusinessRecord`, uses a small discriminated child template for four focused layouts, retains complete serial/order numbers, clamps sales products to two lines, and emits `open(record)` from the card root.

```vue
<van-pull-refresh v-model="state.refreshing" @refresh="recordsStore.refresh(type)">
  <van-list
    :loading="state.loading"
    :finished="!state.hasMore"
    finished-text="没有更多数据了"
    @load="recordsStore.loadMore(type)"
  >
    <RecordCard v-for="record in state.items" :key="record.id" :record="record" @open="openDetail" />
  </van-list>
</van-pull-refresh>
```

The view renders “本月 · 北京望京店 · 共 12 条” from the applied query, not the draft query. Error states provide context-specific text and a retry action.

- [ ] **Step 4: Run record tests and build**

Run: `npm test -- src/views/records/RecordsView.spec.ts src/components/RecordFilter.spec.ts && npm run build`  
Expected: tests pass and all four record routes compile.

- [ ] **Step 5: Commit interactive lists**

```bash
git add src/components src/views/records
git commit -m "feat: add searchable funding record lists"
```

### Task 7: Implement record details, copying, and voucher preview

**Files:**
- Create: `src/components/DetailField.vue`
- Create: `src/components/VoucherPreview.vue`
- Create: `src/views/details/RecordDetailView.vue`
- Test: `src/views/details/RecordDetailView.spec.ts`
- Test: `src/components/VoucherPreview.spec.ts`
- Create: `src/assets/vouchers/recharge-voucher.svg`
- Create: `src/assets/vouchers/withdraw-voucher.svg`
- Create: `src/assets/vouchers/deposit-voucher.svg`

**Interfaces:**
- Consumes: route params, `mockApi.fetchRecordDetail`, record configs, merchant/store data, Vant ImagePreview, clipboard helper.
- Produces: all four detail routes, business-specific fields, copy actions, voucher thumbnail/preview/error/empty states, and not-found fallback.

- [ ] **Step 1: Write failing detail and voucher tests**

```ts
it('renders complete recharge fields and voucher preview', async () => {
  const wrapper = mountDetail('/detail/recharge/recharge-001')
  await flushPromises()
  expect(wrapper.text()).toContain('充值详情')
  expect(wrapper.text()).toContain('CZ202607160001')
  expect(wrapper.find('[data-testid="voucher-thumbnail"]').exists()).toBe(true)
})

it('never renders a voucher section for sales details', async () => {
  const wrapper = mountDetail('/detail/sales/sales-001')
  await flushPromises()
  expect(wrapper.text()).toContain('销售详情')
  expect(wrapper.text()).not.toContain('资金凭证')
})
```

- [ ] **Step 2: Run detail tests and verify they fail**

Run: `npm test -- src/views/details/RecordDetailView.spec.ts src/components/VoucherPreview.spec.ts`  
Expected: FAIL because details and vouchers do not exist.

- [ ] **Step 3: Implement shared detail shell and explicit business field maps**

The detail view loads by `type` and `id`, renders a compact internal back bar, amount/status summary, merchant/store, business fields, remark, and vouchers only when `recordConfigs[type].hasVoucher` is true. Sales renders product/model/quantity/unit price/order/discount/settlement/status/time/payment/salesperson/remark.

```vue
<DetailField label="流水号" :value="fundingRecord.serialNumber" copyable />
<DetailField label="所属商户" :value="merchant.name" />
<DetailField label="所属门店" :value="storeName" />
<VoucherPreview v-if="config.hasVoucher" :images="fundingRecord.voucherImages" />
```

`VoucherPreview.vue` uses `showImagePreview({ images, startPosition: index, closeable: true })`, `object-fit: contain`, an image-error flag per URL, and text “暂无资金凭证” for an empty array. Local SVG voucher assets are business-document mockups, not external photos.

- [ ] **Step 4: Run detail tests and exercise all eight success/edge routes**

Run: `npm test -- src/views/details/RecordDetailView.spec.ts src/components/VoucherPreview.spec.ts && npm run build`  
Expected: tests pass; missing ID renders “记录不存在或已失效”; sales has no voucher; empty funding voucher shows its dedicated text.

- [ ] **Step 5: Commit details and vouchers**

```bash
git add src/components src/views/details src/assets/vouchers
git commit -m "feat: add record details and voucher preview"
```

### Task 8: Complete profile, navigation polish, state restoration, and acceptance QA

**Files:**
- Create: `src/components/StoreCard.vue`
- Create: `src/views/profile/ProfileView.vue`
- Modify: `src/components/BottomNavigation.vue`
- Modify: `src/views/records/RecordsView.vue`
- Modify: `src/router/index.ts`
- Create: `src/views/profile/ProfileView.spec.ts`
- Create: `src/views/records/scroll-restoration.spec.ts`
- Create: `README.md`

**Interfaces:**
- Consumes: merchant/store/notices data, route metadata, `saveScroll`/`restoreScroll`.
- Produces: complete profile route, binding semantics, stable bottom navigation, list-return restoration, and final run instructions.

- [ ] **Step 1: Write failing profile and scroll-restoration tests**

```ts
it('renders merchant identity and the abnormal Guomao binding', () => {
  const wrapper = mountProfile()
  expect(wrapper.text()).toContain('华北恒信通讯有限公司')
  expect(wrapper.text()).toContain('SM2026070018')
  expect(wrapper.text()).toContain('张丽 138****8899')
  expect(wrapper.text()).toContain('北京国贸店')
  expect(wrapper.text()).toContain('绑定异常')
})

it('restores the saved list position after returning from detail', async () => {
  recordsStore.saveScroll('recharge', 860)
  mountRecords('/records/recharge')
  await flushPromises()
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 860, behavior: 'auto' })
})
```

- [ ] **Step 2: Run profile/restoration tests and verify they fail**

Run: `npm test -- src/views/profile/ProfileView.spec.ts src/views/records/scroll-restoration.spec.ts`  
Expected: FAIL because profile and restoration hooks are incomplete.

- [ ] **Step 3: Implement profile and route-return behavior**

`ProfileView.vue` renders the merchant avatar initials, name, “商户管理员”, merchant info fields, two notices, and three `StoreCard` components. `StoreCard` maps 已绑定 to green, 绑定异常 to red, and inactive/unbound to gray, always with visible text.

`RecordsView.vue` saves `window.scrollY` in `onBeforeRouteLeave`; on mount/activation it loads retained records if necessary, waits for `nextTick`, then calls `window.scrollTo({ top: state.scrollTop, behavior: 'auto' })`. Bottom navigation maps the 明细 item to the current/last business route and uses purple only for active state.

- [ ] **Step 4: Run the full automated acceptance suite**

Run: `npm test`  
Expected: every unit and component test passes.

Run: `npm run build`  
Expected: `vue-tsc -b` and Vite build complete without errors.

- [ ] **Step 5: Perform browser acceptance at mobile widths**

Run: `npm run dev` and inspect at 320px, 375px, and 430px widths.

Expected checks:

- `/dashboard` shows wallet `¥568,420.36`; switching among all stores leaves it unchanged and changes deposit to 200000/80000/70000/50000.
- Each quick entry opens the correct `/records/*` route and selected tab.
- Today/month/last-month/custom dates work; store, serial, amount, sales order, and product searches work; reset restores defaults.
- Pull refresh, loading more than 20 sales records, no-result text, no-more text, and retry state work.
- Every detail route opens; funding vouchers preview; empty voucher, failed image, and missing record fallbacks work; sales shows no voucher.
- Returning from detail restores filters and scroll position.
- Profile shows merchant data, two notices, three stores, employee counts, and semantic binding states.
- Bottom navigation is absent on details and present elsewhere; no page scrolls horizontally; bottom content clears safe-area insets.
- Computed custom colors contain `#6E20AF` for brand actions and do not use green or blue as brand colors.

- [ ] **Step 6: Document usage and commit the complete demo**

````md
# 商户资金看板

## 启动

```bash
npm install
npm run dev
```

## 验证

```bash
npm test
npm run build
```

The demo uses local typed Mock data. It does not include login, real APIs, or the WeCom JS-SDK.
````

```bash
git add src README.md
git commit -m "feat: complete merchant fund dashboard demo"
```

## Final Verification Gate

- [ ] Run `npm test` and record the passing test count.
- [ ] Run `npm run build` and record successful type-check/build output.
- [ ] Start `npm run dev`, verify the printed local URL responds, and stop the process cleanly.
- [ ] Inspect the Git diff and status so only planned project files remain.
- [ ] Re-read `docs/superpowers/specs/2026-07-17-merchant-fund-dashboard-design.md` and confirm every section is represented in code or documented as out of scope.
