<script setup lang="ts">
import { reactive, watch } from 'vue'

import type { DashboardFilters } from '@/types/dashboard'

const props = defineProps<{
  modelValue: DashboardFilters
  loading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [filters: DashboardFilters]
  submit: []
}>()

const localFilters = reactive<DashboardFilters>({ ...props.modelValue })

const timezoneOptions = [
  'America/Bogota',
  'America/Lima',
  'America/Mexico_City',
  'America/New_York',
  'Europe/Madrid',
]

const topLimitOptions = [5, 10, 15, 20, 30, 50]

watch(
  () => props.modelValue,
  (nextValue) => Object.assign(localFilters, nextValue),
  { deep: true },
)

watch(localFilters, () => emit('update:modelValue', { ...localFilters }), { deep: true })
</script>

<template>
  <VCard class="filter-card" elevation="0">
    <VCardText class="pa-5">
      <VForm class="filter-grid" @submit.prevent="emit('submit')">
        <VTextField
          v-model="localFilters.startDate"
          label="Fecha inicial"
          type="date"
          prepend-inner-icon="mdi-calendar-start"
          density="comfortable"
          variant="outlined"
          hide-details
        />

        <VTextField
          v-model="localFilters.endDate"
          label="Fecha final"
          type="date"
          prepend-inner-icon="mdi-calendar-end"
          density="comfortable"
          variant="outlined"
          hide-details
        />

        <VSelect
          v-model="localFilters.timezone"
          :items="timezoneOptions"
          label="Zona horaria"
          prepend-inner-icon="mdi-earth"
          density="comfortable"
          variant="outlined"
          hide-details
        />

        <VSelect
          v-model="localFilters.topLimit"
          :items="topLimitOptions"
          label="Destacados"
          prepend-inner-icon="mdi-format-list-numbered"
          density="comfortable"
          variant="outlined"
          hide-details
        />

        <VBtn
          type="submit"
          color="primary"
          size="large"
          prepend-icon="mdi-filter-check-outline"
          :loading="loading"
        >
          Actualizar
        </VBtn>
      </VForm>
    </VCardText>
  </VCard>
</template>

<style scoped>
.filter-card {
  border: 1px solid #dde5ea;
  border-radius: 18px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(150px, 1fr)) auto;
  gap: 14px;
  align-items: center;
}

@media (max-width: 1100px) {
  .filter-grid {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 600px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
