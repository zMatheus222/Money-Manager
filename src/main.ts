import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'

const app = createApp(App);
app.use(createPinia());

import { useBaseStore } from './stores/BaseStore'
const baseStore = useBaseStore();

async function initApp() {
    await baseStore.initializeStore();
    app.mount('#app');
}

initApp();
