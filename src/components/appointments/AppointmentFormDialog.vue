<script setup lang="ts">
import { computed, reactive, watch } from 'vue'

import AvailabilityPicker from '@/components/appointments/AvailabilityPicker.vue'
import type {
  Appointment,
  AppointmentCreateInput,
  AppointmentStatus,
  AppointmentUpdateInput,
  AvailabilitySlot,
  CustomerOption,
  EmployeeOption,
  ServiceOption,
} from '@/types/appointment'
import {
  appointmentStatusLabels,
  calculateAppointmentEndTime,
  formatPersonName,
  toColombiaIso,
  toDateInput,
  toTimeInput,
  validateTimeRange,
} from '@/utils/appointment-formatters'

interface AppointmentFormState {
  customerId: string
  employeeId: string
  serviceId: string
  date: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  notes: string
}

const props = defineProps<{
  modelValue: boolean
  appointment: Appointment | null
  customers: CustomerOption[]
  employees: EmployeeOption[]
  services: ServiceOption[]
  availabilitySlots: AvailabilitySlot[]
  loading: boolean
  checkingAvailability: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: AppointmentCreateInput | AppointmentUpdateInput]
  availability: [employeeId: string, serviceId: string, date: string]
}>()

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function initialState(): AppointmentFormState {
  if (props.appointment) {
    return {
      customerId: props.appointment.customer_id,
      employeeId: props.appointment.employee_id,
      serviceId: props.appointment.service_id,
      date: toDateInput(props.appointment.start_at),
      startTime: toTimeInput(props.appointment.start_at),
      endTime: toTimeInput(props.appointment.end_at),
      status: props.appointment.status,
      notes: props.appointment.notes ?? '',
    }
  }

  return {
    customerId: '',
    employeeId: '',
    serviceId: '',
    date: today(),
    startTime: '09:00',
    endTime: '10:00',
    status: 'scheduled',
    notes: '',
  }
}

const form = reactive<AppointmentFormState>(initialState())
const isEditing = computed(() => props.appointment !== null)
const selectedService = computed(
  () => props.services.find((service) => service.id === form.serviceId) ?? null,
)

const expectedEndTime = computed(() => {
  const service = selectedService.value

  if (!service || !form.startTime) return ''

  return calculateAppointmentEndTime(form.startTime, service.duration_minutes)
})

const durationMatchesService = computed(
  () => Boolean(expectedEndTime.value) && form.endTime === expectedEndTime.value,
)

const statusItems = Object.entries(appointmentStatusLabels).map(([value, title]) => ({
  value: value as AppointmentStatus,
  title,
}))

const isValid = computed(
  () =>
    Boolean(
      form.customerId &&
      form.employeeId &&
      form.serviceId &&
      form.date &&
      form.startTime &&
      form.endTime,
    ) &&
    validateTimeRange(
      toColombiaIso(form.date, form.startTime),
      toColombiaIso(form.date, form.endTime),
    ) &&
    durationMatchesService.value,
)

watch(
  () => [props.modelValue, props.appointment] as const,
  ([isOpen]) => {
    if (isOpen) Object.assign(form, initialState())
  },
)

watch(expectedEndTime, (endTime) => {
  if (endTime) form.endTime = endTime
})

function requestAvailability(): void {
  if (!form.employeeId || !form.serviceId || !form.date) return
  emit('availability', form.employeeId, form.serviceId, form.date)
}

function selectSlot(slot: AvailabilitySlot): void {
  form.date = toDateInput(slot.start_at)
  form.startTime = toTimeInput(slot.start_at)
  form.endTime = toTimeInput(slot.end_at)
}

function submit(): void {
  if (!isValid.value) return

  const commonData = {
    customer_id: form.customerId,
    employee_id: form.employeeId,
    service_id: form.serviceId,
    start_at: toColombiaIso(form.date, form.startTime),
    end_at: toColombiaIso(form.date, form.endTime),
    notes: form.notes.trim() || null,
  }

  if (isEditing.value) {
    emit('save', { ...commonData, status: form.status })
    return
  }

  emit('save', commonData)
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="820"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="dialog-title">
        <div>
          <span>{{ isEditing ? 'EDITAR CITA' : 'NUEVA CITA' }}</span>
          <h2>{{ isEditing ? 'Actualiza la reserva' : 'Programa una atención' }}</h2>
        </div>
        <VBtn
          icon="mdi-close"
          variant="text"
          aria-label="Cerrar formulario de cita"
          @click="emit('update:modelValue', false)"
        />
      </VCardTitle>

      <VCardText>
        <VForm @submit.prevent="submit">
          <VRow>
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.customerId"
                :items="customers"
                :item-title="(item) => formatPersonName(item.first_name, item.last_name)"
                item-value="id"
                label="Cliente"
                prepend-inner-icon="mdi-account-outline"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.employeeId"
                :items="employees"
                :item-title="(item) => formatPersonName(item.first_name, item.last_name)"
                item-value="id"
                label="Profesional"
                prepend-inner-icon="mdi-account-tie-outline"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.serviceId"
                :items="services"
                item-title="name"
                item-value="id"
                label="Servicio"
                prepend-inner-icon="mdi-content-cut"
              />
            </VCol>
            <VCol v-if="isEditing" cols="12" md="6">
              <VSelect
                v-model="form.status"
                :items="statusItems"
                label="Estado"
                prepend-inner-icon="mdi-list-status"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model="form.date"
                type="date"
                label="Fecha"
                prepend-inner-icon="mdi-calendar-outline"
              />
            </VCol>
            <VCol cols="6" md="4">
              <VTextField v-model="form.startTime" type="time" label="Hora inicial" />
            </VCol>
            <VCol cols="6" md="4">
              <VTextField
                v-model="form.endTime"
                type="time"
                label="Hora final"
                readonly
                persistent-hint
                :hint="
                  selectedService
                    ? `Calculada con los ${selectedService.duration_minutes} minutos configurados para el servicio`
                    : 'Selecciona un servicio para calcularla'
                "
              />
            </VCol>
            <VCol cols="12">
              <VTextarea v-model="form.notes" label="Notas" rows="2" maxlength="2000" counter />
            </VCol>
          </VRow>

          <div class="availability-action">
            <VBtn
              variant="tonal"
              color="secondary"
              prepend-icon="mdi-calendar-search"
              :disabled="!form.employeeId || !form.serviceId || !form.date"
              :loading="checkingAvailability"
              @click="requestAvailability"
            >
              Consultar disponibilidad
            </VBtn>
          </div>

          <AvailabilityPicker
            class="mt-4"
            :slots="availabilitySlots"
            :loading="checkingAvailability"
            @select="selectSlot"
          />

          <VAlert
            v-if="form.startTime && form.endTime && selectedService && !durationMatchesService"
            class="mt-4"
            type="warning"
            variant="tonal"
            density="compact"
            :text="`La cita debe durar exactamente ${selectedService.duration_minutes} minutos.`"
          />

          <div class="dialog-actions">
            <VBtn variant="text" @click="emit('update:modelValue', false)"> Cancelar </VBtn>
            <VBtn
              type="submit"
              color="primary"
              prepend-icon="mdi-content-save-outline"
              :disabled="!isValid"
              :loading="loading"
            >
              {{ isEditing ? 'Guardar cambios' : 'Crear cita' }}
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
.dialog-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 8px;
}

.dialog-title span {
  color: #1f7a75;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.dialog-title h2 {
  margin: 3px 0 0;
  color: #17324d;
  font-size: 1.35rem;
}

.availability-action,
.dialog-actions {
  display: flex;
  justify-content: flex-end;
}

.dialog-actions {
  gap: 8px;
  margin-top: 22px;
}
</style>
