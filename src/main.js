import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import apiClient from './plugins/axios'

const app = createApp(App)

app.use(router)

app.config.globalProperties.$axios = apiClient

app.mount('#app')
