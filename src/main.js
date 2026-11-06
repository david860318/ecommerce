import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'

// 載入 Bootstrap 5
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// 載入韓系專用客製樣式
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')