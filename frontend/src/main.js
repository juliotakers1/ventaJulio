import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Import the router
import './style.css'
import { createPinia } from 'pinia' // Import Pinia

const app = createApp(App)
const pinia = createPinia() // Create Pinia instance

app.use(router) // Use the router
app.use(pinia) // Use Pinia

app.mount('#app')
