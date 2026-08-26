<script setup lang="ts">
import type { AvailabilitySlot } from '@/types/appointment'
import { formatAppointmentTime } from '@/utils/appointment-formatters'

defineProps<{
  slots: AvailabilitySlot[]
  loading: boolean
}>()

const emit = defineEmits<{
  select: [slot: AvailabilitySlot]
}>()
</script>

<template>
  <div class="availability-picker">
    <div class="availability-picker__header">
      <div>
        <strong>Horarios disponibles</strong>
        <span>Selecciona un intervalo para completar la cita.</span>
      </div>
      <VProgressCircular v-if="loading" indeterminate color="secondary" size="22" width="2" />
    </div>

    <div v-if="slots.length" class="availability-picker__slots">
      <VBtn
        v-for="slot in slots"
        :key="slot.start_at"
        size="small"
        variant="outlined"
        color="secondary"
        @click="emit('select', slot)"
      >
        {{ formatAppointmentTime(slot.start_at) }}
      </VBtn>
    </div>

    <VAlert
      v-else-if="!loading"
      type="info"
      variant="tonal"
      density="compact"
      text="Consulta la disponibilidad para visualizar los horarios libres."
    />
  </div>
</template>

<style scoped>
.availability-picker {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid #dbe4e9;
  border-radius: 14px;
}

.availability-picker__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.availability-picker__header div {
  display: grid;
  gap: 2px;
}

.availability-picker__header strong {
  color: #17324d;
}

.availability-picker__header span {
  color: #667784;
  font-size: 0.78rem;
}

.availability-picker__slots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
