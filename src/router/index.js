import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../store/auth'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import DynamicForm from '../views/DynamicForm.vue'
import Dashboard from '../views/Dashboard.vue'
import CreateForm from '../views/CreateForm.vue'
import FormManagement from '../views/FormManagement.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/forms/manage', component: FormManagement, meta: { requiresAuth: true } },
  { path: '/forms/create', component: CreateForm, meta: { requiresAuth: true } },
  { path: '/form/:id', component: DynamicForm, props: route => ({ formId: Number(route.params.id) }), meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(), 
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!auth.accessToken) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
