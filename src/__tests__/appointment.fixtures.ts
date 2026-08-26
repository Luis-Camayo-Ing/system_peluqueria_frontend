import type {
  Appointment,
  AppointmentHistory,
  AppointmentReminder,
  AvailabilitySlot,
  CustomerOption,
  EmployeeAvailability,
  EmployeeOption,
  ScheduleBlock,
  ServiceOption,
  WorkSchedule,
} from '@/types/appointment'

export const companyId = 'bf7bd432-0c31-4350-95f2-cce62dda4884'
export const appointmentId = '11111111-1111-4111-8111-111111111111'
export const customerId = '22222222-2222-4222-8222-222222222222'
export const employeeId = '33333333-3333-4333-8333-333333333333'
export const serviceId = '44444444-4444-4444-8444-444444444444'
export const scheduleId = '55555555-5555-4555-8555-555555555555'
export const blockId = '66666666-6666-4666-8666-666666666666'
export const reminderId = '77777777-7777-4777-8777-777777777777'
export const historyId = '88888888-8888-4888-8888-888888888888'

export const appointmentFixture: Appointment = {
  id: appointmentId,
  company_id: companyId,
  customer_id: customerId,
  employee_id: employeeId,
  service_id: serviceId,
  start_at: '2026-08-25T14:00:00-05:00',
  end_at: '2026-08-25T15:00:00-05:00',
  status: 'confirmed',
  notes: 'Corte y peinado',
  cancellation_reason: null,
  created_at: '2026-08-24T18:00:00Z',
  updated_at: '2026-08-24T18:30:00Z',
}

export const customerFixture: CustomerOption = {
  id: customerId,
  first_name: 'Laura',
  last_name: 'Gómez',
  phone: '3001234567',
  email: 'laura@example.com',
  is_active: true,
}

export const employeeFixture: EmployeeOption = {
  id: employeeId,
  company_id: companyId,
  first_name: 'Ana',
  last_name: 'Torres',
  job_title: 'Estilista',
  is_active: true,
}

export const serviceFixture: ServiceOption = {
  id: serviceId,
  company_id: companyId,
  name: 'Corte y peinado',
  duration_minutes: 60,
  price: '45000.00',
  is_active: true,
}

export const availabilitySlotFixture: AvailabilitySlot = {
  start_at: '2026-08-25T14:00:00-05:00',
  end_at: '2026-08-25T15:00:00-05:00',
}

export const availabilityFixture: EmployeeAvailability = {
  employee_id: employeeId,
  service_id: serviceId,
  target_date: '2026-08-25',
  timezone: 'America/Bogota',
  duration_minutes: 60,
  slots: [availabilitySlotFixture],
}

export const workScheduleFixture: WorkSchedule = {
  id: scheduleId,
  company_id: companyId,
  employee_id: employeeId,
  weekday: 1,
  start_time: '08:00:00',
  end_time: '17:00:00',
  is_active: true,
  created_at: '2026-08-24T18:00:00Z',
  updated_at: '2026-08-24T18:00:00Z',
}

export const scheduleBlockFixture: ScheduleBlock = {
  id: blockId,
  company_id: companyId,
  employee_id: employeeId,
  block_type: 'break',
  start_at: '2026-08-25T12:00:00-05:00',
  end_at: '2026-08-25T13:00:00-05:00',
  reason: 'Almuerzo',
  is_active: true,
  created_at: '2026-08-24T18:00:00Z',
  updated_at: '2026-08-24T18:00:00Z',
}

export const reminderFixture: AppointmentReminder = {
  id: reminderId,
  company_id: companyId,
  appointment_id: appointmentId,
  created_by_user_id: null,
  channel: 'internal',
  remind_at: '2026-08-25T13:00:00-05:00',
  status: 'pending',
  sent_at: null,
  failure_message: null,
  created_at: '2026-08-24T18:00:00Z',
  updated_at: '2026-08-24T18:00:00Z',
}

export const historyFixture: AppointmentHistory = {
  id: historyId,
  company_id: companyId,
  appointment_id: appointmentId,
  changed_by_user_id: null,
  change_type: 'rescheduled',
  previous_start_at: '2026-08-25T13:00:00-05:00',
  previous_end_at: '2026-08-25T14:00:00-05:00',
  new_start_at: appointmentFixture.start_at,
  new_end_at: appointmentFixture.end_at,
  previous_status: 'scheduled',
  new_status: 'confirmed',
  reason: 'Solicitud de la cliente',
  created_at: '2026-08-24T18:15:00Z',
}
