import { createPinia, setActivePinia } from 'pinia'
import { mount, flushPromises } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LoginCredentials, TokenResponse, UserResponse } from '@/types/auth'
import LoginView from '@/views/auth/LoginView.vue'
import vuetify from '@/plugins/vuetify'
import { tokenStorage } from '@/services/token-storage'

const authServiceMocks = vi.hoisted(() => ({
  login: vi.fn<(credentials: LoginCredentials) => Promise<TokenResponse>>(),
  getCurrentUser: vi.fn<() => Promise<UserResponse>>(),
}))

vi.mock('@/services/auth.service', () => ({
  authService: authServiceMocks,
}))

function createToken(): string {
  const now = Math.floor(Date.now() / 1000)
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({
    sub: '5cc5898d-a2fe-4af3-a5c1-1afa5144883e',
    company_id: 'bf7bd432-0c31-4350-95f2-cce62dda4884',
    iat: now,
    exp: now + 1800,
  })}.signature`
}

beforeEach(() => {
  tokenStorage.clear()
  authServiceMocks.login.mockReset()
  authServiceMocks.getCurrentUser.mockReset()
})

describe('LoginView', () => {
  it('authenticates and redirects to the dashboard', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', component: LoginView },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
      ],
    })

    await router.push('/login')
    await router.isReady()

    authServiceMocks.login.mockResolvedValue({
      access_token: createToken(),
      token_type: 'bearer',
    })
    authServiceMocks.getCurrentUser.mockResolvedValue({
      id: '5cc5898d-a2fe-4af3-a5c1-1afa5144883e',
      company_id: 'bf7bd432-0c31-4350-95f2-cce62dda4884',
      email: 'admin@peluqueria.com',
      is_active: true,
      is_verified: false,
      last_login: null,
      created_at: '2026-08-25T00:00:00Z',
      updated_at: '2026-08-25T00:00:00Z',
    })

    const wrapper = mount(LoginView, {
      global: {
        plugins: [pinia, router, vuetify],
      },
    })

    await wrapper.get('input[type="email"]').setValue('admin@peluqueria.com')
    await wrapper.get('input[type="password"]').setValue('password123')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(authServiceMocks.login).toHaveBeenCalledWith({
      email: 'admin@peluqueria.com',
      password: 'password123',
    })
    expect(router.currentRoute.value.path).toBe('/dashboard')
    expect(tokenStorage.get()).toBeTruthy()
  })
})
