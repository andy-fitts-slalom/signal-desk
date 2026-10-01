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
import '@meridian/ui/fonts.css'
import '@meridian/ui/styles.css'
import {
  meridianVuetifyTheme,
  meridianVuetifyDefaults,
} from '@meridian/ui/vuetify'
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
    defaultTheme: 'meridian',
    themes: { meridian: meridianVuetifyTheme('dark') },
  },
  defaults: {
    ...meridianVuetifyDefaults,
    VSelect: { ...meridianVuetifyDefaults.VSelect, hideDetails: 'auto' },
  },
})
createApp(App).use(vuetify).mount('#app')
