import { http } from '@/services/http'
import {
  appointmentHistoryListSchema,
  appointmentListSchema,
  appointmentReminderListSchema,
  appointmentReminderSchema,
  appointmentSchema,
  customerOptionListSchema,
  employeeAvailabilitySchema,
  employeeOptionSchema,
  scheduleBlockListSchema,
  scheduleBlockSchema,
  serviceOptionSchema,
  workScheduleListSchema,
  workScheduleSchema,
  type Appointment,
  type AppointmentCancelInput,
  type AppointmentCreateInput,
  type AppointmentHistory,
  type AppointmentList,
  type AppointmentListQuery,
  type AppointmentReminder,
  type AppointmentReminderCreateInput,
  type AppointmentReminderListQuery,
  type AppointmentReminderUpdateInput,
  type AppointmentRescheduleInput,
  type AppointmentUpdateInput,
  type CustomerOption,
  type EmployeeAvailability,
  type EmployeeAvailabilityInput,
  type EmployeeOption,
  type ScheduleBlock,
  type ScheduleBlockCreateInput,
  type ScheduleBlockListQuery,
  type ScheduleBlockUpdateInput,
  type ServiceOption,
  type WorkSchedule,
  type WorkScheduleCreateInput,
  type WorkScheduleListQuery,
  type WorkScheduleUpdateInput,
} from '@/types/appointment'

export const appointmentService = {
  async list(query: AppointmentListQuery): Promise<AppointmentList> {
    const response = await http.get<unknown>('/appointments', {
      params: query,
    })

    return appointmentListSchema.parse(response.data)
  },

  async get(appointmentId: string): Promise<Appointment> {
    const response = await http.get<unknown>(`/appointments/${appointmentId}`)

    return appointmentSchema.parse(response.data)
  },

  async create(data: AppointmentCreateInput): Promise<Appointment> {
    const response = await http.post<unknown>('/appointments', data)

    return appointmentSchema.parse(response.data)
  },

  async update(appointmentId: string, data: AppointmentUpdateInput): Promise<Appointment> {
    const response = await http.patch<unknown>(`/appointments/${appointmentId}`, data)

    return appointmentSchema.parse(response.data)
  },

  async reschedule(appointmentId: string, data: AppointmentRescheduleInput): Promise<Appointment> {
    const response = await http.post<unknown>(`/appointments/${appointmentId}/reschedule`, data)

    return appointmentSchema.parse(response.data)
  },

  async cancel(appointmentId: string, data: AppointmentCancelInput): Promise<Appointment> {
    const response = await http.post<unknown>(`/appointments/${appointmentId}/cancel`, data)

    return appointmentSchema.parse(response.data)
  },

  async getAvailability(data: EmployeeAvailabilityInput): Promise<EmployeeAvailability> {
    const response = await http.post<unknown>('/appointments/availability', data)

    return employeeAvailabilitySchema.parse(response.data)
  },

  async listWorkSchedules(query: WorkScheduleListQuery = {}): Promise<WorkSchedule[]> {
    const response = await http.get<unknown>('/appointments/work-schedules', { params: query })

    return workScheduleListSchema.parse(response.data).items
  },

  async getWorkSchedule(scheduleId: string): Promise<WorkSchedule> {
    const response = await http.get<unknown>(`/appointments/work-schedules/${scheduleId}`)

    return workScheduleSchema.parse(response.data)
  },

  async createWorkSchedule(data: WorkScheduleCreateInput): Promise<WorkSchedule> {
    const response = await http.post<unknown>('/appointments/work-schedules', data)

    return workScheduleSchema.parse(response.data)
  },

  async updateWorkSchedule(
    scheduleId: string,
    data: WorkScheduleUpdateInput,
  ): Promise<WorkSchedule> {
    const response = await http.patch<unknown>(`/appointments/work-schedules/${scheduleId}`, data)

    return workScheduleSchema.parse(response.data)
  },

  async listScheduleBlocks(query: ScheduleBlockListQuery = {}): Promise<ScheduleBlock[]> {
    const response = await http.get<unknown>('/appointments/schedule-blocks', { params: query })

    return scheduleBlockListSchema.parse(response.data).items
  },

  async getScheduleBlock(blockId: string): Promise<ScheduleBlock> {
    const response = await http.get<unknown>(`/appointments/schedule-blocks/${blockId}`)

    return scheduleBlockSchema.parse(response.data)
  },

  async createScheduleBlock(data: ScheduleBlockCreateInput): Promise<ScheduleBlock> {
    const response = await http.post<unknown>('/appointments/schedule-blocks', data)

    return scheduleBlockSchema.parse(response.data)
  },

  async updateScheduleBlock(
    blockId: string,
    data: ScheduleBlockUpdateInput,
  ): Promise<ScheduleBlock> {
    const response = await http.patch<unknown>(`/appointments/schedule-blocks/${blockId}`, data)

    return scheduleBlockSchema.parse(response.data)
  },

  async listReminders(query: AppointmentReminderListQuery = {}): Promise<AppointmentReminder[]> {
    const response = await http.get<unknown>('/appointments/reminders', {
      params: query,
    })

    return appointmentReminderListSchema.parse(response.data).items
  },

  async listDueReminders(dueUntil?: string, limit = 100): Promise<AppointmentReminder[]> {
    const response = await http.get<unknown>('/appointments/reminders/due', {
      params: { due_until: dueUntil, limit },
    })

    return appointmentReminderListSchema.parse(response.data).items
  },

  async getReminder(reminderId: string): Promise<AppointmentReminder> {
    const response = await http.get<unknown>(`/appointments/reminders/${reminderId}`)

    return appointmentReminderSchema.parse(response.data)
  },

  async createReminder(
    appointmentId: string,
    data: AppointmentReminderCreateInput,
  ): Promise<AppointmentReminder> {
    const response = await http.post<unknown>(`/appointments/${appointmentId}/reminders`, data)

    return appointmentReminderSchema.parse(response.data)
  },

  async updateReminder(
    reminderId: string,
    data: AppointmentReminderUpdateInput,
  ): Promise<AppointmentReminder> {
    const response = await http.patch<unknown>(`/appointments/reminders/${reminderId}`, data)

    return appointmentReminderSchema.parse(response.data)
  },

  async listHistory(appointmentId: string): Promise<AppointmentHistory[]> {
    const response = await http.get<unknown>(`/appointments/${appointmentId}/history`, {
      params: { skip: 0, limit: 100 },
    })

    return appointmentHistoryListSchema.parse(response.data).items
  },

  async listCustomers(): Promise<CustomerOption[]> {
    const response = await http.get<unknown>('/customers', {
      params: { skip: 0, limit: 100, is_active: true },
    })

    return customerOptionListSchema.parse(response.data).items
  },

  async listEmployees(companyId: string): Promise<EmployeeOption[]> {
    const response = await http.get<unknown>('/employees', {
      params: { company_id: companyId, skip: 0, limit: 500 },
    })

    return employeeOptionSchema.array().parse(response.data)
  },

  async listServices(companyId: string): Promise<ServiceOption[]> {
    const response = await http.get<unknown>(`/services/company/${companyId}`)

    return serviceOptionSchema.array().parse(response.data)
  },
}
