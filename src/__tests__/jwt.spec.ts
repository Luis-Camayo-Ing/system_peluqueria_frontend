import { afterEach, describe, expect, it, vi } from 'vitest'

import { decodeJwtPayload, isJwtExpired } from '@/services/jwt'

function createToken(payload: object): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`
}

afterEach(() => {
  vi.useRealTimers()
})

describe('JWT utilities', () => {
  it('decodes the identifiers and timestamps', () => {
    const payload = {
      sub: '5cc5898d-a2fe-4af3-a5c1-1afa5144883e',
      company_id: 'bf7bd432-0c31-4350-95f2-cce62dda4884',
      iat: 1_787_610_920,
      exp: 1_787_612_720,
    }

    expect(decodeJwtPayload(createToken(payload))).toEqual(payload)
  })

  it('detects an expired token', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-25T00:00:00Z'))

    expect(
      isJwtExpired({
        sub: '5cc5898d-a2fe-4af3-a5c1-1afa5144883e',
        company_id: 'bf7bd432-0c31-4350-95f2-cce62dda4884',
        iat: 1_777_244_300,
        exp: 1_777_244_399,
      }),
    ).toBe(true)
  })
})
