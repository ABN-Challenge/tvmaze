import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'

// Design system owns all styling/theme; catalog adds page-only utilities.
void import('tvmaze_ui/styles')
void import('tvmaze_catalog/styles')

createApp(App).use(createPinia()).use(router).mount('#app')
