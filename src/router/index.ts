import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/cashier',
    },
    {
      path: '/cashier',
      name: 'cashier',
      component: () => import('../views/cashier/index.vue'),
    },
    {
      path: '/mobile-pay/:orderNo',
      name: 'mobile-pay',
      component: () => import('../views/mobile-pay/index.vue'),
      props: true,
    },
    {
      path: '/pay-result/:orderNo',
      name: 'pay-result',
      component: () => import('../views/pay-result/index.vue'),
      props: true,
    },
  ],
})

export default router
