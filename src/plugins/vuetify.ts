import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'beautyProTheme',
    themes: {
      beautyProTheme: {
        dark: false,
        colors: {
          background: '#F4F7F9',
          surface: '#FFFFFF',
          primary: '#17324D',
          secondary: '#2F918C',
          success: '#2E7D32',
          warning: '#ED6C02',
          error: '#C62828',
          info: '#0277BD',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
      elevation: 0,
    },
    VCard: {
      rounded: 'xl',
    },
    VTextField: {
      density: 'comfortable',
    },
  },
})
