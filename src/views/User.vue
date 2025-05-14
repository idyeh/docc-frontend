<template>
  <div class="p-6 max-w-md mx-auto">
    <h2 class="text-2xl font-bold mb-4">User Profile</h2>
    <div v-if="user">
      <div v-if="canEdit" class="mt-4 flex space-x-2">
        <button
          @click="editSelf"
          class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Edit
        </button>
        <button
          v-if="isAdmin"
          @click="confirmDelete(user.id)"
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete
        </button>
      </div>
      <p><strong>ID:</strong> {{ user.id }}</p>
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Roles:</strong> {{ user.roles.join(', ') }}</p>
    </div>
    <div v-else class="text-gray-500">Loading user…</div>

    <Modal
      :show="showDeleteModal"
      title="Delete User?"
      message="This will permanently delete the user. Continue?"
      @cancel="showDeleteModal = false"
      @confirm="deleteSelf(user.id)"
    />
  </div>
</template>

<script>
import axios from 'axios'
import { auth } from '../store/auth'
import Modal from '../components/Modal.vue'
import jwtDecode from '../utils/jwtDecode'

export default {
  name: 'User',
  components: { Modal },
  data() {
    return {
      user: null,
      showDeleteModal: false,
    }
  },
  computed: {
    currentUserId() {
      return jwtDecode(auth.accessToken).sub
    },
    isAdmin() {
      const roles = jwtDecode(auth.accessToken).roles || []
      return roles.includes('Administrator') || roles.includes('Super Administrator')
    },
    canEdit() {
      const id = parseInt(this.$route.params.id)
      return this.isAdmin || id === this.currentUserId
    }
  },
  async created() {
    const id = this.$route.params.id
    const res = await axios.get(`/api/users/${id}`)
    this.user = res.data
  },
  methods: {
    editSelf() {
      this.$router.push({ path: '/users/create', query: { id: this.$route.params.id } })
    },
    confirmDelete(id) {
      this.showDeleteModal = true
    },
    async deleteSelf(id) {
      this.showDeleteModal = false
      try {
        await axios.delete(`/api/users/${id}`)
        this.$router.push('/users/manage')
      } catch (err) {
        alert(err.response?.data?.msg || 'Delete failed')
      }
    }
  }
}
</script>
