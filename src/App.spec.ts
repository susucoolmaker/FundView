import { createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from './App.vue'
import appRouter from './router'

const PageStub = defineComponent({ template: '<div>页面</div>' })

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', redirect: '/dashboard' },
      { path: '/dashboard', component: PageStub },
      { path: '/records/:type(recharge|withdraw|deposit|sales)', component: PageStub },
      { path: '/profile', component: PageStub },
      {
        path: '/detail/:type(recharge|withdraw|deposit|sales)/:id',
        component: PageStub,
        meta: { hideBottomNav: true },
      },
    ],
  })

const mountAppAt = async (path: string) => {
  const router = createTestRouter()
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, {
    global: { plugins: [createPinia(), router] },
  })
  return { wrapper, router }
}

it('redirects to the dashboard and shows bottom navigation', async () => {
  const { wrapper, router } = await mountAppAt('/')
  expect(router.currentRoute.value.fullPath).toBe('/dashboard')
  expect(wrapper.find('[aria-label="主导航"]').exists()).toBe(true)
  expect(wrapper.get('.app-shell').classes()).toContain('app-shell--with-nav')
})

it.each([
  '/dashboard',
  '/records/recharge',
  '/records/withdraw',
  '/records/deposit',
  '/records/sales',
  '/profile',
])(
  'shows the bottom navigation on first-level page %s',
  async (path) => {
    const { wrapper } = await mountAppAt(path)
    expect(wrapper.find('[aria-label="主导航"]').exists()).toBe(true)
    expect(wrapper.get('.app-shell').classes()).toContain('app-shell--with-nav')
  },
)

it.each([
  '/detail/recharge/recharge-001',
  '/detail/withdraw/withdraw-001',
  '/detail/deposit/deposit-001',
  '/detail/sales/sales-001',
])('hides the bottom navigation on detail page %s', async (path) => {
  const { wrapper } = await mountAppAt(path)
  expect(wrapper.find('[aria-label="主导航"]').exists()).toBe(false)
  expect(wrapper.get('.app-shell').classes()).not.toContain('app-shell--with-nav')
})

it('marks only production detail routes to hide the bottom navigation', () => {
  expect(appRouter.resolve('/dashboard').meta.hideBottomNav).not.toBe(true)
  expect(appRouter.resolve('/records/recharge').meta.hideBottomNav).not.toBe(true)
  expect(appRouter.resolve('/records/sales').meta.hideBottomNav).not.toBe(true)
  expect(appRouter.resolve('/detail/recharge/recharge-001').meta.hideBottomNav).toBe(true)
  expect(appRouter.resolve('/detail/sales/sales-001').meta.hideBottomNav).toBe(true)
})
