<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <p class="mt-2">Welcome, {{ currentUser }} ({{ currentUserRole }})!</p>
      </div>
      <button 
        @click="logout" 
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>

    <UserManagement v-if="isAdmin" />
    
    <FormManagement />
  </div>
</template>
  
<script>
import axios from "axios";
import { auth } from "../store/auth";
import FormManagement from "./FormManagement.vue";
import UserManagement from "./UserManagement.vue";
import jwtDecode from '../utils/jwtDecode'

export default {
  name: "Dashboard",
  components: { FormManagement, UserManagement },
  data() {
    return {
      forms: [],
      users: [],
      page: 1,
      perPage: 10,
      totalPages: 1,
      showDeleteModal: false,
      formToDelete: null,
    };
  },
  async created() {
    console.log("✅ Dashboard component mounted");
    this.fetchForms(1);
    if (this.isAdmin) {
      await this.fetchUsers();
    }
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
        const payload = jwtDecode(auth.accessToken);
        return payload.roles?.includes("Administrator") || 
               payload.roles?.includes("Super Administrator");
      } catch {
        return false;
      }
    }
  },
  methods: {
    async fetchForms(page) {
      this.page = page;
      const res = await axios.get(
        `/api/forms?page=${this.page}&per_page=${this.perPage}`
      );
      this.forms = res.data.forms;
      this.totalPages = res.data.total_pages;
      console.log("forms:", this.forms);
    },
    async fetchUsers() {
      try {
        const res = await axios.get('/api/users/');
        this.users = res.data.users;
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
    logout() {
      auth.logout();
      this.$router.push('/login');
    },
    viewForm(id) {
      this.$router.push(`/forms/${id}`);
    },
    deleteForm(id) {
      this.formToDelete = id;
      this.showDeleteModal = true;
    },
    async reallyDeleteForm() {
      this.showDeleteModal = false;
      try {
        await axios.delete(`/api/forms/${this.formToDelete}`);
        await this.fetchForms(this.page);
        this.formToDelete = null;
      } catch (error) {
        if (error.response?.status === 400) {
          alert('Cannot delete: Form has existing entries');
        } else {
          alert('Error deleting form: ' + (error.response?.data?.msg || error.message));
        }
      }
    }
  }
};
</script>