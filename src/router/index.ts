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
        title: 'Iniciar sesión',
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
          meta: { title: 'Dashboard' },
        },
        {
          path: 'appointments',
          name: 'appointments',
          component: () => import('@/views/appointments/AppointmentsView.vue'),
          meta: { title: 'Agenda y citas' },
        },
        {
          path: 'customers-services',
          name: 'customers-services',
          component: () => import('@/views/operations/OperationsView.vue'),
          meta: { operationsModule: 'customers-services', title: 'Clientes y servicios' },
        },
        {
          path: 'sales',
          name: 'sales-pos',
          component: () => import('@/views/operations/OperationsView.vue'),
          meta: { operationsModule: 'sales-pos', title: 'Ventas y POS' },
        },
        {
          path: 'inventory',
          name: 'inventory',
          component: () => import('@/views/operations/OperationsView.vue'),
          meta: { operationsModule: 'inventory', title: 'Inventario' },
        },
        {
          path: 'cash-register',
          name: 'cash-register',
          component: () => import('@/views/operations/OperationsView.vue'),
          meta: { operationsModule: 'cash-register', title: 'Caja' },
        },
        {
          path: 'purchases',
          name: 'purchases',
          component: () => import('@/views/operations/OperationsView.vue'),
          meta: { operationsModule: 'purchases', title: 'Compras' },
        },
        {
          path: 'administration',
          name: 'administration',
          component: () => import('@/views/operations/OperationsView.vue'),
          meta: { operationsModule: 'administration', title: 'Administración' },
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('@/views/reports/ReportsView.vue'),
          meta: { title: 'Reportes' },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/errors/NotFoundView.vue'),
      meta: { title: 'Página no encontrada' },
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

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : 'ERP Beauty Pro'
  document.title = title === 'ERP Beauty Pro' ? title : `${title} | ERP Beauty Pro`
})

export default router
