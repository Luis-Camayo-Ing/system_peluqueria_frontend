import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import App from '../App.vue'
import vuetify from '../plugins/vuetify'

vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}

    unobserve() {}

    disconnect() {}
  },
)

describe('App', () => {
  it('renders the ERP Beauty Pro initial screen', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [vuetify],
      },
    })

    expect(wrapper.text()).toContain('ERP Beauty Pro')
    expect(wrapper.text()).toContain('Sprint 20')
    expect(wrapper.text()).toContain('El frontend del ERP Beauty Pro se inicializó correctamente.')
    expect(wrapper.find('.mdi-content-cut').exists()).toBe(true)
  })
})
