<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import AppointmentCalendar from '@/components/appointments/AppointmentCalendar.vue'
import AppointmentDetailsDialog from '@/components/appointments/AppointmentDetailsDialog.vue'
import AppointmentFilters from '@/components/appointments/AppointmentFilters.vue'
import AppointmentFormDialog from '@/components/appointments/AppointmentFormDialog.vue'
import ReminderDialog from '@/components/appointments/ReminderDialog.vue'
import ScheduleBlockDialog from '@/components/appointments/ScheduleBlockDialog.vue'
import WorkScheduleDialog from '@/components/appointments/WorkScheduleDialog.vue'
import { useAppointmentStore } from '@/stores/appointment'
import { useAuthStore } from '@/stores/auth'
import type {
  AppointmentCreateInput,
  AppointmentFilters as AppointmentFilterValues,
  AppointmentReminder,
  AppointmentReminderCreateInput,
  AppointmentUpdateInput,
  ScheduleBlock,
  ScheduleBlockCreateInput,
  WorkSchedule,
  WorkScheduleCreateInput,
} from '@/types/appointment'
import {
  formatPersonName,
  toColombiaIso,
  toDateInput,
  toTimeInput,
} from '@/utils/appointment-formatters'

const appointmentStore = useAppointmentStore()
const authStore = useAuthStore()

const filters = ref<AppointmentFilterValues>({ ...appointmentStore.filters })
const formDialog = ref(false)
const detailsDialog = ref(false)
const workScheduleDialog = ref(false)
const scheduleBlockDialog = ref(false)
const reminderDialog = ref(false)
const rescheduleDialog = ref(false)
const cancelDialog = ref(false)
const editing = ref(false)
const successMessage = ref<string | null>(null)

const rescheduleForm = reactive({
  date: '',
  startTime: '',
  endTime: '',
  reason: '',
})

const cancelReason = ref('')

const selectedAppointment = computed(() => appointmentStore.selectedAppointment)

const customerName = computed(() => {
  const appointment = selectedAppointment.value
  if (!appointment) return 'Cliente'
  const customer = appointmentStore.customers.find((item) => item.id === appointment.customer_id)
  return customer ? formatPersonName(customer.first_name, customer.last_name) : 'Cliente'
})

const employeeName = computed(() => {
  const appointment = selectedAppointment.value
  if (!appointment) return 'Profesional'
  const employee = appointmentStore.employees.find((item) => item.id === appointment.employee_id)
  return employee ? formatPersonName(employee.first_name, employee.last_name) : 'Profesional'
})

const serviceName = computed(() => {
  const appointment = selectedAppointment.value
  if (!appointment) return 'Servicio'
  return (
    appointmentStore.services.find((item) => item.id === appointment.service_id)?.name ?? 'Servicio'
  )
})

const summaryCards = computed(() => [
  {
    label: 'Citas del período',
    value: appointmentStore.total,
    icon: 'mdi-calendar-multiple-check',
    color: '#17324d',
  },
  {
    label: 'Programadas',
    value: appointmentStore.appointments.filter((appointment) => appointment.status === 'scheduled')
      .length,
    icon: 'mdi-calendar-clock',
    color: '#0277bd',
  },
  {
    label: 'Confirmadas',
    value: appointmentStore.appointments.filter((appointment) => appointment.status === 'confirmed')
      .length,
    icon: 'mdi-calendar-check',
    color: '#2f918c',
  },
  {
    label: 'Requieren atención',
    value: appointmentStore.reminders.filter((reminder) => reminder.status === 'pending').length,
    icon: 'mdi-bell-badge-outline',
    color: '#ed6c02',
  },
])

onMounted(async () => {
  const companyId = authStore.companyId
  if (!companyId) return
  await appointmentStore.loadWorkspace(companyId)
})

async function applyFilters(): Promise<void> {
  appointmentStore.setFilters(filters.value)
  await appointmentStore.refreshAppointments()
}

function clearFilters(): void {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const toDate = (value: Date) => value.toISOString().slice(0, 10)

  filters.value = {
    startDate: toDate(firstDay),
    endDate: toDate(lastDay),
    customerId: null,
    employeeId: null,
    serviceId: null,
    status: null,
  }

  void applyFilters()
}

function openCreate(): void {
  editing.value = false
  appointmentStore.availabilitySlots = []
  formDialog.value = true
}

async function openDetails(appointmentId: string): Promise<void> {
  await appointmentStore.selectAppointment(appointmentId)
  detailsDialog.value = appointmentStore.selectedAppointment !== null
}

function openEdit(): void {
  editing.value = true
  detailsDialog.value = false
  formDialog.value = true
}

async function saveAppointment(
  data: AppointmentCreateInput | AppointmentUpdateInput,
): Promise<void> {
  const appointmentId = selectedAppointment.value?.id
  const saved =
    editing.value && appointmentId
      ? await appointmentStore.updateAppointment(appointmentId, data as AppointmentUpdateInput)
      : await appointmentStore.createAppointment(data as AppointmentCreateInput)

  if (!saved) return
  formDialog.value = false
  successMessage.value = editing.value
    ? 'Cita actualizada correctamente'
    : 'Cita creada correctamente'
}

function openReschedule(): void {
  const appointment = selectedAppointment.value
  if (!appointment) return

  rescheduleForm.date = toDateInput(appointment.start_at)
  rescheduleForm.startTime = toTimeInput(appointment.start_at)
  rescheduleForm.endTime = toTimeInput(appointment.end_at)
  rescheduleForm.reason = ''
  detailsDialog.value = false
  rescheduleDialog.value = true
}

async function rescheduleAppointment(): Promise<void> {
  const appointment = selectedAppointment.value
  if (!appointment || rescheduleForm.reason.trim().length < 3) return

  const saved = await appointmentStore.rescheduleAppointment(appointment.id, {
    employee_id: appointment.employee_id,
    service_id: appointment.service_id,
    start_at: toColombiaIso(rescheduleForm.date, rescheduleForm.startTime),
    end_at: toColombiaIso(rescheduleForm.date, rescheduleForm.endTime),
    reason: rescheduleForm.reason.trim(),
  })

  if (!saved) return
  rescheduleDialog.value = false
  successMessage.value = 'Cita reprogramada correctamente'
}

function openCancel(): void {
  cancelReason.value = ''
  detailsDialog.value = false
  cancelDialog.value = true
}

async function cancelAppointment(): Promise<void> {
  const appointment = selectedAppointment.value
  if (!appointment || cancelReason.value.trim().length < 3) return

  const saved = await appointmentStore.cancelAppointment(appointment.id, {
    cancellation_reason: cancelReason.value.trim(),
  })

  if (!saved) return
  cancelDialog.value = false
  successMessage.value = 'Cita cancelada correctamente'
}

async function checkAvailability(
  employeeId: string,
  serviceId: string,
  date: string,
): Promise<void> {
  await appointmentStore.checkAvailability(employeeId, serviceId, date)
}

async function saveWorkSchedule(data: WorkScheduleCreateInput): Promise<void> {
  if (await appointmentStore.createWorkSchedule(data)) {
    successMessage.value = 'Horario laboral creado correctamente'
  }
}

async function toggleWorkSchedule(schedule: WorkSchedule): Promise<void> {
  await appointmentStore.updateWorkSchedule(schedule.id, {
    is_active: !schedule.is_active,
  })
}

async function saveScheduleBlock(data: ScheduleBlockCreateInput): Promise<void> {
  if (await appointmentStore.createScheduleBlock(data)) {
    successMessage.value = 'Bloqueo de agenda creado correctamente'
  }
}

async function toggleScheduleBlock(block: ScheduleBlock): Promise<void> {
  await appointmentStore.updateScheduleBlock(block.id, {
    is_active: !block.is_active,
  })
}

function openReminder(): void {
  detailsDialog.value = false
  reminderDialog.value = true
}

async function saveReminder(data: AppointmentReminderCreateInput): Promise<void> {
  const appointmentId = selectedAppointment.value?.id
  if (!appointmentId) return

  if (await appointmentStore.createReminder(appointmentId, data)) {
    successMessage.value = 'Recordatorio creado correctamente'
  }
}

async function cancelReminder(reminder: AppointmentReminder): Promise<void> {
  await appointmentStore.updateReminder(reminder.id, {
    status: 'cancelled',
    failure_message: null,
  })
}
</script>

<template>
  <VContainer fluid class="appointments-page pa-5 pa-md-8">
    <header class="page-header">
      <div>
        <span class="page-header__eyebrow">AGENDA PROFESIONAL</span>
        <h1>Agenda y citas</h1>
        <p>Organiza reservas, disponibilidad, horarios y recordatorios desde un único lugar.</p>
      </div>
      <VChip color="success" variant="tonal" prepend-icon="mdi-shield-check">
        Integrado con FastAPI
      </VChip>
    </header>

    <VAlert
      v-if="appointmentStore.errorMessage"
      class="mb-5"
      type="error"
      variant="tonal"
      closable
      :text="appointmentStore.errorMessage"
      @click:close="appointmentStore.errorMessage = null"
    />

    <AppointmentFilters
      v-model="filters"
      :customers="appointmentStore.activeCustomers"
      :employees="appointmentStore.activeEmployees"
      :services="appointmentStore.activeServices"
      :loading="appointmentStore.isLoading"
      @apply="applyFilters"
      @clear="clearFilters"
      @create="openCreate"
      @schedules="workScheduleDialog = true"
      @blocks="scheduleBlockDialog = true"
      @reminders="reminderDialog = true"
    />

    <section class="summary-grid" data-testid="appointments-summary">
      <VCard
        v-for="card in summaryCards"
        :key="card.label"
        variant="flat"
        border
        class="summary-card"
      >
        <VIcon :icon="card.icon" :color="card.color" size="28" />
        <div>
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
        </div>
      </VCard>
    </section>

    <VSkeletonLoader
      v-if="appointmentStore.isLoading && !appointmentStore.appointments.length"
      class="mt-5"
      type="heading, paragraph, table-row@4"
    />

    <AppointmentCalendar
      v-else
      class="mt-5"
      :appointments="appointmentStore.appointments"
      :customers="appointmentStore.customers"
      :employees="appointmentStore.employees"
      :services="appointmentStore.services"
      @select="openDetails"
    />

    <AppointmentFormDialog
      v-model="formDialog"
      :appointment="editing ? selectedAppointment : null"
      :customers="appointmentStore.activeCustomers"
      :employees="appointmentStore.activeEmployees"
      :services="appointmentStore.activeServices"
      :availability-slots="appointmentStore.availabilitySlots"
      :loading="appointmentStore.isSaving"
      :checking-availability="appointmentStore.isCheckingAvailability"
      @save="saveAppointment"
      @availability="checkAvailability"
    />

    <AppointmentDetailsDialog
      v-model="detailsDialog"
      :appointment="selectedAppointment"
      :customer-name="customerName"
      :employee-name="employeeName"
      :service-name="serviceName"
      :history="appointmentStore.history"
      :reminders="appointmentStore.reminders"
      :loading="appointmentStore.isLoading"
      @edit="openEdit"
      @reschedule="openReschedule"
      @cancel="openCancel"
      @reminder="openReminder"
    />

    <WorkScheduleDialog
      v-model="workScheduleDialog"
      :schedules="appointmentStore.workSchedules"
      :employees="appointmentStore.activeEmployees"
      :loading="appointmentStore.isSaving"
      @save="saveWorkSchedule"
      @toggle="toggleWorkSchedule"
    />

    <ScheduleBlockDialog
      v-model="scheduleBlockDialog"
      :blocks="appointmentStore.scheduleBlocks"
      :employees="appointmentStore.activeEmployees"
      :loading="appointmentStore.isSaving"
      @save="saveScheduleBlock"
      @toggle="toggleScheduleBlock"
    />

    <ReminderDialog
      v-model="reminderDialog"
      :reminders="appointmentStore.reminders"
      :appointment-id="selectedAppointment?.id ?? null"
      :loading="appointmentStore.isSaving"
      @save="saveReminder"
      @cancel="cancelReminder"
    />

    <VDialog v-model="rescheduleDialog" max-width="560">
      <VCard title="Reprogramar cita">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField v-model="rescheduleForm.date" type="date" label="Nueva fecha" />
            </VCol>
            <VCol cols="6">
              <VTextField v-model="rescheduleForm.startTime" type="time" label="Hora inicial" />
            </VCol>
            <VCol cols="6">
              <VTextField v-model="rescheduleForm.endTime" type="time" label="Hora final" />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="rescheduleForm.reason"
                label="Motivo de reprogramación"
                maxlength="500"
                counter
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions class="justify-end pa-5 pt-0">
          <VBtn variant="text" @click="rescheduleDialog = false">Cerrar</VBtn>
          <VBtn
            color="secondary"
            :loading="appointmentStore.isSaving"
            :disabled="rescheduleForm.reason.trim().length < 3"
            @click="rescheduleAppointment"
          >
            Confirmar reprogramación
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VDialog v-model="cancelDialog" max-width="520">
      <VCard title="Cancelar cita">
        <VCardText>
          <VAlert
            type="warning"
            variant="tonal"
            class="mb-4"
            text="La cancelación quedará registrada en el historial de la cita."
          />
          <VTextarea v-model="cancelReason" label="Motivo de cancelación" maxlength="500" counter />
        </VCardText>
        <VCardActions class="justify-end pa-5 pt-0">
          <VBtn variant="text" @click="cancelDialog = false">Volver</VBtn>
          <VBtn
            color="error"
            :loading="appointmentStore.isSaving"
            :disabled="cancelReason.trim().length < 3"
            @click="cancelAppointment"
          >
            Cancelar definitivamente
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VSnackbar
      :model-value="Boolean(successMessage)"
      color="success"
      timeout="3500"
      location="bottom right"
      @update:model-value="successMessage = null"
    >
      {{ successMessage }}
    </VSnackbar>
  </VContainer>
</template>

<style scoped>
.appointments-page {
  max-width: 1720px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.page-header__eyebrow {
  color: #2f918c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.17em;
}

.page-header h1 {
  margin: 7px 0 5px;
  color: #17324d;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.08;
}

.page-header p {
  margin: 0;
  color: #637381;
  font-size: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(170px, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.summary-card {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 18px;
  border-color: #dbe4e9;
}

.summary-card > div {
  display: grid;
}

.summary-card span {
  color: #71808c;
  font-size: 0.78rem;
}

.summary-card strong {
  color: #17324d;
  font-size: 1.5rem;
}

@media (max-width: 1000px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 620px) {
  .page-header {
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
