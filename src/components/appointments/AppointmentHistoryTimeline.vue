<script setup lang="ts">
import type { AppointmentHistory } from '@/types/appointment'
import { formatAppointmentDateTime, appointmentStatusLabels } from '@/utils/appointment-formatters'

defineProps<{
  history: AppointmentHistory[]
}>()
</script>

<template>
  <div class="history">
    <h3>Historial de cambios</h3>

    <VTimeline v-if="history.length" density="compact" side="end">
      <VTimelineItem
        v-for="item in history"
        :key="item.id"
        :dot-color="item.change_type === 'cancelled' ? 'error' : 'secondary'"
        size="small"
      >
        <div class="history__item">
          <strong>
            {{ item.change_type === 'cancelled' ? 'Cita cancelada' : 'Cita reprogramada' }}
          </strong>
          <span>{{ formatAppointmentDateTime(item.created_at) }}</span>
          <p v-if="item.reason">{{ item.reason }}</p>
          <small v-if="item.new_status">
            Estado: {{ appointmentStatusLabels[item.new_status] }}
          </small>
        </div>
      </VTimelineItem>
    </VTimeline>

    <p v-else class="history__empty">Esta cita todavía no registra cambios históricos.</p>
  </div>
</template>

<style scoped>
.history h3 {
  margin: 0 0 12px;
  color: #17324d;
  font-size: 1rem;
}

.history__item {
  display: grid;
  gap: 2px;
  padding-bottom: 8px;
}

.history__item strong {
  color: #17324d;
}

.history__item span,
.history__item small,
.history__empty {
  color: #71808c;
  font-size: 0.78rem;
}

.history__item p {
  margin: 5px 0;
}

.history__empty {
  padding: 18px;
  text-align: center;
  background: #f4f7f9;
  border-radius: 12px;
}
</style>
