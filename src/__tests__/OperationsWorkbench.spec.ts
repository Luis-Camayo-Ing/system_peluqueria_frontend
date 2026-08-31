import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'

import OperationsWorkbench from '@/components/operations/OperationsWorkbench.vue'
import { getOperationModule } from '@/config/operations'
import vuetify from '@/plugins/vuetify'
import { useAuthStore } from '@/stores/auth'
import type { ModuleDefinition } from '@/types/operations'

const operationsServiceMocks = vi.hoisted(() => ({
  list: vi.fn<
    (...args: unknown[]) => Promise<{ total: number; items: Record<string, unknown>[] }>
  >(),
  request: vi.fn<(...args: unknown[]) => Promise<unknown>>(),
  download: vi.fn<(...args: unknown[]) => Promise<Blob>>(),
  report: vi.fn<(...args: unknown[]) => Promise<Record<string, unknown>>>(),
}))

vi.mock('@/services/operations.service', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/services/operations.service')>()
  return {
    ...original,
    operationsService: operationsServiceMocks,
  }
})

describe('OperationsWorkbench', () => {
  it('renders a unified operational module and loads its first resource', async () => {
    operationsServiceMocks.list.mockResolvedValue({ total: 0, items: [] })
    const pinia = createPinia()
    setActivePinia(pinia)
    const authStore = useAuthStore()
    authStore.user = {
      id: 'user-1',
      company_id: 'company-1',
      email: 'admin@beauty.test',
      is_active: true,
      is_verified: true,
      last_login: null,
      created_at: '2026-08-26T12:00:00Z',
      updated_at: '2026-08-26T12:00:00Z',
    }

    const module = getOperationModule('customers-services')
    expect(module).toBeDefined()

    const wrapper = mount(OperationsWorkbench, {
      props: { module: module! },
      global: { plugins: [pinia, vuetify] },
    })

    await flushPromises()

    expect(wrapper.get('h1').text()).toBe('Clientes y servicios')
    expect(wrapper.text()).toContain('Clientes')
    expect(operationsServiceMocks.list).toHaveBeenCalledWith('/customers', {
      skip: 0,
      limit: 100,
    })
  })

  it('hides mutations for a protected system role', async () => {
    operationsServiceMocks.list.mockResolvedValue({
      total: 1,
      items: [{ id: 'role-1', name: 'Administrator', is_system_role: true }],
    })
    const pinia = createPinia()
    setActivePinia(pinia)
    useAuthStore().user = {
      id: 'user-1',
      company_id: 'company-1',
      email: 'admin@beauty.test',
      is_active: true,
      is_verified: true,
      last_login: null,
      created_at: '2026-08-26T12:00:00Z',
      updated_at: '2026-08-26T12:00:00Z',
    }

    const module: ModuleDefinition = {
      key: 'security-test',
      title: 'Seguridad',
      subtitle: 'Roles protegidos',
      icon: 'mdi-shield',
      sprint: 'Sprint 30',
      resources: [
        {
          key: 'roles',
          title: 'Roles',
          singular: 'rol',
          icon: 'mdi-shield',
          description: 'Roles',
          listPath: '/roles/company/{company_id}',
          updatePath: '/roles/{id}',
          deletePath: '/roles/{id}',
          protectedFlagKey: 'is_system_role',
          columns: [{ key: 'name', label: 'Rol' }],
          fields: [],
          actions: [
            {
              key: 'assign',
              label: 'Asignar permiso',
              icon: 'mdi-shield-key',
              method: 'post',
              path: '/roles/assign-permission',
            },
          ],
        },
      ],
    }

    const wrapper = mount(OperationsWorkbench, {
      props: { module },
      global: { plugins: [pinia, vuetify] },
    })
    await flushPromises()

    expect(wrapper.find('[aria-label^="Editar Administrator"]').exists()).toBe(false)
    expect(wrapper.find('[aria-label^="Asignar permiso Administrator"]').exists()).toBe(false)
    expect(wrapper.find('[aria-label^="Eliminar Administrator"]').exists()).toBe(false)
  })
})
