import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import DynamicForm from '../views/DynamicForm.vue'
import Dashboard from "../views/Dashboard.vue";

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: "/dashboard", component: Dashboard },
    { path: '/form/:id', component: DynamicForm, props: route => ({ formId: Number(route.params.id) }) }
]

const router = createRouter({
  history: createWebHistory(), 
  routes
})

export default router
