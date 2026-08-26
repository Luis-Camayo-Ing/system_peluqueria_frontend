import type { AppointmentStatus } from '@/types/dashboard'

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 3,
})

const integerFormatter = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Programadas',
  confirmed: 'Confirmadas',
  in_progress: 'En proceso',
  completed: 'Completadas',
  cancelled: 'Canceladas',
  no_show: 'No asistió',
}

const movementLabels: Record<string, string> = {
  entry: 'Entradas',
  exit: 'Salidas',
  adjustment_in: 'Ajustes de entrada',
  adjustment_out: 'Ajustes de salida',
  return_in: 'Devoluciones recibidas',
  return_out: 'Devoluciones entregadas',
}

export function decimalToNumber(value: string): number {
  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) ? parsedValue : 0
}

export function formatCurrency(value: string | number): string {
  return currencyFormatter.format(typeof value === 'string' ? decimalToNumber(value) : value)
}

export function formatNumber(value: string | number): string {
  return numberFormatter.format(typeof value === 'string' ? decimalToNumber(value) : value)
}

export function formatInteger(value: number): string {
  return integerFormatter.format(value)
}

export function formatPercentage(value: string | number): string {
  const numericValue = typeof value === 'string' ? decimalToNumber(value) : value

  return `${numberFormatter.format(numericValue)} %`
}

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T12:00:00`))
}

export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value))
}

export function getAppointmentStatusLabel(status: AppointmentStatus): string {
  return appointmentStatusLabels[status]
}

export function getMovementLabel(movementType: string): string {
  return movementLabels[movementType] ?? movementType.replace(/_/g, ' ')
}
