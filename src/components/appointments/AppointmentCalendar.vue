<script setup lang="ts">
import { computed } from 'vue'

import AppointmentStatusChip from '@/components/appointments/AppointmentStatusChip.vue'
import type {
  Appointment,
  CustomerOption,
  EmployeeOption,
  ServiceOption,
} from '@/types/appointment'
import {
  formatAppointmentTime,
  formatCalendarDate,
  formatPersonName,
  getAppointmentDateKey,
} from '@/utils/appointment-formatters'

const props = defineProps<{
  appointments: Appointment[]
  customers: CustomerOption[]
  employees: EmployeeOption[]
  services: ServiceOption[]
}>()

const emit = defineEmits<{
  select: [appointmentId: string]
}>()

const customerNames = computed(
  () =>
    new Map(
      props.customers.map((customer) => [
        customer.id,
        formatPersonName(customer.first_name, customer.last_name),
      ]),
    ),
)

const employeeNames = computed(
  () =>
    new Map(
      props.employees.map((employee) => [
        employee.id,
        formatPersonName(employee.first_name, employee.last_name),
      ]),
    ),
)

const serviceNames = computed(
  () => new Map(props.services.map((service) => [service.id, service.name])),
)

const groupedAppointments = computed(() => {
  const groups = new Map<string, Appointment[]>()

  for (const appointment of props.appointments) {
    const dateKey = getAppointmentDateKey(appointment.start_at)
    const items = groups.get(dateKey) ?? []
    items.push(appointment)
    groups.set(dateKey, items)
  }

  return Array.from(groups.entries())
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
    .map(([date, items]) => ({
      date,
      items: items.sort((first, second) => first.start_at.localeCompare(second.start_at)),
    }))
})
</script>

<template>
  <VCard class="calendar-card" variant="flat" border>
    <VCardTitle class="calendar-card__title">
      <div>
        <span class="eyebrow">CALENDARIO OPERATIVO</span>
        <h2>Agenda del período</h2>
      </div>
      <VChip color="secondary" variant="tonal"> {{ appointments.length }} citas </VChip>
    </VCardTitle>

    <VCardText>
      <div v-if="groupedAppointments.length" class="calendar-grid">
        <section v-for="group in groupedAppointments" :key="group.date" class="calendar-day">
          <header>
            <VIcon icon="mdi-calendar-blank-outline" color="secondary" />
            <strong>{{ formatCalendarDate(group.date) }}</strong>
            <span>{{ group.items.length }}</span>
          </header>

          <button
            v-for="appointment in group.items"
            :key="appointment.id"
            class="appointment-card"
            type="button"
            @click="emit('select', appointment.id)"
          >
            <div class="appointment-card__time">
              <strong>{{ formatAppointmentTime(appointment.start_at) }}</strong>
              <span>{{ formatAppointmentTime(appointment.end_at) }}</span>
            </div>
            <div class="appointment-card__information">
              <strong>
                {{ customerNames.get(appointment.customer_id) ?? 'Cliente sin cargar' }}
              </strong>
              <span>
                {{ serviceNames.get(appointment.service_id) ?? 'Servicio' }}
              </span>
              <small>
                {{ employeeNames.get(appointment.employee_id) ?? 'Profesional' }}
              </small>
            </div>
            <AppointmentStatusChip :status="appointment.status" />
          </button>
        </section>
      </div>

      <div v-else class="calendar-empty" data-testid="appointments-empty">
        <VIcon icon="mdi-calendar-check-outline" size="54" />
        <h3>No hay citas para mostrar</h3>
        <p>Ajusta los filtros o registra una nueva cita.</p>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.calendar-card {
  border-color: #dbe4e9;
}

.calendar-card__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 10px;
}

.calendar-card__title h2 {
  margin: 4px 0 0;
  color: #17324d;
  font-size: 1.35rem;
}

.eyebrow {
  color: #1f7a75;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.calendar-day {
  overflow: hidden;
  border: 1px solid #dbe4e9;
  border-radius: 16px;
}

.calendar-day > header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 13px 14px;
  color: #17324d;
  background: #f2f7f8;
  text-transform: capitalize;
}

.calendar-day > header span {
  display: grid;
  width: 26px;
  height: 26px;
  color: #1f7a75;
  background: #ffffff;
  border-radius: 50%;
  font-size: 0.76rem;
  font-weight: 700;
  place-items: center;
}

.appointment-card {
  display: grid;
  width: 100%;
  grid-template-columns: 66px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 13px 14px;
  color: inherit;
  text-align: left;
  background: #ffffff;
  border: 0;
  border-top: 1px solid #edf1f3;
  cursor: pointer;
}

.appointment-card:hover {
  background: #f8fbfc;
}

.appointment-card__time,
.appointment-card__information {
  display: grid;
}

.appointment-card__time strong,
.appointment-card__information strong {
  color: #17324d;
}

.appointment-card__time span,
.appointment-card__information span,
.appointment-card__information small {
  color: #667784;
}

.appointment-card__information small {
  margin-top: 2px;
}

.calendar-empty {
  display: grid;
  min-height: 310px;
  color: #637381;
  text-align: center;
  place-content: center;
}

.calendar-empty h3 {
  margin: 12px 0 2px;
  color: #17324d;
}

.calendar-empty p {
  margin: 0;
}

@media (max-width: 620px) {
  .appointment-card {
    grid-template-columns: 58px 1fr;
  }

  .appointment-card :deep(.v-chip) {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
