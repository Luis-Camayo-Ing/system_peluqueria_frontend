import { describe, expect, it } from 'vitest'

import {
  appointmentStatusLabels,
  calculateAppointmentEndTime,
  formatPersonName,
  toColombiaIso,
  validateTimeRange,
} from '@/utils/appointment-formatters'

describe('appointment formatters', () => {
  it('translates lifecycle statuses into Spanish', () => {
    expect(appointmentStatusLabels.in_progress).toBe('En atención')
    expect(appointmentStatusLabels.no_show).toBe('No asistió')
  })

  it('normalizes person names and Colombia timestamps', () => {
    expect(formatPersonName('  Laura ', ' Gómez ')).toBe('Laura Gómez')
    expect(toColombiaIso('2026-08-25', '09:30')).toBe('2026-08-25T09:30:00-05:00')
  })

  it('validates that an appointment ends after it starts', () => {
    expect(validateTimeRange('2026-08-25T09:00:00-05:00', '2026-08-25T10:00:00-05:00')).toBe(true)
    expect(validateTimeRange('2026-08-25T10:00:00-05:00', '2026-08-25T09:00:00-05:00')).toBe(false)
  })

  it('calculates the final time from the configured service duration', () => {
    expect(calculateAppointmentEndTime('09:00', 45)).toBe('09:45')
    expect(calculateAppointmentEndTime('14:30', 60)).toBe('15:30')
    expect(calculateAppointmentEndTime('23:30', 45)).toBe('')
  })
})
