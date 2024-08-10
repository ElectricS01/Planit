// Import Vue, Pinia for global variables, App.vue for the frontend, and the router for changing pages

import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import router from "./router"

// Create the Vue app from the App.vue and use the router and Pinia
const pinia = createPinia()
const app = createApp(App).use(router).use(pinia)

// Mount the App.vue to the index.html
app.mount("#app")
