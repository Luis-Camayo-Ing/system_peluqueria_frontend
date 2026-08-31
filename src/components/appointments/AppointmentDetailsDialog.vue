<script setup lang="ts">
import AppointmentHistoryTimeline from '@/components/appointments/AppointmentHistoryTimeline.vue'
import AppointmentStatusChip from '@/components/appointments/AppointmentStatusChip.vue'
import type { Appointment, AppointmentHistory, AppointmentReminder } from '@/types/appointment'
import {
  formatAppointmentDateTime,
  reminderChannelLabels,
  reminderStatusLabels,
} from '@/utils/appointment-formatters'

defineProps<{
  modelValue: boolean
  appointment: Appointment | null
  customerName: string
  employeeName: string
  serviceName: string
  history: AppointmentHistory[]
  reminders: AppointmentReminder[]
  loading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  edit: []
  reschedule: []
  cancel: []
  reminder: []
}>()
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="760"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard v-if="appointment">
      <VCardTitle class="details-title">
        <div>
          <span>DETALLE DE CITA</span>
          <h2>{{ customerName }}</h2>
        </div>
        <VBtn
          icon="mdi-close"
          variant="text"
          aria-label="Cerrar detalle de cita"
          @click="emit('update:modelValue', false)"
        />
      </VCardTitle>

      <VProgressLinear v-if="loading" indeterminate color="secondary" />

      <VCardText>
        <div class="details-summary">
          <div class="details-summary__status">
            <AppointmentStatusChip :status="appointment.status" />
          </div>
          <div>
            <VIcon icon="mdi-calendar-clock-outline" />
            <span>{{ formatAppointmentDateTime(appointment.start_at) }}</span>
          </div>
          <div>
            <VIcon icon="mdi-account-tie-outline" />
            <span>{{ employeeName }}</span>
          </div>
          <div>
            <VIcon icon="mdi-content-cut" />
            <span>{{ serviceName }}</span>
          </div>
        </div>

        <VAlert
          v-if="appointment.notes"
          class="mt-4"
          type="info"
          variant="tonal"
          :text="appointment.notes"
        />

        <VAlert
          v-if="appointment.cancellation_reason"
          class="mt-4"
          type="error"
          variant="tonal"
          :text="`Motivo de cancelación: ${appointment.cancellation_reason}`"
        />

        <section class="reminders-section">
          <div class="section-heading">
            <h3>Recordatorios</h3>
            <VBtn
              size="small"
              variant="tonal"
              color="secondary"
              prepend-icon="mdi-bell-plus-outline"
              @click="emit('reminder')"
            >
              Crear
            </VBtn>
          </div>

          <div v-if="reminders.length" class="reminder-list">
            <div v-for="reminder in reminders" :key="reminder.id">
              <VIcon icon="mdi-bell-outline" color="secondary" />
              <span>
                {{ reminderChannelLabels[reminder.channel] }} ·
                {{ formatAppointmentDateTime(reminder.remind_at) }}
              </span>
              <VChip size="x-small" variant="tonal">
                {{ reminderStatusLabels[reminder.status] }}
              </VChip>
            </div>
          </div>
          <p v-else class="empty-copy">No hay recordatorios asociados.</p>
        </section>

        <AppointmentHistoryTimeline class="mt-6" :history="history" />
      </VCardText>

      <VCardActions class="details-actions">
        <VBtn
          variant="text"
          prepend-icon="mdi-pencil-outline"
          :disabled="appointment.status === 'cancelled' || appointment.status === 'completed'"
          @click="emit('edit')"
        >
          Editar
        </VBtn>
        <VBtn
          color="secondary"
          variant="tonal"
          prepend-icon="mdi-calendar-sync-outline"
          :disabled="appointment.status === 'cancelled' || appointment.status === 'completed'"
          @click="emit('reschedule')"
        >
          Reprogramar
        </VBtn>
        <VBtn
          color="error"
          variant="tonal"
          prepend-icon="mdi-calendar-remove-outline"
          :disabled="appointment.status === 'cancelled' || appointment.status === 'completed'"
          @click="emit('cancel')"
        >
          Cancelar cita
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style scoped>
.details-title,
.section-heading,
.details-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.details-title {
  align-items: flex-start;
  padding: 22px 24px 8px;
}

.details-title span {
  color: #1f7a75;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.details-title h2 {
  margin: 4px 0 0;
  color: #17324d;
}

.details-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.details-summary > div:not(.details-summary__status) {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 13px;
  color: #52616f;
  background: #f4f7f9;
  border-radius: 12px;
}

.details-summary__status {
  grid-column: 1 / -1;
}

.reminders-section {
  margin-top: 24px;
}

.section-heading h3 {
  margin: 0;
  color: #17324d;
  font-size: 1rem;
}

.reminder-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.reminder-list > div {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 9px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid #e1e8ec;
  border-radius: 11px;
}

.empty-copy {
  color: #637381;
  font-size: 0.84rem;
}

.details-actions {
  flex-wrap: wrap;
  padding: 14px 24px 22px;
}

@media (max-width: 620px) {
  .details-summary {
    grid-template-columns: 1fr;
  }
}
</style>
