import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  appointmentFixture,
  appointmentId,
  availabilityFixture,
  companyId,
  customerFixture,
  employeeFixture,
  historyFixture,
  reminderFixture,
  scheduleBlockFixture,
  serviceFixture,
  workScheduleFixture,
} from '@/__tests__/appointment.fixtures'
import { useAppointmentStore } from '@/stores/appointment'

const appointmentServiceMocks = vi.hoisted(() => ({
  list: vi.fn<(...args: never[]) => Promise<unknown>>(),
  get: vi.fn<(...args: never[]) => Promise<unknown>>(),
  create: vi.fn<(...args: never[]) => Promise<unknown>>(),
  update: vi.fn<(...args: never[]) => Promise<unknown>>(),
  reschedule: vi.fn<(...args: never[]) => Promise<unknown>>(),
  cancel: vi.fn<(...args: never[]) => Promise<unknown>>(),
  getAvailability: vi.fn<(...args: never[]) => Promise<unknown>>(),
  listWorkSchedules: vi.fn<(...args: never[]) => Promise<unknown>>(),
  createWorkSchedule: vi.fn<(...args: never[]) => Promise<unknown>>(),
  updateWorkSchedule: vi.fn<(...args: never[]) => Promise<unknown>>(),
  listScheduleBlocks: vi.fn<(...args: never[]) => Promise<unknown>>(),
  createScheduleBlock: vi.fn<(...args: never[]) => Promise<unknown>>(),
  updateScheduleBlock: vi.fn<(...args: never[]) => Promise<unknown>>(),
  listReminders: vi.fn<(...args: never[]) => Promise<unknown>>(),
  createReminder: vi.fn<(...args: never[]) => Promise<unknown>>(),
  updateReminder: vi.fn<(...args: never[]) => Promise<unknown>>(),
  listHistory: vi.fn<(...args: never[]) => Promise<unknown>>(),
  listCustomers: vi.fn<(...args: never[]) => Promise<unknown>>(),
  listEmployees: vi.fn<(...args: never[]) => Promise<unknown>>(),
  listServices: vi.fn<(...args: never[]) => Promise<unknown>>(),
}))

vi.mock('@/services/appointment.service', () => ({
  appointmentService: appointmentServiceMocks,
}))

describe('appointment store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    appointmentServiceMocks.list.mockResolvedValue({
      total: 1,
      items: [appointmentFixture],
    })
    appointmentServiceMocks.listCustomers.mockResolvedValue([customerFixture])
    appointmentServiceMocks.listEmployees.mockResolvedValue([employeeFixture])
    appointmentServiceMocks.listServices.mockResolvedValue([serviceFixture])
    appointmentServiceMocks.listWorkSchedules.mockResolvedValue([workScheduleFixture])
    appointmentServiceMocks.listScheduleBlocks.mockResolvedValue([scheduleBlockFixture])
    appointmentServiceMocks.listReminders.mockResolvedValue([reminderFixture])
    appointmentServiceMocks.listHistory.mockResolvedValue([historyFixture])
  })

  it('loads appointments and operational catalogs together', async () => {
    const store = useAppointmentStore()

    await store.loadWorkspace(companyId)

    expect(store.appointments).toEqual([appointmentFixture])
    expect(store.customers).toEqual([customerFixture])
    expect(store.workSchedules).toEqual([workScheduleFixture])
    expect(store.errorMessage).toBeNull()
  })

  it('refreshes the list after creating an appointment', async () => {
    const store = useAppointmentStore()
    appointmentServiceMocks.create.mockResolvedValue(appointmentFixture)

    const created = await store.createAppointment({
      customer_id: appointmentFixture.customer_id,
      employee_id: appointmentFixture.employee_id,
      service_id: appointmentFixture.service_id,
      start_at: appointmentFixture.start_at,
      end_at: appointmentFixture.end_at,
      notes: appointmentFixture.notes,
    })

    expect(created).toBe(true)
    expect(store.selectedAppointment?.id).toBe(appointmentId)
    expect(appointmentServiceMocks.list).toHaveBeenCalledOnce()
  })

  it('stores the available slots returned by the backend', async () => {
    const store = useAppointmentStore()
    appointmentServiceMocks.getAvailability.mockResolvedValue(availabilityFixture)

    await store.checkAvailability(
      availabilityFixture.employee_id,
      availabilityFixture.service_id,
      availabilityFixture.target_date,
    )

    expect(store.availabilitySlots).toEqual(availabilityFixture.slots)
    expect(store.isCheckingAvailability).toBe(false)
  })
})
