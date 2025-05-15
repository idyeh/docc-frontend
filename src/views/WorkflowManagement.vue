<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Workflow Definitions</h2>

    <button
      @click="$router.push('/workflows/create')"
      class="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      + New Workflow
    </button>

    <table class="min-w-full bg-white border">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2 border">ID</th>
          <th class="px-4 py-2 border">Name</th>
          <th class="px-4 py-2 border">Steps</th>
          <th class="px-4 py-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="w in workflows" :key="w.id" class="hover:bg-gray-50">
          <td class="px-4 py-2 border">{{ w.id }}</td>
          <td class="px-4 py-2 border">{{ w.name }}</td>
          <td class="px-4 py-2 border">{{ w.steps.length }}</td>
          <td class="px-4 py-2 border">
            <div class="flex space-x-2">
              <button
                @click="$router.push({ path:'/workflows/create', query:{ id: w.id }})"
                class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                @click="confirmDelete(w.id)"
                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
              <button
                @click="viewInstances(w.id)"
                class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                View Instances
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="workflows.length === 0">
          <td colspan="4" class="px-4 py-2 text-center text-gray-500 border">
            No workflows available.
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Instances Table (only shown after clicking View) -->
    <div v-if="instancesForDefinition.length">
      <h2 class="text-xl font-semibold mb-2">
        Instances for Workflow #{{ selectedWfId }}
      </h2>
      <table class="min-w-full bg-white border">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 border">Instance ID</th>
            <th class="px-4 py-2 border">User ID</th>
            <th class="px-4 py-2 border">Step</th>
            <th class="px-4 py-2 border">State</th>
            <th class="px-4 py-2 border">Created At</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="inst in instancesForDefinition"
            :key="inst.instance_id"
            class="hover:bg-gray-50"
          >
            <td class="px-4 py-2 border">{{ inst.instance_id }}</td>
            <td class="px-4 py-2 border">{{ inst.user_id }}</td>
            <td class="px-4 py-2 border">{{ inst.current_step }}</td>
            <td class="px-4 py-2 border">{{ inst.state }}</td>
            <td class="px-4 py-2 border">{{ formatDate(inst.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal
      :show="showDeleteModal"
      title="Delete Workflow?"
      message="Are you sure? This cannot be undone."
      @cancel="showDeleteModal = false"
      @confirm="deleteDefinition(defToDelete)"
    />
  </div>
</template>

<script>
import axios from 'axios'
import { auth } from '../store/auth'
import Modal from '../components/Modal.vue'

export default {
  name: 'WorkflowManagement',
  components: { Modal },
  data() {
    return {
      workflows: [],
      showDeleteModal: false,
      defToDelete: null,
      selectedWfId: null,
      instancesForDefinition: []
    }
  },
  async created() {
    await this.loadDefinitions()
  },
  methods: {
    async loadDefinitions() {
      const { data } = await axios.get('/api/workflows', {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      })
      this.workflows = data
      this.selectedWfId = null
      this.instancesForDefinition = []
    },
    confirmDelete(id) {
      this.defToDelete = id
      this.showDeleteModal = true
    },
    async deleteDefinition(id) {
      try {
        await axios.delete(`/api/workflows/${id}`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        })
        this.showDeleteModal = false
        await this.loadDefinitions()
      } catch (err) {
        alert('Delete failed: ' + (err.response?.data?.msg || err.message))
      }
    },
    async viewInstances(wfid) {
      this.selectedWfId = wfid
      const { data } = await axios.get(`/api/workflows/${wfid}/instances`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      })
      this.instancesForDefinition = data.instances
    },
    formatDate(iso) {
      return iso ? new Date(iso).toLocaleString() : '-'
    }
  }
}
</script>
