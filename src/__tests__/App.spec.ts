import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import App from '@/App.vue'
import vuetify from '@/plugins/vuetify'

describe('App', () => {
  it('provides the root application container', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [vuetify],
        stubs: {
          RouterView: {
            template: '<div data-testid="router-view" />',
          },
        },
      },
    })

    expect(wrapper.find('[data-testid="router-view"]').exists()).toBe(true)
    expect(wrapper.get('.skip-link').attributes('href')).toBe('#main-content')
  })
})
