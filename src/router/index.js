import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../store/auth'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import DynamicForm from '../views/DynamicForm.vue'
import Dashboard from '../views/Dashboard.vue'
import CreateForm from '../views/CreateForm.vue'
import FormManagement from '../views/FormManagement.vue'
import CreateRole from '../views/CreateRole.vue'
import RoleManagement from '../views/RoleManagement.vue'
import CreateUser from '../views/CreateUser.vue'
import UserManagement from '../views/UserManagement.vue'
import User from '../views/User.vue'
import WorkflowManagement from '../views/WorkflowManagement.vue'
import CreateWorkflow from '../views/CreateWorkflow.vue'
import WorkflowDashboard from '../views/WorkflowDashboard.vue'
import WorkflowInstance from '../views/WorkflowInstance.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/forms/manage', component: FormManagement, meta: { requiresAuth: true } },
  { path: '/forms/create', component: CreateForm, meta: { requiresAuth: true } },
  { path: '/forms/:id', component: DynamicForm, props: route => ({ formId: Number(route.params.id) }), meta: { requiresAuth: true } },
  { path: '/roles/create', component: CreateRole, meta: { requiresAuth: true } },
  { path: '/roles/manage', component: RoleManagement, meta: { requiresAuth: true } },
  { path: '/users/manage', component: UserManagement, meta: { requiresAuth: true } },
  { path: '/users/create', component: CreateUser, meta: { requiresAuth: true } },
  { path: '/users/:id', component: User, meta: { requiresAuth: true } },
  { path: '/workflows/manage', component: WorkflowManagement, meta: { requiresAuth: true } },
  { path: '/workflows/create', component: CreateWorkflow, meta: { requiresAuth: true } },
  { path: '/workflows/:id/instances', component: WorkflowInstance, props: route => ({ workflowId: Number(route.params.id) }), meta: { requiresAuth: true } },
  { path: '/workflows/tasks', component: WorkflowDashboard, meta: { requiresAuth: true } },
  { path: '/workflows/instances/:instanceId', name: 'WorkflowInstance', component: WorkflowInstance, props: route => ({ instanceId: Number(route.params.instanceId) }), meta: { requiresAuth: true }
  },
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
