import { beforeEach, describe, expect, it, vi } from 'vitest'

import { interpolateOperationPath, operationsService } from '@/services/operations.service'

const httpMocks = vi.hoisted(() => ({
  get: vi.fn<(...args: unknown[]) => Promise<{ data: unknown }>>(),
  request: vi.fn<(...args: unknown[]) => Promise<{ data: unknown }>>(),
}))

vi.mock('@/services/http', () => ({
  http: httpMocks,
}))

describe('operations service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('normalizes paginated list responses', async () => {
    httpMocks.get.mockResolvedValue({
      data: { total: 1, items: [{ id: 'customer-1', first_name: 'Luis' }] },
    })

    const result = await operationsService.list('/customers', { limit: 100 })

    expect(result.total).toBe(1)
    expect(result.items[0]?.first_name).toBe('Luis')
    expect(httpMocks.get).toHaveBeenCalledWith('/customers', {
      params: { limit: 100 },
    })
  })

  it('normalizes plain arrays returned by catalog endpoints', async () => {
    httpMocks.get.mockResolvedValue({ data: [{ id: 'service-1', name: 'Corte' }] })

    const result = await operationsService.list('/services/company/company-1')

    expect(result.total).toBe(1)
    expect(result.items[0]?.name).toBe('Corte')
  })

  it('interpolates route values and rejects missing parameters', () => {
    expect(interpolateOperationPath('/sales/{id}/cancel', { id: 'sale 1' })).toBe(
      '/sales/sale%201/cancel',
    )
    expect(() => interpolateOperationPath('/companies/{company_id}', {})).toThrow(/company_id/)
  })
})
