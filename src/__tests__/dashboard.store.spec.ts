import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { dashboardFixture } from '@/__tests__/dashboard.fixtures'
import { useDashboardStore } from '@/stores/dashboard'
import type { DashboardQuery, DashboardResponse } from '@/types/dashboard'

const dashboardServiceMocks = vi.hoisted(() => ({
  getDashboard: vi.fn<(query: DashboardQuery) => Promise<DashboardResponse>>(),
}))

vi.mock('@/services/dashboard.service', () => ({
  dashboardService: dashboardServiceMocks,
}))

describe('useDashboardStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    dashboardServiceMocks.getDashboard.mockReset()
  })

  it('loads data using the selected filters', async () => {
    dashboardServiceMocks.getDashboard.mockResolvedValue(dashboardFixture)
    const store = useDashboardStore()

    store.setFilters({
      startDate: '2026-08-01',
      endDate: '2026-08-24',
      timezone: 'America/Bogota',
      topLimit: 10,
    })

    await store.loadDashboard()

    expect(dashboardServiceMocks.getDashboard).toHaveBeenCalledWith({
      start_date: '2026-08-01',
      end_date: '2026-08-24',
      timezone: 'America/Bogota',
      top_limit: 10,
    })
    expect(store.dashboard?.kpis.appointments_count).toBe(4)
    expect(store.errorMessage).toBeNull()
  })

  it('rejects an inverted date range without calling the API', async () => {
    const store = useDashboardStore()

    store.setFilters({
      startDate: '2026-08-24',
      endDate: '2026-08-01',
      timezone: 'America/Bogota',
      topLimit: 5,
    })

    await store.loadDashboard()

    expect(dashboardServiceMocks.getDashboard).not.toHaveBeenCalled()
    expect(store.errorMessage).toContain('fecha inicial')
  })
})
