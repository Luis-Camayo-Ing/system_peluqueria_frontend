<script setup lang="ts">
import type { AppointmentStatus } from '@/types/appointment'
import { appointmentStatusColors, appointmentStatusLabels } from '@/utils/appointment-formatters'

defineProps<{
  status: AppointmentStatus
}>()
</script>

<template>
  <VChip :color="appointmentStatusColors[status]" size="small" variant="tonal" label>
    {{ appointmentStatusLabels[status] }}
  </VChip>
</template>
