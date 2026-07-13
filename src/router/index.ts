import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'main',
      // Lazy-loaded — replace with direct import once MainView.vue exists
      component: () => import('@/views/MainView.vue'),
    },
    {
      path: '/relic-set',
      name: 'relic-set',
      // Lazy-loaded — replace with direct import once RelicSetView.vue exists
      component: () => import('@/views/RelicSetView.vue'),
    },
  ],
})

export default router
