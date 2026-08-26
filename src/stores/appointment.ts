import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { appointmentService } from '@/services/appointment.service'
import type {
  Appointment,
  AppointmentCancelInput,
  AppointmentCreateInput,
  AppointmentFilters,
  AppointmentHistory,
  AppointmentReminder,
  AppointmentReminderCreateInput,
  AppointmentReminderUpdateInput,
  AppointmentRescheduleInput,
  AppointmentUpdateInput,
  AvailabilitySlot,
  CustomerOption,
  EmployeeOption,
  ScheduleBlock,
  ScheduleBlockCreateInput,
  ScheduleBlockUpdateInput,
  ServiceOption,
  WorkSchedule,
  WorkScheduleCreateInput,
  WorkScheduleUpdateInput,
} from '@/types/appointment'
import { getApiErrorMessage } from '@/utils/api-error'

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function createDefaultFilters(): AppointmentFilters {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  return {
    startDate: toIsoDate(firstDay),
    endDate: toIsoDate(lastDay),
    customerId: null,
    employeeId: null,
    serviceId: null,
    status: null,
  }
}

export const useAppointmentStore = defineStore('appointment', () => {
  const appointments = ref<Appointment[]>([])
  const total = ref(0)
  const selectedAppointment = ref<Appointment | null>(null)
  const history = ref<AppointmentHistory[]>([])
  const reminders = ref<AppointmentReminder[]>([])
  const workSchedules = ref<WorkSchedule[]>([])
  const scheduleBlocks = ref<ScheduleBlock[]>([])
  const availabilitySlots = ref<AvailabilitySlot[]>([])
  const customers = ref<CustomerOption[]>([])
  const employees = ref<EmployeeOption[]>([])
  const services = ref<ServiceOption[]>([])
  const filters = ref<AppointmentFilters>(createDefaultFilters())
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isCheckingAvailability = ref(false)
  const errorMessage = ref<string | null>(null)

  const activeCustomers = computed(() => customers.value.filter((customer) => customer.is_active))
  const activeEmployees = computed(() => employees.value.filter((employee) => employee.is_active))
  const activeServices = computed(() => services.value.filter((service) => service.is_active))

  function setFilters(nextFilters: AppointmentFilters): void {
    filters.value = { ...nextFilters }
  }

  function validateFilters(): string | null {
    if (!filters.value.startDate || !filters.value.endDate) {
      return 'Selecciona las fechas inicial y final'
    }

    if (filters.value.startDate > filters.value.endDate) {
      return 'La fecha inicial no puede ser posterior a la fecha final'
    }

    return null
  }

  async function loadCatalogs(companyId: string): Promise<void> {
    const [customerItems, employeeItems, serviceItems] = await Promise.all([
      appointmentService.listCustomers(),
      appointmentService.listEmployees(companyId),
      appointmentService.listServices(companyId),
    ])

    customers.value = customerItems
    employees.value = employeeItems
    services.value = serviceItems
  }

  async function loadAppointments(): Promise<void> {
    const validationMessage = validateFilters()

    if (validationMessage) {
      errorMessage.value = validationMessage
      return
    }

    const response = await appointmentService.list({
      skip: 0,
      limit: 100,
      start_at: `${filters.value.startDate}T00:00:00-05:00`,
      end_at: `${filters.value.endDate}T23:59:59-05:00`,
      customer_id: filters.value.customerId ?? undefined,
      employee_id: filters.value.employeeId ?? undefined,
      service_id: filters.value.serviceId ?? undefined,
      status: filters.value.status ?? undefined,
    })

    appointments.value = response.items
    total.value = response.total
  }

  async function loadOperationalData(): Promise<void> {
    const [schedules, blocks, reminderItems] = await Promise.all([
      appointmentService.listWorkSchedules({ limit: 100 }),
      appointmentService.listScheduleBlocks({ limit: 100 }),
      appointmentService.listReminders({ limit: 100 }),
    ])

    workSchedules.value = schedules
    scheduleBlocks.value = blocks
    reminders.value = reminderItems
  }

  async function loadWorkspace(companyId: string): Promise<void> {
    isLoading.value = true
    errorMessage.value = null

    try {
      await Promise.all([loadCatalogs(companyId), loadAppointments(), loadOperationalData()])
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, 'No fue posible cargar la agenda')
    } finally {
      isLoading.value = false
    }
  }

  async function refreshAppointments(): Promise<void> {
    isLoading.value = true
    errorMessage.value = null

    try {
      await loadAppointments()
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, 'No fue posible actualizar las citas')
    } finally {
      isLoading.value = false
    }
  }

  async function selectAppointment(appointmentId: string): Promise<void> {
    isLoading.value = true
    errorMessage.value = null

    try {
      const [appointment, appointmentHistory, appointmentReminders] = await Promise.all([
        appointmentService.get(appointmentId),
        appointmentService.listHistory(appointmentId),
        appointmentService.listReminders({
          appointment_id: appointmentId,
          limit: 100,
        }),
      ])

      selectedAppointment.value = appointment
      history.value = appointmentHistory
      reminders.value = appointmentReminders
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, 'No fue posible consultar la cita')
    } finally {
      isLoading.value = false
    }
  }

  async function runMutation<T>(
    operation: () => Promise<T>,
    fallbackMessage: string,
  ): Promise<T | null> {
    isSaving.value = true
    errorMessage.value = null

    try {
      return await operation()
    } catch (error: unknown) {
      errorMessage.value = getApiErrorMessage(error, fallbackMessage)
      return null
    } finally {
      isSaving.value = false
    }
  }

  async function createAppointment(data: AppointmentCreateInput): Promise<boolean> {
    const created = await runMutation(
      () => appointmentService.create(data),
      'No fue posible crear la cita',
    )

    if (!created) return false

    await loadAppointments()
    selectedAppointment.value = created
    return true
  }

  async function updateAppointment(
    appointmentId: string,
    data: AppointmentUpdateInput,
  ): Promise<boolean> {
    const updated = await runMutation(
      () => appointmentService.update(appointmentId, data),
      'No fue posible actualizar la cita',
    )

    if (!updated) return false

    await loadAppointments()
    selectedAppointment.value = updated
    return true
  }

  async function rescheduleAppointment(
    appointmentId: string,
    data: AppointmentRescheduleInput,
  ): Promise<boolean> {
    const updated = await runMutation(
      () => appointmentService.reschedule(appointmentId, data),
      'No fue posible reprogramar la cita',
    )

    if (!updated) return false

    await loadAppointments()
    selectedAppointment.value = updated
    history.value = await appointmentService.listHistory(appointmentId)
    return true
  }

  async function cancelAppointment(
    appointmentId: string,
    data: AppointmentCancelInput,
  ): Promise<boolean> {
    const cancelled = await runMutation(
      () => appointmentService.cancel(appointmentId, data),
      'No fue posible cancelar la cita',
    )

    if (!cancelled) return false

    await loadAppointments()
    selectedAppointment.value = cancelled
    history.value = await appointmentService.listHistory(appointmentId)
    return true
  }

  async function checkAvailability(
    employeeId: string,
    serviceId: string,
    targetDate: string,
  ): Promise<void> {
    isCheckingAvailability.value = true
    errorMessage.value = null

    try {
      const response = await appointmentService.getAvailability({
        employee_id: employeeId,
        service_id: serviceId,
        target_date: targetDate,
        timezone: 'America/Bogota',
        slot_interval_minutes: 15,
      })

      availabilitySlots.value = response.slots
    } catch (error: unknown) {
      availabilitySlots.value = []
      errorMessage.value = getApiErrorMessage(error, 'No fue posible consultar la disponibilidad')
    } finally {
      isCheckingAvailability.value = false
    }
  }

  async function createWorkSchedule(data: WorkScheduleCreateInput): Promise<boolean> {
    const created = await runMutation(
      () => appointmentService.createWorkSchedule(data),
      'No fue posible crear el horario',
    )

    if (!created) return false
    workSchedules.value = await appointmentService.listWorkSchedules({
      limit: 100,
    })
    return true
  }

  async function updateWorkSchedule(
    scheduleId: string,
    data: WorkScheduleUpdateInput,
  ): Promise<boolean> {
    const updated = await runMutation(
      () => appointmentService.updateWorkSchedule(scheduleId, data),
      'No fue posible actualizar el horario',
    )

    if (!updated) return false
    workSchedules.value = await appointmentService.listWorkSchedules({
      limit: 100,
    })
    return true
  }

  async function createScheduleBlock(data: ScheduleBlockCreateInput): Promise<boolean> {
    const created = await runMutation(
      () => appointmentService.createScheduleBlock(data),
      'No fue posible crear el bloqueo',
    )

    if (!created) return false
    scheduleBlocks.value = await appointmentService.listScheduleBlocks({
      limit: 100,
    })
    return true
  }

  async function updateScheduleBlock(
    blockId: string,
    data: ScheduleBlockUpdateInput,
  ): Promise<boolean> {
    const updated = await runMutation(
      () => appointmentService.updateScheduleBlock(blockId, data),
      'No fue posible actualizar el bloqueo',
    )

    if (!updated) return false
    scheduleBlocks.value = await appointmentService.listScheduleBlocks({
      limit: 100,
    })
    return true
  }

  async function createReminder(
    appointmentId: string,
    data: AppointmentReminderCreateInput,
  ): Promise<boolean> {
    const created = await runMutation(
      () => appointmentService.createReminder(appointmentId, data),
      'No fue posible crear el recordatorio',
    )

    if (!created) return false
    reminders.value = await appointmentService.listReminders({
      appointment_id: appointmentId,
      limit: 100,
    })
    return true
  }

  async function updateReminder(
    reminderId: string,
    data: AppointmentReminderUpdateInput,
  ): Promise<boolean> {
    const updated = await runMutation(
      () => appointmentService.updateReminder(reminderId, data),
      'No fue posible actualizar el recordatorio',
    )

    if (!updated) return false
    const appointmentId = updated.appointment_id
    reminders.value = await appointmentService.listReminders({
      appointment_id: appointmentId,
      limit: 100,
    })
    return true
  }

  function reset(): void {
    appointments.value = []
    total.value = 0
    selectedAppointment.value = null
    history.value = []
    reminders.value = []
    workSchedules.value = []
    scheduleBlocks.value = []
    availabilitySlots.value = []
    customers.value = []
    employees.value = []
    services.value = []
    filters.value = createDefaultFilters()
    errorMessage.value = null
    isLoading.value = false
    isSaving.value = false
    isCheckingAvailability.value = false
  }

  return {
    appointments,
    total,
    selectedAppointment,
    history,
    reminders,
    workSchedules,
    scheduleBlocks,
    availabilitySlots,
    customers,
    employees,
    services,
    filters,
    isLoading,
    isSaving,
    isCheckingAvailability,
    errorMessage,
    activeCustomers,
    activeEmployees,
    activeServices,
    setFilters,
    loadWorkspace,
    refreshAppointments,
    selectAppointment,
    createAppointment,
    updateAppointment,
    rescheduleAppointment,
    cancelAppointment,
    checkAvailability,
    createWorkSchedule,
    updateWorkSchedule,
    createScheduleBlock,
    updateScheduleBlock,
    createReminder,
    updateReminder,
    reset,
  }
})
