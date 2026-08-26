import type {
  AppointmentStatus,
  ReminderChannel,
  ReminderStatus,
  ScheduleBlockType,
} from '@/types/appointment'

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Programada',
  confirmed: 'Confirmada',
  in_progress: 'En atención',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistió',
}

export const appointmentStatusColors: Record<AppointmentStatus, string> = {
  scheduled: 'info',
  confirmed: 'secondary',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'error',
  no_show: 'grey-darken-1',
}

export const scheduleBlockLabels: Record<ScheduleBlockType, string> = {
  break: 'Descanso',
  day_off: 'Día libre',
  vacation: 'Vacaciones',
  permission: 'Permiso',
  other: 'Otro',
}

export const reminderChannelLabels: Record<ReminderChannel, string> = {
  internal: 'Interno',
  email: 'Correo electrónico',
  whatsapp: 'WhatsApp',
}

export const reminderStatusLabels: Record<ReminderStatus, string> = {
  pending: 'Pendiente',
  sent: 'Enviado',
  failed: 'Fallido',
  cancelled: 'Cancelado',
}

export const weekdayLabels = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const

export function formatPersonName(firstName?: string | null, lastName?: string | null): string {
  return `${firstName?.trim() ?? ''} ${lastName?.trim() ?? ''}`.trim()
}

export function formatAppointmentDateTime(value: string, timezone = 'America/Bogota'): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(new Date(value))
}

export function formatAppointmentTime(value: string, timezone = 'America/Bogota'): string {
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  }).format(new Date(value))
}

export function getAppointmentDateKey(value: string, timezone = 'America/Bogota'): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timezone,
  }).formatToParts(new Date(value))

  const year = parts.find((part) => part.type === 'year')?.value ?? ''
  const month = parts.find((part) => part.type === 'month')?.value ?? ''
  const day = parts.find((part) => part.type === 'day')?.value ?? ''

  return `${year}-${month}-${day}`
}

export function formatCalendarDate(value: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date(`${value}T12:00:00-05:00`))
}

export function toColombiaIso(date: string, time: string): string {
  const normalizedTime = time.length === 5 ? `${time}:00` : time

  return `${date}T${normalizedTime}-05:00`
}

export function calculateAppointmentEndTime(startTime: string, durationMinutes: number): string {
  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(startTime)

  if (!match || !Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    return ''
  }

  const hours = Number(match[1])
  const minutes = Number(match[2])

  if (hours > 23 || minutes > 59) {
    return ''
  }

  const endMinutes = hours * 60 + minutes + durationMinutes

  if (endMinutes >= 24 * 60) {
    return ''
  }

  return `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(
    endMinutes % 60,
  ).padStart(2, '0')}`
}

export function toDateInput(value: string, timezone = 'America/Bogota'): string {
  return getAppointmentDateKey(value, timezone)
}

export function toTimeInput(value: string, timezone = 'America/Bogota'): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone,
  }).formatToParts(new Date(value))

  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00'
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00'

  return `${hour}:${minute}`
}

export function validateTimeRange(startAt: string, endAt: string): boolean {
  return new Date(endAt).getTime() > new Date(startAt).getTime()
}
