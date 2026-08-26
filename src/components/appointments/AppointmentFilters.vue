<script setup lang="ts">
import type {
  AppointmentFilters,
  AppointmentStatus,
  CustomerOption,
  EmployeeOption,
  ServiceOption,
} from '@/types/appointment'
import { appointmentStatusLabels, formatPersonName } from '@/utils/appointment-formatters'

const props = defineProps<{
  modelValue: AppointmentFilters
  customers: CustomerOption[]
  employees: EmployeeOption[]
  services: ServiceOption[]
  loading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [filters: AppointmentFilters]
  apply: []
  clear: []
  create: []
  schedules: []
  blocks: []
  reminders: []
}>()

const statusItems = Object.entries(appointmentStatusLabels).map(([value, title]) => ({
  value: value as AppointmentStatus,
  title,
}))

function updateField<K extends keyof AppointmentFilters>(
  field: K,
  value: AppointmentFilters[K],
): void {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>

<template>
  <VCard class="filters-card" variant="flat" border>
    <VCardText>
      <div class="filters-card__heading">
        <div>
          <span>FILTROS DE AGENDA</span>
          <h2>Organiza la operación diaria</h2>
        </div>
        <VBtn color="primary" prepend-icon="mdi-calendar-plus" @click="emit('create')">
          Nueva cita
        </VBtn>
      </div>

      <VRow class="mt-2">
        <VCol cols="12" sm="6" lg="2">
          <VTextField
            :model-value="modelValue.startDate"
            type="date"
            label="Fecha inicial"
            hide-details
            @update:model-value="updateField('startDate', String($event))"
          />
        </VCol>
        <VCol cols="12" sm="6" lg="2">
          <VTextField
            :model-value="modelValue.endDate"
            type="date"
            label="Fecha final"
            hide-details
            @update:model-value="updateField('endDate', String($event))"
          />
        </VCol>
        <VCol cols="12" sm="6" lg="2">
          <VSelect
            :model-value="modelValue.employeeId"
            :items="employees"
            :item-title="(item) => formatPersonName(item.first_name, item.last_name)"
            item-value="id"
            label="Profesional"
            clearable
            hide-details
            @update:model-value="updateField('employeeId', $event ?? null)"
          />
        </VCol>
        <VCol cols="12" sm="6" lg="2">
          <VSelect
            :model-value="modelValue.customerId"
            :items="customers"
            :item-title="(item) => formatPersonName(item.first_name, item.last_name)"
            item-value="id"
            label="Cliente"
            clearable
            hide-details
            @update:model-value="updateField('customerId', $event ?? null)"
          />
        </VCol>
        <VCol cols="12" sm="6" lg="2">
          <VSelect
            :model-value="modelValue.serviceId"
            :items="services"
            item-title="name"
            item-value="id"
            label="Servicio"
            clearable
            hide-details
            @update:model-value="updateField('serviceId', $event ?? null)"
          />
        </VCol>
        <VCol cols="12" sm="6" lg="2">
          <VSelect
            :model-value="modelValue.status"
            :items="statusItems"
            label="Estado"
            clearable
            hide-details
            @update:model-value="updateField('status', $event ?? null)"
          />
        </VCol>
      </VRow>

      <div class="filters-card__actions">
        <div class="filters-card__secondary-actions">
          <VBtn variant="text" prepend-icon="mdi-clock-outline" @click="emit('schedules')">
            Horarios
          </VBtn>
          <VBtn variant="text" prepend-icon="mdi-calendar-lock" @click="emit('blocks')">
            Bloqueos
          </VBtn>
          <VBtn variant="text" prepend-icon="mdi-bell-outline" @click="emit('reminders')">
            Recordatorios
          </VBtn>
        </div>
        <div>
          <VBtn variant="text" class="mr-2" @click="emit('clear')"> Limpiar </VBtn>
          <VBtn
            color="secondary"
            prepend-icon="mdi-filter-check-outline"
            :loading="loading"
            @click="emit('apply')"
          >
            Aplicar filtros
          </VBtn>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.filters-card {
  border-color: #dbe4e9;
}

.filters-card__heading,
.filters-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.filters-card__heading span {
  color: #2f918c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.filters-card__heading h2 {
  margin: 4px 0 0;
  color: #17324d;
  font-size: 1.3rem;
}

.filters-card__secondary-actions {
  display: flex;
  flex-wrap: wrap;
}

@media (max-width: 800px) {
  .filters-card__heading,
  .filters-card__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .filters-card__actions > div:last-child {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
