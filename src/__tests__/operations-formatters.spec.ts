import { describe, expect, it } from 'vitest'

import { formatOperationValue, readOperationValue } from '@/utils/operations-formatters'

describe('operations formatters', () => {
  it('reads nested values', () => {
    expect(readOperationValue({ totals: { amount: '25000.00' } }, 'totals.amount')).toBe('25000.00')
  })

  it('formats money and boolean values for Colombia', () => {
    expect(
      formatOperationValue('25000', { key: 'amount', label: 'Valor', format: 'money' }),
    ).toContain('25.000')
    expect(formatOperationValue(false, { key: 'active', label: 'Estado', format: 'boolean' })).toBe(
      'Inactivo',
    )
  })

  it('counts collection values', () => {
    expect(
      formatOperationValue([{}, {}], { key: 'details', label: 'Detalles', format: 'count' }),
    ).toBe('2 registros')
  })
})
