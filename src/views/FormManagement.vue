<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold">Available Forms</h2>
    <button
      @click="$router.push('/forms/create')"
      class="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      v-if="isAdmin"
    >
      + New Form
    </button>
    <table class="min-w-full bg-white border">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2 border">ID</th>
          <th class="px-4 py-2 border">Name</th>
          <th class="px-4 py-2 border">Description</th>
          <th class="px-4 py-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="f in forms" :key="f.id" class="hover:bg-gray-50">
          <td class="px-4 py-2 border">{{ f.id }}</td>
          <td class="px-4 py-2 border">{{ f.name }}</td>
          <td class="px-4 py-2 border">{{ f.description }}</td>
          <td class="px-4 py-2 border">
            <div class="flex space-x-2">
              <!-- View always visible -->
              <button
                @click="viewForm(f.id)"
                class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                View
              </button>
              <!-- Edit and Delete only for admins -->
              <template v-if="isAdmin">
                <button
                  @click="editForm(f.id)"
                  class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  @click="confirmDelete(f.id)"
                  class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </template>
            </div>
          </td>
        </tr>
        <tr v-if="forms.length === 0">
          <td colspan="4" class="px-4 py-2 text-center text-gray-500 border">
            No forms available.
          </td>
        </tr>
      </tbody>
    </table>
    <!-- pagination -->
    <div class="mt-4 flex space-x-2">
      <button
        v-if="page > 1"
        @click="fetchForms(page - 1)"
        class="px-3 py-1 bg-gray-200 rounded"
      >Prev</button>
      <button
        v-if="page < totalPages"
        @click="fetchForms(page + 1)"
        class="px-3 py-1 bg-gray-200 rounded"
      >Next</button>
    </div>

    <!-- Delete Confirmation Modal -->
    <Modal
      :show="showDeleteModal"
      title="Delete Form?"
      message="Are you sure you want to delete this form? This action cannot be undone."
      @cancel="showDeleteModal = false"
      @confirm="deleteForm(formToDelete)"
    />
  </div>
</template>

<script>
import axios from 'axios'
import { auth } from '../store/auth'
import Modal from '../components/Modal.vue'
import jwtDecode from '../utils/jwtDecode'

export default {
  name: 'FormManagement',
  components: { Modal },
  data() {
    return {
      forms: [],
      page: 1,
      perPage: 10,
      totalPages: 1,
      showDeleteModal: false,
      formToDelete: null,
    }
  },
  computed: {
    isAdmin() {
      const roles = jwtDecode(auth.accessToken).roles || []
      return roles.includes('Administrator') || roles.includes('Super Administrator')
    }
  },
  async created() {
    await this.fetchForms(1)
  },
  methods: {
    async fetchForms(page) {
      this.page = page
      const res = await axios.get(`/api/forms?page=${page}&per_page=${this.perPage}`)
      this.forms = res.data.forms
      this.totalPages = res.data.total_pages
    },
    viewForm(id) {
      this.$router.push(`/forms/${id}`)
    },
    editForm(id) {
      this.$router.push({ path: '/forms/create', query: { id } })
    },
    confirmDelete(id) {
      this.formToDelete = id
      this.showDeleteModal = true
    },
    async deleteForm(id) {
      this.showDeleteModal = false
      try {
        await axios.delete(`/api/forms/${id}`)
        await this.fetchForms(this.page)
      } catch (err) {
        alert(err.response?.data?.msg || 'Delete failed')
      }
    }
  }
}
</script>
