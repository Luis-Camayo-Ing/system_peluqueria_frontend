import type { AxiosRequestConfig } from 'axios'

import { http } from '@/services/http'
import type { ApiRecord, ResourceResult } from '@/types/operations'

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asItems(payload: unknown): ResourceResult {
  if (Array.isArray(payload)) {
    return { total: payload.length, items: payload.filter(isRecord) }
  }

  if (isRecord(payload)) {
    const items = payload.items

    if (Array.isArray(items)) {
      const records = items.filter(isRecord)
      return {
        total: typeof payload.total === 'number' ? payload.total : records.length,
        items: records,
      }
    }

    return { total: 1, items: [payload] }
  }

  return { total: 0, items: [] }
}

export function interpolateOperationPath(
  template: string,
  values: Record<string, unknown>,
): string {
  return template.replace(/\{([^}]+)\}/g, (_match, key: string) => {
    const value = values[key]

    if (value === undefined || value === null || value === '') {
      throw new Error(`Falta el valor requerido para la ruta: ${key}`)
    }

    return encodeURIComponent(String(value))
  })
}

export const operationsService = {
  async list(path: string, params: Record<string, unknown> = {}): Promise<ResourceResult> {
    const response = await http.get<unknown>(path, { params })
    return asItems(response.data)
  },

  async request(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    path: string,
    data?: Record<string, unknown>,
    config: AxiosRequestConfig = {},
  ): Promise<unknown> {
    const response = await http.request<unknown>({ method, url: path, data, ...config })
    return response.data
  },

  async download(path: string): Promise<Blob> {
    const response = await http.get<Blob>(path, { responseType: 'blob' })
    return response.data
  },

  async report(path: string, params: Record<string, unknown>): Promise<ApiRecord> {
    const response = await http.get<unknown>(path, { params })

    if (!isRecord(response.data)) {
      throw new Error('El reporte no devolvió un objeto válido.')
    }

    return response.data
  },
}
