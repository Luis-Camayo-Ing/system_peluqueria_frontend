import { http } from '@/services/http'

import type { LoginCredentials, TokenResponse, UserResponse } from '@/types/auth'

export const authService = {
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const formData = new URLSearchParams()

    formData.set('username', credentials.email.trim().toLowerCase())
    formData.set('password', credentials.password)

    const response = await http.post<TokenResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    return response.data
  },

  async getCurrentUser(): Promise<UserResponse> {
    const response = await http.get<UserResponse>('/users/me')

    return response.data
  },
}
