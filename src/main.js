import './assets/main.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import PrimeVue from 'primevue/config';
import Lara from '@primevue/themes/lara';
// createApp(App)
//   .use(ElementPlus)
//   .mount('#app')
const app = createApp(App);
app.use(createPinia());
app.use(ElementPlus);
app.use(router);
// app.use(PrimeVue)
app.use(PrimeVue, {
    theme: {
        preset: Lara,
    },
});
app.mount('#app');
