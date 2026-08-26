import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  appointmentFixture,
  appointmentId,
  availabilityFixture,
} from '@/__tests__/appointment.fixtures'
import { appointmentService } from '@/services/appointment.service'

const httpMocks = vi.hoisted(() => ({
  get: vi.fn<(...args: unknown[]) => Promise<{ data: unknown }>>(),
  post: vi.fn<(...args: unknown[]) => Promise<{ data: unknown }>>(),
  patch: vi.fn<(...args: unknown[]) => Promise<{ data: unknown }>>(),
}))

vi.mock('@/services/http', () => ({
  http: httpMocks,
}))

describe('appointment service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists appointments with the selected filters', async () => {
    httpMocks.get.mockResolvedValue({
      data: { total: 1, items: [appointmentFixture] },
    })

    const result = await appointmentService.list({
      start_at: '2026-08-01T00:00:00-05:00',
      end_at: '2026-08-31T23:59:59-05:00',
      status: 'confirmed',
    })

    expect(result.total).toBe(1)
    expect(result.items[0]?.id).toBe(appointmentId)
    expect(httpMocks.get).toHaveBeenCalledWith('/appointments', {
      params: expect.objectContaining({ status: 'confirmed' }),
    })
  })

  it('uses the availability endpoint and validates its response', async () => {
    httpMocks.post.mockResolvedValue({ data: availabilityFixture })

    const result = await appointmentService.getAvailability({
      employee_id: availabilityFixture.employee_id,
      service_id: availabilityFixture.service_id,
      target_date: availabilityFixture.target_date,
    })

    expect(result.slots).toHaveLength(1)
    expect(httpMocks.post).toHaveBeenCalledWith(
      '/appointments/availability',
      expect.objectContaining({ target_date: '2026-08-25' }),
    )
  })

  it('rejects malformed backend payloads', async () => {
    httpMocks.get.mockResolvedValue({ data: { total: -1, items: [] } })

    await expect(appointmentService.list({})).rejects.toThrow(/too small/i)
  })
})
