import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import {
  appointmentFixture,
  customerFixture,
  employeeFixture,
  reminderFixture,
  serviceFixture,
} from '@/__tests__/appointment.fixtures'
import vuetify from '@/plugins/vuetify'
import { useAppointmentStore } from '@/stores/appointment'
import AppointmentsView from '@/views/appointments/AppointmentsView.vue'

describe('AppointmentsView', () => {
  it('renders the calendar, indicators and appointment data', () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    const appointmentStore = useAppointmentStore()
    appointmentStore.appointments = [appointmentFixture]
    appointmentStore.total = 1
    appointmentStore.customers = [customerFixture]
    appointmentStore.employees = [employeeFixture]
    appointmentStore.services = [serviceFixture]
    appointmentStore.reminders = [reminderFixture]

    const wrapper = mount(AppointmentsView, {
      global: {
        plugins: [pinia, vuetify],
      },
    })

    expect(wrapper.get('h1').text()).toBe('Agenda y citas')
    expect(wrapper.get('[data-testid="appointments-summary"]').text()).toContain(
      'Citas del período',
    )
    expect(wrapper.text()).toContain('Laura Gómez')
    expect(wrapper.text()).toContain('Corte y peinado')
  })
})
