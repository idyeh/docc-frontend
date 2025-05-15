<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">My Workflow Tasks</h2>

    <!-- Loading / Error states -->
    <div v-if="isLoading" class="text-gray-500">Loading tasks…</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>

    <table v-else class="min-w-full bg-white border">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2 border">Instance ID</th>
          <th class="px-4 py-2 border">Workflow</th>
          <th class="px-4 py-2 border">Step</th>
          <th class="px-4 py-2 border">Entity</th>
          <th class="px-4 py-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in tasks" :key="t.instance_id" class="hover:bg-gray-50">
          <td class="px-4 py-2 border">{{ t.instance_id }}</td>
          <td class="px-4 py-2 border">{{ t.workflow_name }}</td>
          <td class="px-4 py-2 border">{{ t.step }}</td>
          <td class="px-4 py-2 border">
            {{ t.entity_type }} #{{ t.entity_id }}
          </td>
          <td class="px-4 py-2 border">
            <button
              @click="gotoInstance(t.instance_id)"
              class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Open
            </button>
          </td>
        </tr>
        <tr v-if="tasks.length === 0">
          <td colspan="5" class="px-4 py-2 border text-center text-gray-500">
            No tasks pending.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios'
import { auth } from '../store/auth'

export default {
  name: 'WorkflowDashboard',
  data() {
    return {
      tasks: [],
      isLoading: false,
      error: null
    }
  },
  async created() {
    this.isLoading = true
    try {
      const { data } = await axios.get('/api/workflows/instances/tasks')
      this.tasks = data
    } catch (err) {
      if (err.response?.status === 401) {
        this.$router.push('/login')
      } else {
        this.error = err.response?.data?.msg || err.message
      }
    } finally {
      this.isLoading = false
    }
  },
  methods: {
    gotoInstance(id) {
      this.$router.push(`/workflows/instances/${id}`)
    }
  }
}
</script>
