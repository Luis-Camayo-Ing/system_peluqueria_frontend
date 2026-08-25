import { z } from 'zod'

const environmentSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .trim()
    .min(1, 'VITE_API_BASE_URL es obligatoria')
    .regex(/^(\/|https?:\/\/)/, 'VITE_API_BASE_URL debe ser una ruta relativa o una URL HTTP')
    .default('/api/v1'),

  VITE_API_TIMEOUT_MS: z.coerce.number().int().positive().max(60_000).default(15_000),
})

const environment = environmentSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_API_TIMEOUT_MS: import.meta.env.VITE_API_TIMEOUT_MS,
})

export const env = {
  apiBaseUrl: environment.VITE_API_BASE_URL.replace(/\/+$/, ''),
  apiTimeoutMs: environment.VITE_API_TIMEOUT_MS,
} as const
