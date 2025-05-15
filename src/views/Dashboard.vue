<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="mt-2">
          Welcome, {{ currentUser }} ({{ currentUserRole }})
        </p>
      </div>
      <button
        @click="logout"
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>

    <!-- Menu -->
    <nav class="flex space-x-4 border-b pb-2">
      <button
        @click="section = isAdmin ? 'workflows' : 'tasks'"
        :class="tabClass(isAdmin ? 'workflows' : 'tasks')"
      >
        {{ isAdmin ? 'Workflows' : 'Tasks' }}
      </button>
      <button
        v-if="isAdmin"
        @click="section = 'forms'"
        :class="tabClass('forms')"
      >Forms</button>
      <button
        v-if="isAdmin"
        @click="section = 'users'"
        :class="tabClass('users')"
      >Users</button>
    </nav>

    <!-- Content -->
    <div class="mt-6">
      <!-- Admin views -->
      <WorkflowManagement v-if="isAdmin && section === 'workflows'" />
      <FormManagement     v-if="isAdmin && section === 'forms'" />
      <UserManagement     v-if="isAdmin && section === 'users'" />
      <RoleManagement     v-if="isAdmin" />

      <!-- Non-admin views -->
      <WorkflowDashboard  v-if="!isAdmin && section === 'tasks'" />
      <FormManagement     v-if="!isAdmin && section === 'forms'" />
      <UserManagement     v-if="!isAdmin && section === 'users'" />
    </div>
  </div>
</template>
  
<script>
import { auth } from "../store/auth";
import jwtDecode from "../utils/jwtDecode";
import FormManagement from "./FormManagement.vue";
import RoleManagement from "./RoleManagement.vue";
import UserManagement from "./UserManagement.vue";
import WorkflowManagement from "./WorkflowManagement.vue";
import WorkflowDashboard from "./WorkflowDashboard.vue";

export default {
  name: "Dashboard",
  components: {
    FormManagement,
    UserManagement,
    RoleManagement,
    WorkflowManagement,
    WorkflowDashboard
  },
  
  async created() {
    this.section = this.isAdmin ? "workflows" : "tasks";
    console.log("✅ Dashboard component mounted");
  },
  data() {
    return {
      section: ""
    };
  },
  computed: {
    currentUser() {
      try {
        const payload = jwtDecode(auth.accessToken);
        return payload.username || payload.sub;
      } catch {
        return "User";
      }
    },
    currentUserRole() {
      try {
        const payload = jwtDecode(auth.accessToken);
        return payload.roles?.[0] || "User";
      } catch {
        return "User";
      }
    },
    isAdmin() {
      try {
        const roles = jwtDecode(auth.accessToken).roles || [];
        return (
          roles.includes("Administrator") ||
          roles.includes("Super Administrator")
        );
      } catch {
        return false;
      }
    }
  },
  methods: {
    logout() {
      auth.logout();
      this.$router.push('/login');
    },
    tabClass(tab) {
      const base = "px-3 py-1 rounded";
      const active = "bg-blue-600 text-white";
      const inactive = "text-gray-600 hover:text-blue-600";
      return tab === this.section ? `${base} ${active}` : `${base} ${inactive}`;
    }
  }
};
</script>