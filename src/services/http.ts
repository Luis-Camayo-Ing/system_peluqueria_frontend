import axios from 'axios'

import { env } from '@/config/env'
import { tokenStorage } from '@/services/token-storage'

export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized'

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: {
    Accept: 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const accessToken = tokenStorage.get()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      tokenStorage.clear()

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT))
      }
    }

    return Promise.reject(error)
  },
)
