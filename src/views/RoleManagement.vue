<template>
  <div class="mt-8">
    <h2 class="text-lg font-semibold mb-4">Roles</h2>

    <button
      @click="$router.push('/roles/create')"
      class="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      + New Role
    </button>

    <table class="min-w-full bg-white border">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2 border">ID</th>
          <th class="px-4 py-2 border">Name</th>
          <th class="px-4 py-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="r in roles"
          :key="r.id"
          class="hover:bg-gray-50"
        >
          <td class="px-4 py-2 border">{{ r.id }}</td>
          <td class="px-4 py-2 border">{{ r.name }}</td>
          <td class="px-4 py-2 border space-x-2">
            <button
              @click="$router.push({ path: '/roles/create', query: { id: r.id } })"
              class="text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              @click="confirmDelete(r.id)"
              class="text-red-600 hover:underline"
            >
              Delete
            </button>
          </td>
        </tr>
        <tr v-if="roles.length===0">
          <td colspan="3" class="px-4 py-2 border text-center text-gray-500">
            No roles defined.
          </td>
        </tr>
      </tbody>
    </table>

    <Modal
      :show="showDeleteModal"
      title="Delete Role?"
      message="Are you sure you want to delete this role? This cannot be undone."
      @cancel="showDeleteModal = false"
      @confirm="deleteRole(roleToDelete)"
    />
  </div>
</template>

<script>
import axios from 'axios'
import { auth } from '../store/auth'
import Modal from '../components/Modal.vue'

export default {
  name: 'RoleManagement',
  components: { Modal },
  data() {
    return {
      roles: [],
      showDeleteModal: false,
      roleToDelete: null
    }
  },
  async created() {
    await this.fetchRoles()
  },
  methods: {
    async fetchRoles() {
      const { data } = await axios.get('/api/roles', {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      })
      this.roles = data.roles
    },
    confirmDelete(id) {
      this.roleToDelete = id
      this.showDeleteModal = true
    },
    async deleteRole(id) {
      this.showDeleteModal = false
      await axios.delete(`/api/roles/${id}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      })
      await this.fetchRoles()
    }
  }
}
</script>
