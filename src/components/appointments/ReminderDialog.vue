<script setup lang="ts">
import { reactive } from 'vue'

import type {
  AppointmentReminder,
  AppointmentReminderCreateInput,
  ReminderChannel,
} from '@/types/appointment'
import {
  formatAppointmentDateTime,
  reminderChannelLabels,
  reminderStatusLabels,
  toColombiaIso,
} from '@/utils/appointment-formatters'

defineProps<{
  modelValue: boolean
  reminders: AppointmentReminder[]
  appointmentId: string | null
  loading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: AppointmentReminderCreateInput]
  cancel: [reminder: AppointmentReminder]
}>()

const currentDate = new Date().toISOString().slice(0, 10)
const form = reactive({
  channel: 'internal' as ReminderChannel,
  date: currentDate,
  time: '08:00',
})

const channelItems = Object.entries(reminderChannelLabels).map(([value, title]) => ({
  value: value as ReminderChannel,
  title,
}))

function submit(): void {
  emit('save', {
    channel: form.channel,
    remind_at: toColombiaIso(form.date, form.time),
  })
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="720"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="management-title">
        <div>
          <span>SEGUIMIENTO</span>
          <h2>Recordatorios de la cita</h2>
        </div>
        <VBtn
          icon="mdi-close"
          variant="text"
          aria-label="Cerrar recordatorios"
          @click="emit('update:modelValue', false)"
        />
      </VCardTitle>

      <VCardText>
        <VAlert
          v-if="!appointmentId"
          type="info"
          variant="tonal"
          text="Selecciona una cita para gestionar sus recordatorios."
        />

        <VForm v-else class="reminder-form" @submit.prevent="submit">
          <VSelect v-model="form.channel" :items="channelItems" label="Canal" />
          <VTextField v-model="form.date" type="date" label="Fecha" />
          <VTextField v-model="form.time" type="time" label="Hora" />
          <VBtn
            type="submit"
            color="secondary"
            prepend-icon="mdi-bell-plus-outline"
            :loading="loading"
          >
            Agregar
          </VBtn>
        </VForm>

        <VDivider class="my-5" />

        <div v-if="reminders.length" class="reminder-list">
          <div v-for="reminder in reminders" :key="reminder.id">
            <VIcon icon="mdi-bell-outline" color="secondary" />
            <div>
              <strong>{{ reminderChannelLabels[reminder.channel] }}</strong>
              <span>{{ formatAppointmentDateTime(reminder.remind_at) }}</span>
            </div>
            <VChip size="small" variant="tonal">
              {{ reminderStatusLabels[reminder.status] }}
            </VChip>
            <VBtn
              v-if="reminder.status === 'pending'"
              icon="mdi-close-circle-outline"
              size="small"
              variant="text"
              color="error"
              :aria-label="`Cancelar recordatorio ${reminder.id}`"
              @click="emit('cancel', reminder)"
            />
          </div>
        </div>

        <p v-else class="empty-copy">No hay recordatorios para esta cita.</p>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped>
.management-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 22px 24px 8px;
}

.management-title span {
  color: #1f7a75;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.management-title h2 {
  margin: 4px 0 0;
  color: #17324d;
}

.reminder-form {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr auto;
  gap: 10px;
  align-items: start;
}

.reminder-list {
  display: grid;
  gap: 8px;
}

.reminder-list > div {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 10px;
  align-items: center;
  padding: 11px 13px;
  border: 1px solid #e1e8ec;
  border-radius: 12px;
}

.reminder-list > div > div {
  display: grid;
}

.reminder-list strong {
  color: #17324d;
}

.reminder-list span,
.empty-copy {
  color: #637381;
  font-size: 0.8rem;
}

@media (max-width: 700px) {
  .reminder-form {
    grid-template-columns: 1fr;
  }
}
</style>
