<script setup lang="ts">
import { reactive } from 'vue'

import type { EmployeeOption, WorkSchedule, WorkScheduleCreateInput } from '@/types/appointment'
import { formatPersonName, weekdayLabels } from '@/utils/appointment-formatters'

const props = defineProps<{
  modelValue: boolean
  schedules: WorkSchedule[]
  employees: EmployeeOption[]
  loading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: WorkScheduleCreateInput]
  toggle: [schedule: WorkSchedule]
}>()

const form = reactive<WorkScheduleCreateInput>({
  employee_id: '',
  weekday: 0,
  start_time: '08:00',
  end_time: '18:00',
  is_active: true,
})

const weekdayItems = weekdayLabels.map((title, value) => ({ title, value }))

function employeeName(employeeId: string): string {
  const employee = props.employees.find((item) => item.id === employeeId)

  return employee ? formatPersonName(employee.first_name, employee.last_name) : employeeId
}

function submit(): void {
  if (!form.employee_id || form.end_time <= form.start_time) return
  emit('save', { ...form })
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="880"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="management-title">
        <div>
          <span>CONFIGURACIÓN SEMANAL</span>
          <h2>Horarios laborales</h2>
        </div>
        <VBtn
          icon="mdi-close"
          variant="text"
          aria-label="Cerrar horarios laborales"
          @click="emit('update:modelValue', false)"
        />
      </VCardTitle>

      <VCardText>
        <VForm class="schedule-form" @submit.prevent="submit">
          <VSelect
            v-model="form.employee_id"
            :items="employees"
            :item-title="(item) => formatPersonName(item.first_name, item.last_name)"
            item-value="id"
            label="Profesional"
          />
          <VSelect v-model="form.weekday" :items="weekdayItems" label="Día de la semana" />
          <VTextField v-model="form.start_time" type="time" label="Inicio" />
          <VTextField v-model="form.end_time" type="time" label="Fin" />
          <VBtn type="submit" color="secondary" prepend-icon="mdi-plus" :loading="loading">
            Agregar
          </VBtn>
        </VForm>

        <VDivider class="my-5" />

        <div v-if="schedules.length" class="management-list">
          <div v-for="schedule in schedules" :key="schedule.id">
            <VIcon icon="mdi-clock-outline" color="secondary" />
            <div>
              <strong>{{ employeeName(schedule.employee_id) }}</strong>
              <span>
                {{ weekdayLabels[schedule.weekday] }} · {{ schedule.start_time.slice(0, 5) }}–{{
                  schedule.end_time.slice(0, 5)
                }}
              </span>
            </div>
            <VSwitch
              :model-value="schedule.is_active"
              color="secondary"
              hide-details
              :aria-label="`Activar horario de ${employeeName(schedule.employee_id)}`"
              @update:model-value="emit('toggle', schedule)"
            />
          </div>
        </div>

        <VAlert
          v-else
          type="info"
          variant="tonal"
          text="Todavía no se han registrado horarios laborales."
        />
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
  color: #2f918c;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.management-title h2 {
  margin: 4px 0 0;
  color: #17324d;
}

.schedule-form {
  display: grid;
  grid-template-columns: 2fr 1.3fr 1fr 1fr auto;
  gap: 10px;
  align-items: start;
}

.management-list {
  display: grid;
  gap: 8px;
}

.management-list > div {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid #e1e8ec;
  border-radius: 12px;
}

.management-list > div > div {
  display: grid;
}

.management-list strong {
  color: #17324d;
}

.management-list span {
  color: #71808c;
  font-size: 0.8rem;
}

@media (max-width: 850px) {
  .schedule-form {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 520px) {
  .schedule-form {
    grid-template-columns: 1fr;
  }
}
</style>
