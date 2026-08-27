import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'

import vuetify from '@/plugins/vuetify'
import ReportsView from '@/views/reports/ReportsView.vue'

const operationsServiceMocks = vi.hoisted(() => ({
  report: vi.fn<(...args: unknown[]) => Promise<Record<string, unknown>>>(),
}))

vi.mock('@/services/operations.service', () => ({
  operationsService: operationsServiceMocks,
}))

describe('ReportsView', () => {
  it('loads and renders the sales report', async () => {
    operationsServiceMocks.report.mockResolvedValue({
      totals: { total_sales: 3, net_revenue: '125000.00' },
      daily_sales: [{ date: '2026-08-26', total: '125000.00' }],
    })

    const wrapper = mount(ReportsView, {
      global: { plugins: [createPinia(), vuetify] },
    })

    await flushPromises()

    expect(wrapper.get('h1').text()).toBe('Reportes')
    expect(wrapper.text()).toContain('Total Sales')
    expect(wrapper.text()).toContain('125.000')
    expect(operationsServiceMocks.report).toHaveBeenCalledWith(
      '/reports/sales',
      expect.objectContaining({ timezone: 'America/Bogota' }),
    )
  })
})
