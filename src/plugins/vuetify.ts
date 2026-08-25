import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createVuetify } from 'vuetify'

const erpBeautyProTheme = {
  dark: false,
  colors: {
    background: '#F5F7FA',
    surface: '#FFFFFF',
    primary: '#17324D',
    secondary: '#2F918C',
    success: '#2E7D32',
    warning: '#ED6C02',
    error: '#D32F2F',
    info: '#0288D1',
  },
}

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'erpBeautyProTheme',
    themes: {
      erpBeautyProTheme,
    },
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
    },
    VCard: {
      rounded: 'lg',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'comfortable',
    },
  },
})

export default vuetify
