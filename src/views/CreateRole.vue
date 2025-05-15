<template>
  <div class="p-6 max-w-md mx-auto space-y-6">
    <h2 class="text-2xl font-bold"> {{ isEdit ? 'Edit Role' : 'Create New Role' }}</h2>

    <form @submit.prevent="saveRole" class="space-y-4">
      <div>
        <label class="block font-medium">Role Name</label>
        <input
          v-model="roleName"
          type="text"
          required
          class="border p-2 w-full"
        />
      </div>

      <button
        type="submit"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {{ isEdit ? 'Update Role' : 'Create Role' }}
      </button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import { auth } from '../store/auth'

export default {
  name: 'CreateRole',
  data() {
    return {
      roleName: ''
    }
  },
  computed: {
    isEdit() {
      return !!this.$route.query.id
    },
    roleId() {
      return this.$route.query.id
    }
  },
  async created() {
    if (this.isEdit) {
      const { data } = await axios.get(`/api/roles/${this.roleId}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      })
      this.roleName = data.name
    }
  },
  methods: {
    async saveRole() {
      try {
        const url = this.isEdit
          ? `/api/roles/${this.roleId}`
          : '/api/roles'
        const method = this.isEdit ? 'put' : 'post'
        await axios({
          method,
          url,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          data: { name: this.roleName }
        })
        // go back to dashboard where RoleManagement is shown
        this.$router.push('/dashboard')
      } catch (err) {
        alert('Error saving role: ' + (err.response?.data?.msg || err.message))
      }
    }
  }
}
</script>
