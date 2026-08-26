import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { authService } from '@/services/auth.service'
import { decodeJwtPayload, isJwtExpired } from '@/services/jwt'
import { tokenStorage } from '@/services/token-storage'

import type { JwtPayload, LoginCredentials, UserResponse } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const jwtPayload = ref<JwtPayload | null>(null)
  const user = ref<UserResponse | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  let initializationPromise: Promise<void> | null = null

  const isAuthenticated = computed(
    () =>
      accessToken.value !== null &&
      jwtPayload.value !== null &&
      user.value !== null &&
      !isJwtExpired(jwtPayload.value),
  )

  const userId = computed(() => user.value?.id ?? jwtPayload.value?.sub ?? null)

  const companyId = computed(() => user.value?.company_id ?? jwtPayload.value?.company_id ?? null)

  function clearSession(): void {
    tokenStorage.clear()
    accessToken.value = null
    jwtPayload.value = null
    user.value = null
  }

  function restoreStoredToken(): boolean {
    const storedToken = tokenStorage.get()

    if (!storedToken) {
      clearSession()
      return false
    }

    try {
      const payload = decodeJwtPayload(storedToken)

      if (isJwtExpired(payload)) {
        clearSession()
        return false
      }

      accessToken.value = storedToken
      jwtPayload.value = payload
      return true
    } catch {
      clearSession()
      return false
    }
  }

  async function initializeSession(): Promise<void> {
    isLoading.value = true

    try {
      if (!restoreStoredToken()) {
        return
      }

      user.value = await authService.getCurrentUser()
    } catch {
      clearSession()
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  async function initialize(): Promise<void> {
    if (isInitialized.value) {
      return
    }

    if (!initializationPromise) {
      initializationPromise = initializeSession()
    }

    try {
      await initializationPromise
    } finally {
      initializationPromise = null
    }
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    isLoading.value = true
    clearSession()

    try {
      const tokenResponse = await authService.login(credentials)
      const payload = decodeJwtPayload(tokenResponse.access_token)

      if (tokenResponse.token_type.toLowerCase() !== 'bearer' || isJwtExpired(payload)) {
        throw new Error('El servidor entregó una sesión inválida')
      }

      tokenStorage.set(tokenResponse.access_token)
      accessToken.value = tokenResponse.access_token
      jwtPayload.value = payload
      user.value = await authService.getCurrentUser()
      isInitialized.value = true
    } catch (error) {
      clearSession()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function logout(): void {
    clearSession()
    isInitialized.value = true
  }

  return {
    accessToken,
    user,
    isLoading,
    isInitialized,
    isAuthenticated,
    userId,
    companyId,
    initialize,
    login,
    logout,
  }
})
