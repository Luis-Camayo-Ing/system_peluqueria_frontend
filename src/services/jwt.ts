import { z } from 'zod'

import type { JwtPayload } from '@/types/auth'

const jwtPayloadSchema = z.object({
  sub: z.string().uuid(),
  company_id: z.string().uuid(),
  iat: z.number().int(),
  exp: z.number().int(),
})

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

  const binary = atob(paddedBase64)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))

  return new TextDecoder().decode(bytes)
}

export function decodeJwtPayload(token: string): JwtPayload {
  const segments = token.split('.')

  if (segments.length !== 3 || !segments[1]) {
    throw new Error('El token recibido no tiene un formato JWT válido')
  }

  const payload: unknown = JSON.parse(decodeBase64Url(segments[1]))

  return jwtPayloadSchema.parse(payload)
}

export function isJwtExpired(payload: JwtPayload, toleranceSeconds = 30): boolean {
  const currentTimestamp = Math.floor(Date.now() / 1000)

  return payload.exp <= currentTimestamp + toleranceSeconds
}
