import { createPinia } from 'pinia'
import Vant from 'vant'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter, useRouter } from 'vue-router'

import App from '@/App.vue'

import BottomNavigation from './BottomNavigation.vue'

const PageStub = defineComponent({ template: '<div />' })
const DashboardStub = defineComponent({
  setup() {
    const router = useRouter()
    return { openRecent: () => router.push('/detail/recharge/recharge-001') }
  },
  template: '<button data-testid="recent-record" @click="openRecent">最近记录</button>',
})
const DetailStub = defineComponent({
  setup() {
    const router = useRouter()
    return { goBack: () => router.back() }
  },
  template: '<button data-testid="detail-back" @click="goBack">返回</button>',
})

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/dashboard', component: DashboardStub },
      { path: '/records/:type', component: PageStub },
      { path: '/profile', component: PageStub },
      {
        path: '/detail/:type/:id',
        component: DetailStub,
        meta: { hideBottomNav: true },
      },
    ],
  })

it('opens the sales records page from the records navigation item', async () => {
  const router = createTestRouter()
  await router.push('/records/recharge')
  await router.isReady()
  const wrapper = mount(BottomNavigation, {
    global: { plugins: [createPinia(), router] },
  })

  await router.push('/profile')
  await flushPromises()
  await wrapper.get('[data-nav="records"]').trigger('click')
  await flushPromises()

  expect(router.currentRoute.value.fullPath).toBe('/records/sales')
})

it('labels the records navigation item as sales details', async () => {
  const router = createTestRouter()
  await router.push('/dashboard')
  await router.isReady()
  const wrapper = mount(BottomNavigation, {
    global: { plugins: [createPinia(), router] },
  })

  expect(wrapper.get('[data-nav="records"]').text()).toContain('销售明细')
  expect(wrapper.get('[data-nav="records"]').text()).not.toBe('明细')
})

it('uses the active class only for the current first-level destination', async () => {
  const router = createTestRouter()
  await router.push('/dashboard')
  await router.isReady()
  const wrapper = mount(BottomNavigation, {
    global: { plugins: [createPinia(), router] },
  })

  expect(wrapper.get('[data-nav="dashboard"]').classes()).toContain('active')
  expect(wrapper.get('[data-nav="records"]').classes()).not.toContain('active')
  expect(wrapper.get('[data-nav="profile"]').classes()).not.toContain('active')
})

it('keeps sales as the records destination when detail navigation destroys and recreates the nav', async () => {
  const router = createTestRouter()
  const pinia = createPinia()
  await router.push('/records/sales')
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [pinia, router, Vant] } })

  await router.push('/dashboard')
  await flushPromises()
  await wrapper.get('[data-testid="recent-record"]').trigger('click')
  await flushPromises()
  expect(router.currentRoute.value.fullPath).toBe('/detail/recharge/recharge-001')
  expect(wrapper.find('[aria-label="主导航"]').exists()).toBe(false)

  await wrapper.get('[data-testid="detail-back"]').trigger('click')
  await vi.waitFor(() => {
    expect(router.currentRoute.value.fullPath).toBe('/dashboard')
  })
  await wrapper.get('[data-nav="records"]').trigger('click')
  await flushPromises()

  expect(router.currentRoute.value.fullPath).toBe('/records/sales')
})

it('uses sales as the default records destination in a fresh app store', async () => {
  const router = createTestRouter()
  await router.push('/dashboard')
  await router.isReady()
  const wrapper = mount(App, {
    global: { plugins: [createPinia(), router, Vant] },
  })

  await wrapper.get('[data-nav="records"]').trigger('click')
  await flushPromises()

  expect(router.currentRoute.value.fullPath).toBe('/records/sales')
})
