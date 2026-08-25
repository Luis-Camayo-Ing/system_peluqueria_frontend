export interface LoginCredentials {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface JwtPayload {
  sub: string
  company_id: string
  iat: number
  exp: number
}

export interface UserResponse {
  id: string
  company_id: string
  email: string
  is_active: boolean
  is_verified: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}
