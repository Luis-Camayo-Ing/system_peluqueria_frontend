import { beforeEach, describe, expect, it, vi } from 'vitest'

import { dashboardFixture } from '@/__tests__/dashboard.fixtures'
import { dashboardService } from '@/services/dashboard.service'
import type { DashboardQuery } from '@/types/dashboard'

const httpMocks = vi.hoisted(() => ({
  get: vi.fn<(url: string, config: { params: DashboardQuery }) => Promise<{ data: unknown }>>(),
}))

vi.mock('@/services/http', () => ({
  http: { get: httpMocks.get },
}))

describe('dashboardService', () => {
  beforeEach(() => {
    httpMocks.get.mockReset()
  })

  it('requests and validates the operational dashboard', async () => {
    const query: DashboardQuery = {
      start_date: '2026-08-01',
      end_date: '2026-08-24',
      timezone: 'America/Bogota',
      top_limit: 5,
    }

    httpMocks.get.mockResolvedValue({ data: dashboardFixture })

    const response = await dashboardService.getDashboard(query)

    expect(httpMocks.get).toHaveBeenCalledWith('/dashboard', { params: query })
    expect(response.kpis.net_sales).toBe('180000.00')
    expect(response.highlights.products).toHaveLength(1)
  })

  it('rejects an invalid payload returned by the API', async () => {
    httpMocks.get.mockResolvedValue({ data: { metadata: null } })

    await expect(
      dashboardService.getDashboard({
        start_date: '2026-08-01',
        end_date: '2026-08-24',
        timezone: 'America/Bogota',
        top_limit: 5,
      }),
    ).rejects.toThrow(/metadata/)
  })
})
