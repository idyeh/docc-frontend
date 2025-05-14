<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">User Management</h2>
    <button
      @click="$router.push('/users/create')"
      class="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      v-if="isAdmin"
    >
      + New User
    </button>
    <table class="min-w-full bg-white border">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2 border">ID</th>
          <th class="px-4 py-2 border">Username</th>
          <th class="px-4 py-2 border">Roles</th>
          <th class="px-4 py-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
          <td class="px-4 py-2 border">{{ user.id }}</td>
          <td class="px-4 py-2 border">{{ user.username }}</td>
          <td class="px-4 py-2 border">{{ user.roles.join(', ') }}</td>
          <td class="px-4 py-2 border">
            <div class="flex space-x-2">
              <button
                @click="viewUser(user.id)"
                class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                View
              </button>
              <button
                v-if="isAdmin"
                @click="editUser(user.id)"
                class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                v-if="isAdmin"
                @click="confirmDelete(user.id)"
                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="users.length === 0">
          <td colspan="4" class="px-4 py-2 border text-center text-gray-500">
            No users found.
          </td>
        </tr>
      </tbody>
    </table>
    <div class="mt-4 flex space-x-2">
      <button
        v-if="page > 1"
        @click="fetchUsers(page - 1)"
        class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >Prev</button>
      <button
        v-if="page < totalPages"
        @click="fetchUsers(page + 1)"
        class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >Next</button>
    </div>

    <Modal
      :show="showDeleteModal"
      title="Delete User?"
      message="Are you sure you want to delete this user? This action cannot be undone."
      @cancel="showDeleteModal = false"
      @confirm="deleteUser(userToDelete)"
    />
  </div>
</template>

<script>
import axios from 'axios'
import { auth } from '../store/auth'
import Modal from '../components/Modal.vue'
import jwtDecode from '../utils/jwtDecode'

export default {
  name: 'UserManagement',
  components: { Modal },
  data() {
    return {
      users: [],
      page: 1,
      perPage: 10,
      totalPages: 1,
      showDeleteModal: false,
      userToDelete: null,
    }
  },
  computed: {
    isAdmin() {
      const roles = jwtDecode(auth.accessToken).roles || []
      return roles.includes('Administrator') || roles.includes('Super Administrator')
    }
  },
  async created() {
    if (!this.isAdmin) {
      this.$router.push('/dashboard')
      return
    }
    await this.fetchUsers(1)
  },
  methods: {
    async fetchUsers(page) {
      this.page = page
      const res = await axios.get(`/api/users?page=${page}&per_page=${this.perPage}`)
      this.users = res.data.users
      this.totalPages = res.data.total_pages
    },
    viewUser(id) {
      this.$router.push(`/users/${id}`)
    },
    editUser(id) {
      this.$router.push({ path: '/users/create', query: { id } })
    },
    confirmDelete(id) {
      this.userToDelete = id
      this.showDeleteModal = true
    },
    async deleteUser(id) {
      this.showDeleteModal = false
      try {
        await axios.delete(`/api/users/${id}`)
        await this.fetchUsers(this.page)
      } catch (err) {
        alert(err.response?.data?.msg || 'Delete failed')
      }
    }
  }
}
</script>