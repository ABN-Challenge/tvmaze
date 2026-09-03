import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'

// Design system owns all styling/theme.
void import('tvmaze_ui/styles')

createApp(App).use(createPinia()).use(router).mount('#app')
