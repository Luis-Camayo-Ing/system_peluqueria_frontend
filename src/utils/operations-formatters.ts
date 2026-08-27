import type { ColumnDefinition } from '@/types/operations'

export function readOperationValue(record: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
    return (value as Record<string, unknown>)[key]
  }, record)
}

export function formatOperationValue(value: unknown, column: ColumnDefinition): string {
  if (value === null || value === undefined || value === '') return 'Sin dato'

  switch (column.format) {
    case 'money': {
      const number = Number(value)
      if (!Number.isFinite(number)) return String(value)
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(number)
    }
    case 'boolean':
      return value ? 'Activo' : 'Inactivo'
    case 'date':
      return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(
        new Date(String(value)),
      )
    case 'datetime':
      return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Bogota',
      }).format(new Date(String(value)))
    case 'count':
      return Array.isArray(value)
        ? `${value.length} registro${value.length === 1 ? '' : 's'}`
        : String(value)
    case 'status':
      return String(value).replace(/_/g, ' ')
    default:
      if (typeof value === 'object') return JSON.stringify(value)
      return String(value)
  }
}
