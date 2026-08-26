import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'

import { dashboardFixture } from '@/__tests__/dashboard.fixtures'
import vuetify from '@/plugins/vuetify'
import type { DashboardQuery, DashboardResponse } from '@/types/dashboard'
import DashboardView from '@/views/dashboard/DashboardView.vue'

const dashboardServiceMocks = vi.hoisted(() => ({
  getDashboard: vi.fn<(query: DashboardQuery) => Promise<DashboardResponse>>(),
}))

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: dashboardServiceMocks,
}))

describe('DashboardView', () => {
  it('renders KPIs, charts and highlights returned by the backend', async () => {
    dashboardServiceMocks.getDashboard.mockResolvedValue(dashboardFixture)

    const wrapper = mount(DashboardView, {
      global: {
        plugins: [createPinia(), vuetify],
      },
    })

    await flushPromises()

    expect(wrapper.get('h1').text()).toBe('Panel de control')
    expect(wrapper.get('[data-testid="dashboard-kpis"]').text()).toContain('Ventas netas')
    expect(wrapper.get('[data-testid="dashboard-charts"]').text()).toContain('Estado de las citas')
    expect(wrapper.get('[data-testid="dashboard-highlights"]').text()).toContain(
      'Shampoo profesional',
    )
  })
})
