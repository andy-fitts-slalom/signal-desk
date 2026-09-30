import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './style.css'
import App from './App.vue'
const vuetify = createVuetify({ components, directives, theme: { defaultTheme: 'signal', themes: { signal: { dark: true, colors: { background: '#10141b', surface: '#191e27', primary: '#bedbb4', secondary: '#a7b5cf', error: '#ffaaa5', warning: '#e6bf7b' } } } }, defaults: { VBtn: { style: 'text-transform: none; letter-spacing: 0', rounded: 'lg' }, VSelect: { variant: 'outlined', density: 'compact', hideDetails: true }, VCard: { rounded: 'lg', elevation: 0 } } })
createApp(App).use(vuetify).mount('#app')
