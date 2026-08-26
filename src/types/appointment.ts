import { z } from 'zod'

const uuidSchema = z.string().uuid()
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const isoDateTimeSchema = z.string().datetime({ offset: true })
const timeSchema = z.string().regex(/^\d{2}:\d{2}(?::\d{2}(?:\.\d{1,6})?)?$/)

export const appointmentStatusSchema = z.enum([
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
])

export const scheduleBlockTypeSchema = z.enum([
  'break',
  'day_off',
  'vacation',
  'permission',
  'other',
])

export const reminderChannelSchema = z.enum(['internal', 'email', 'whatsapp'])

export const reminderStatusSchema = z.enum(['pending', 'sent', 'failed', 'cancelled'])

export const appointmentHistoryTypeSchema = z.enum(['rescheduled', 'cancelled'])

export const appointmentSchema = z.object({
  id: uuidSchema,
  company_id: uuidSchema,
  customer_id: uuidSchema,
  employee_id: uuidSchema,
  service_id: uuidSchema,
  start_at: isoDateTimeSchema,
  end_at: isoDateTimeSchema,
  status: appointmentStatusSchema,
  notes: z.string().nullable(),
  cancellation_reason: z.string().nullable(),
  created_at: isoDateTimeSchema,
  updated_at: isoDateTimeSchema,
})

export const appointmentListSchema = z.object({
  total: z.number().int().nonnegative(),
  items: z.array(appointmentSchema),
})

export const availabilitySlotSchema = z.object({
  start_at: isoDateTimeSchema,
  end_at: isoDateTimeSchema,
})

export const employeeAvailabilitySchema = z.object({
  employee_id: uuidSchema,
  service_id: uuidSchema,
  target_date: isoDateSchema,
  timezone: z.string().min(1),
  duration_minutes: z.number().int().positive(),
  slots: z.array(availabilitySlotSchema),
})

export const workScheduleSchema = z.object({
  id: uuidSchema,
  company_id: uuidSchema,
  employee_id: uuidSchema,
  weekday: z.number().int().min(0).max(6),
  start_time: timeSchema,
  end_time: timeSchema,
  is_active: z.boolean(),
  created_at: isoDateTimeSchema,
  updated_at: isoDateTimeSchema,
})

export const workScheduleListSchema = z.object({
  total: z.number().int().nonnegative(),
  items: z.array(workScheduleSchema),
})

export const scheduleBlockSchema = z.object({
  id: uuidSchema,
  company_id: uuidSchema,
  employee_id: uuidSchema,
  block_type: scheduleBlockTypeSchema,
  start_at: isoDateTimeSchema,
  end_at: isoDateTimeSchema,
  reason: z.string().nullable(),
  is_active: z.boolean(),
  created_at: isoDateTimeSchema,
  updated_at: isoDateTimeSchema,
})

export const scheduleBlockListSchema = z.object({
  total: z.number().int().nonnegative(),
  items: z.array(scheduleBlockSchema),
})

export const appointmentReminderSchema = z.object({
  id: uuidSchema,
  company_id: uuidSchema,
  appointment_id: uuidSchema,
  created_by_user_id: uuidSchema.nullable(),
  channel: reminderChannelSchema,
  remind_at: isoDateTimeSchema,
  status: reminderStatusSchema,
  sent_at: isoDateTimeSchema.nullable(),
  failure_message: z.string().nullable(),
  created_at: isoDateTimeSchema,
  updated_at: isoDateTimeSchema,
})

export const appointmentReminderListSchema = z.object({
  total: z.number().int().nonnegative(),
  items: z.array(appointmentReminderSchema),
})

export const appointmentHistorySchema = z.object({
  id: uuidSchema,
  company_id: uuidSchema,
  appointment_id: uuidSchema,
  changed_by_user_id: uuidSchema.nullable(),
  change_type: appointmentHistoryTypeSchema,
  previous_start_at: isoDateTimeSchema.nullable(),
  previous_end_at: isoDateTimeSchema.nullable(),
  new_start_at: isoDateTimeSchema.nullable(),
  new_end_at: isoDateTimeSchema.nullable(),
  previous_status: appointmentStatusSchema.nullable(),
  new_status: appointmentStatusSchema.nullable(),
  reason: z.string().nullable(),
  created_at: isoDateTimeSchema,
})

export const appointmentHistoryListSchema = z.object({
  total: z.number().int().nonnegative(),
  items: z.array(appointmentHistorySchema),
})

export const customerOptionSchema = z.object({
  id: uuidSchema,
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  is_active: z.boolean(),
})

export const customerOptionListSchema = z.object({
  total: z.number().int().nonnegative(),
  items: z.array(customerOptionSchema),
})

export const employeeOptionSchema = z.object({
  id: uuidSchema,
  company_id: uuidSchema,
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  job_title: z.string().min(1),
  is_active: z.boolean(),
})

export const serviceOptionSchema = z.object({
  id: uuidSchema,
  company_id: uuidSchema,
  name: z.string().min(1),
  duration_minutes: z.number().int().positive(),
  price: z.union([z.string(), z.number()]),
  is_active: z.boolean(),
})

export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>
export type ScheduleBlockType = z.infer<typeof scheduleBlockTypeSchema>
export type ReminderChannel = z.infer<typeof reminderChannelSchema>
export type ReminderStatus = z.infer<typeof reminderStatusSchema>
export type Appointment = z.infer<typeof appointmentSchema>
export type AppointmentList = z.infer<typeof appointmentListSchema>
export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>
export type EmployeeAvailability = z.infer<typeof employeeAvailabilitySchema>
export type WorkSchedule = z.infer<typeof workScheduleSchema>
export type ScheduleBlock = z.infer<typeof scheduleBlockSchema>
export type AppointmentReminder = z.infer<typeof appointmentReminderSchema>
export type AppointmentHistory = z.infer<typeof appointmentHistorySchema>
export type CustomerOption = z.infer<typeof customerOptionSchema>
export type EmployeeOption = z.infer<typeof employeeOptionSchema>
export type ServiceOption = z.infer<typeof serviceOptionSchema>

export interface AppointmentCreateInput {
  customer_id: string
  employee_id: string
  service_id: string
  start_at: string
  end_at: string
  notes?: string | null
}

export interface AppointmentUpdateInput {
  customer_id?: string | null
  employee_id?: string | null
  service_id?: string | null
  start_at?: string | null
  end_at?: string | null
  status?: AppointmentStatus | null
  notes?: string | null
  cancellation_reason?: string | null
}

export interface AppointmentRescheduleInput {
  employee_id?: string | null
  service_id?: string | null
  start_at: string
  end_at: string
  reason: string
}

export interface AppointmentCancelInput {
  cancellation_reason: string
}

export interface AppointmentListQuery {
  skip?: number
  limit?: number
  start_at?: string
  end_at?: string
  customer_id?: string
  employee_id?: string
  service_id?: string
  status?: AppointmentStatus
}

export interface AppointmentFilters {
  startDate: string
  endDate: string
  customerId: string | null
  employeeId: string | null
  serviceId: string | null
  status: AppointmentStatus | null
}

export interface EmployeeAvailabilityInput {
  employee_id: string
  service_id: string
  target_date: string
  timezone?: string
  slot_interval_minutes?: number
}

export interface WorkScheduleCreateInput {
  employee_id: string
  weekday: number
  start_time: string
  end_time: string
  is_active?: boolean
}

export interface WorkScheduleUpdateInput {
  weekday?: number | null
  start_time?: string | null
  end_time?: string | null
  is_active?: boolean | null
}

export interface WorkScheduleListQuery {
  skip?: number
  limit?: number
  employee_id?: string
  weekday?: number
  is_active?: boolean
}

export interface ScheduleBlockCreateInput {
  employee_id: string
  block_type: ScheduleBlockType
  start_at: string
  end_at: string
  reason?: string | null
  is_active?: boolean
}

export interface ScheduleBlockUpdateInput {
  block_type?: ScheduleBlockType | null
  start_at?: string | null
  end_at?: string | null
  reason?: string | null
  is_active?: boolean | null
}

export interface ScheduleBlockListQuery {
  skip?: number
  limit?: number
  employee_id?: string
  block_type?: ScheduleBlockType
  start_at?: string
  end_at?: string
  is_active?: boolean
}

export interface AppointmentReminderCreateInput {
  channel?: ReminderChannel
  remind_at: string
}

export interface AppointmentReminderUpdateInput {
  status: ReminderStatus
  failure_message?: string | null
}

export interface AppointmentReminderListQuery {
  skip?: number
  limit?: number
  appointment_id?: string
  employee_id?: string
  channel?: ReminderChannel
  status?: ReminderStatus
  remind_from?: string
  remind_until?: string
}
