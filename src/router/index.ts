import { createRouter, createWebHashHistory } from 'vue-router'

export default createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  scrollBehavior: (to) => (to.path.startsWith('/records/') ? false : { top: 0 }),
  routes: [
    { path: '/', redirect: '/dashboard' },
    {
      path: '/dashboard',
      component: () => import('@/views/dashboard/DashboardView.vue'),
    },
    {
      path: '/records/:type(recharge|withdraw|deposit|sales)',
      component: () => import('@/views/records/RecordsView.vue'),
    },
    {
      path: '/detail/:type(recharge|withdraw|deposit|sales)/:id',
      component: () => import('@/views/details/RecordDetailView.vue'),
      meta: { hideBottomNav: true },
    },
    {
      path: '/profile',
      component: () => import('@/views/profile/ProfileView.vue'),
    },
  ],
})
