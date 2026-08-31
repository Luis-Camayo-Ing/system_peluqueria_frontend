<script setup lang="ts">
import { reactive } from 'vue'

import type {
  EmployeeOption,
  ScheduleBlock,
  ScheduleBlockCreateInput,
  ScheduleBlockType,
} from '@/types/appointment'
import {
  formatAppointmentDateTime,
  formatPersonName,
  scheduleBlockLabels,
  toColombiaIso,
} from '@/utils/appointment-formatters'

interface BlockFormState {
  employeeId: string
  blockType: ScheduleBlockType
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  reason: string
}

const props = defineProps<{
  modelValue: boolean
  blocks: ScheduleBlock[]
  employees: EmployeeOption[]
  loading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: ScheduleBlockCreateInput]
  toggle: [block: ScheduleBlock]
}>()

const currentDate = new Date().toISOString().slice(0, 10)
const form = reactive<BlockFormState>({
  employeeId: '',
  blockType: 'break',
  startDate: currentDate,
  startTime: '12:00',
  endDate: currentDate,
  endTime: '13:00',
  reason: '',
})

const blockTypeItems = Object.entries(scheduleBlockLabels).map(([value, title]) => ({
  value: value as ScheduleBlockType,
  title,
}))

function employeeName(employeeId: string): string {
  const employee = props.employees.find((item) => item.id === employeeId)
  return employee ? formatPersonName(employee.first_name, employee.last_name) : employeeId
}

function submit(): void {
  if (!form.employeeId) return

  emit('save', {
    employee_id: form.employeeId,
    block_type: form.blockType,
    start_at: toColombiaIso(form.startDate, form.startTime),
    end_at: toColombiaIso(form.endDate, form.endTime),
    reason: form.reason.trim() || null,
    is_active: true,
  })
}
</script>

<template>
  <VDialog
    :model-value="modelValue"
    max-width="920"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardTitle class="management-title">
        <div>
          <span>INDISPONIBILIDAD</span>
          <h2>Bloqueos de agenda</h2>
        </div>
        <VBtn
          icon="mdi-close"
          variant="text"
          aria-label="Cerrar bloqueos de agenda"
          @click="emit('update:modelValue', false)"
        />
      </VCardTitle>

      <VCardText>
        <VForm @submit.prevent="submit">
          <VRow>
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.employeeId"
                :items="employees"
                :item-title="(item) => formatPersonName(item.first_name, item.last_name)"
                item-value="id"
                label="Profesional"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VSelect v-model="form.blockType" :items="blockTypeItems" label="Tipo de bloqueo" />
            </VCol>
            <VCol cols="6" md="3">
              <VTextField v-model="form.startDate" type="date" label="Fecha inicial" />
            </VCol>
            <VCol cols="6" md="3">
              <VTextField v-model="form.startTime" type="time" label="Hora inicial" />
            </VCol>
            <VCol cols="6" md="3">
              <VTextField v-model="form.endDate" type="date" label="Fecha final" />
            </VCol>
            <VCol cols="6" md="3">
              <VTextField v-model="form.endTime" type="time" label="Hora final" />
            </VCol>
            <VCol cols="12" md="9">
              <VTextField v-model="form.reason" label="Motivo" maxlength="500" />
            </VCol>
            <VCol cols="12" md="3">
              <VBtn
                type="submit"
                block
                size="large"
                color="secondary"
                prepend-icon="mdi-calendar-lock"
                :loading="loading"
              >
                Crear bloqueo
              </VBtn>
            </VCol>
          </VRow>
        </VForm>

        <VDivider class="my-5" />

        <div v-if="blocks.length" class="block-list">
          <div v-for="block in blocks" :key="block.id">
            <VIcon icon="mdi-calendar-lock" color="warning" />
            <div>
              <strong>
                {{ employeeName(block.employee_id) }} ·
                {{ scheduleBlockLabels[block.block_type] }}
              </strong>
              <span>
                {{ formatAppointmentDateTime(block.start_at) }} —
                {{ formatAppointmentDateTime(block.end_at) }}
              </span>
              <small v-if="block.reason">{{ block.reason }}</small>
            </div>
            <VSwitch
              :model-value="block.is_active"
              color="secondary"
              hide-details
              :aria-label="`Activar bloqueo de ${employeeName(block.employee_id)}`"
              @update:model-value="emit('toggle', block)"
            />
          </div>
        </div>

        <VAlert
          v-else
          type="info"
          variant="tonal"
          text="No existen bloqueos de agenda registrados."
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
  color: #1f7a75;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.management-title h2 {
  margin: 4px 0 0;
  color: #17324d;
}

.block-list {
  display: grid;
  gap: 9px;
}

.block-list > div {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid #e1e8ec;
  border-radius: 12px;
}

.block-list > div > div {
  display: grid;
  gap: 2px;
}

.block-list strong {
  color: #17324d;
}

.block-list span,
.block-list small {
  color: #637381;
  font-size: 0.78rem;
}
</style>
