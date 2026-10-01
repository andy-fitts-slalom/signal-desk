import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import {
  VApp,
  VMain,
  VBtn,
  VIcon,
  VAlert,
  VSelect,
  VCard,
  VCardText,
  VDialog,
  VSnackbar,
} from 'vuetify/components'
import { mdi } from 'vuetify/iconsets/mdi-svg'
import { signalIcons } from './icons'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@vesper/ui/fonts.css'
import '@vesper/ui/styles.css'
import { vesperVuetifyTheme, vesperVuetifyDefaults } from '@vesper/ui/vuetify'
import './style.css'
import App from './App.vue'
const vuetify = createVuetify({
  components: {
    VApp,
    VMain,
    VBtn,
    VIcon,
    VAlert,
    VSelect,
    VCard,
    VCardText,
    VDialog,
    VSnackbar,
  },
  directives,
  icons: { defaultSet: 'mdi', aliases: signalIcons, sets: { mdi } },
  theme: {
    defaultTheme: 'vesper',
    themes: { vesper: vesperVuetifyTheme('dark') },
  },
  defaults: {
    ...vesperVuetifyDefaults,
    VSelect: { ...vesperVuetifyDefaults.VSelect, hideDetails: 'auto' },
  },
})
createApp(App).use(vuetify).mount('#app')
