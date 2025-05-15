<!-- frontend/src/views/CreateWorkflow.vue -->
<template>
  <div class="p-6 max-w-2xl mx-auto space-y-6">
    <h2 class="text-2xl font-bold">
      {{ isEdit ? 'Edit Workflow' : 'Create New Workflow' }}
    </h2>

    <form @submit.prevent="saveWorkflow" class="space-y-4">
      <div>
        <label class="block font-medium">Name</label>
        <input
          v-model="workflow.name"
          required
          class="border p-2 w-full"
        />
      </div>
      <div>
        <label class="block font-medium">Steps (JSON array)</label>
        <textarea
          v-model="stepsJson"
          rows="8"
          class="border p-2 w-full font-mono text-sm"
          required
        ></textarea>
      </div>

      <button
        type="submit"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {{ isEdit ? 'Update Workflow' : 'Create Workflow' }}
      </button>
    </form>
  </div>
</template>

<script>
import axios from 'axios'
import { auth } from '../store/auth'

export default {
  name: 'CreateWorkflow',
  data() {
    return {
      workflow: { id: null, name: '', steps: [] },
      stepsJson: '[]'
    }
  },
  computed: {
    isEdit() {
      return Boolean(this.$route.query.id)
    }
  },
  async created() {
    const id = this.$route.query.id
    if (id) {
      const { data } = await axios.get(`/api/workflows/${id}`)
      this.workflow = data
      this.stepsJson = JSON.stringify(data.steps, null, 2)
    }
  },
  methods: {
    async saveWorkflow() {
      try {
        const steps = JSON.parse(this.stepsJson)
        const url = this.isEdit
          ? `/api/workflows/${this.workflow.id}`
          : '/api/workflows'
        const method = this.isEdit ? 'put' : 'post'
        await axios({
          method,
          url,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          data: { name: this.workflow.name, steps }
        })
        this.$router.push('/workflows/manage')
      } catch (err) {
        alert('Error: ' + (err.response?.data?.msg || err.message))
      }
    }
  }
}
</script>
