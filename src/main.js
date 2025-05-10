import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import { auth } from './store/auth'
import './style.css'

axios.interceptors.request.use((config) => {
  console.log('Token:', auth.accessToken);
  if (auth.accessToken) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
}, err => Promise.reject(err))

axios.interceptors.request.use(request => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
  });
  return request;
});

axios.interceptors.response.use(
  response => response,
  error => {
    console.error('Request failed:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

createApp(App)
  .use(router)
  .mount('#app')
