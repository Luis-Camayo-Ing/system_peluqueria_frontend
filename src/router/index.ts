import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '',
          redirect: { name: 'dashboard' },
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
        },
        {
          path: 'appointments',
          name: 'appointments',
          component: () => import('@/views/appointments/AppointmentsView.vue'),
        },
        {
          path: 'customers-services',
          name: 'customers-services',
          component: () => import('@/views/operations/OperationsView.vue'),
          meta: { operationsModule: 'customers-services' },
        },
        {
          path: 'sales',
          name: 'sales-pos',
          component: () => import('@/views/operations/OperationsView.vue'),
          meta: { operationsModule: 'sales-pos' },
        },
        {
          path: 'inventory',
          name: 'inventory',
          component: () => import('@/views/operations/OperationsView.vue'),
          meta: { operationsModule: 'inventory' },
        },
        {
          path: 'cash-register',
          name: 'cash-register',
          component: () => import('@/views/operations/OperationsView.vue'),
          meta: { operationsModule: 'cash-register' },
        },
        {
          path: 'purchases',
          name: 'purchases',
          component: () => import('@/views/operations/OperationsView.vue'),
          meta: { operationsModule: 'purchases' },
        },
        {
          path: 'administration',
          name: 'administration',
          component: () => import('@/views/operations/OperationsView.vue'),
          meta: { operationsModule: 'administration' },
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('@/views/reports/ReportsView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/errors/NotFoundView.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  await authStore.initialize()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
