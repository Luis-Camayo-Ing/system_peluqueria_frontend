import { describe, expect, it } from 'vitest'

import { getOperationModule, operationModules } from '@/config/operations'

describe('unified sprint operations configuration', () => {
  it('registers the six operational workspaces that complement reports', () => {
    expect(operationModules.map((module) => module.key)).toEqual([
      'customers-services',
      'sales-pos',
      'inventory',
      'cash-register',
      'purchases',
      'administration',
    ])
  })

  it('maps critical workflows to real backend endpoints', () => {
    const sales = getOperationModule('sales-pos')?.resources[0]
    const cash = getOperationModule('cash-register')
    const purchases = getOperationModule('purchases')

    expect(sales?.createPath).toBe('/sales')
    expect(sales?.actions?.some((action) => action.path.endsWith('/receipt.pdf'))).toBe(true)
    expect(
      cash?.resources.some((resource) => resource.createPath === '/cash-register/sessions/open'),
    ).toBe(true)
    expect(
      purchases?.resources.some((resource) => resource.createPath?.includes('/receipts')),
    ).toBe(true)
  })

  it('maps RBAC assignment actions after the backend router is enabled', () => {
    const administration = getOperationModule('administration')
    const roles = administration?.resources.find((resource) => resource.key === 'roles')
    const users = administration?.resources.find((resource) => resource.key === 'users')

    expect(roles?.protectedFlagKey).toBe('is_system_role')
    expect(roles?.actions?.some((action) => action.itemIdPayloadKey === 'role_id')).toBe(true)
    expect(users?.actions?.some((action) => action.itemIdPayloadKey === 'user_id')).toBe(true)
  })
})
