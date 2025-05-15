<template>
  <div class="p-6 max-w-2xl mx-auto space-y-6">
    <h2 class="text-2xl font-bold">Workflow Instance</h2>

    <div v-if="instance">
      <p><strong>Workflow:</strong> {{ instance.workflow_name }} (#{{ instanceId }})</p>
      <p><strong>Current Step:</strong> {{ currentStepDef.name }}</p>

      <!-- Steps List -->
      <ol class="list-decimal ml-6 space-y-2">
        <li v-for="(step, idx) in instance.steps" :key="idx">
          <div :class="{ 'font-bold': idx === instance.current_step }">
            {{ step.name }}
          </div>

          <!-- Active Step Form -->
          <div v-if="idx === instance.current_step" class="mt-2 p-4 border rounded bg-gray-50">
            <h3 class="font-semibold mb-2">Complete Step:</h3>

            <!-- Dynamic Form if form_id is provided -->
            <DynamicForm
              v-if="step.form_id"
              :formId="step.form_id"
              :isDraft="false"
              @submitted="onFormSubmitted"
            />

            <!-- Generic input fallback -->
            <div v-else>
              <textarea
                v-model="stepInput"
                placeholder="Enter details…"
                class="border p-2 w-full"
                rows="4"
              ></textarea>
              <div class="flex space-x-2 mt-2">
                <button
                  @click="transition(true)"
                  class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  @click="transition(false)"
                  class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </li>
      </ol>

      <!-- History Logs -->
      <h2 class="text-lg font-semibold mt-8">History</h2>
      <ul class="border rounded p-4 max-h-64 overflow-y-auto space-y-2">
        <li v-for="(log, i) in instance.logs" :key="i" class="bg-white p-2 rounded">
          <p><strong>By:</strong> User {{ log.by }} at {{ formatDate(log.at) }}</p>
          <p><strong>Action:</strong> {{ log.action }}</p>
          <p v-if="log.comment"><strong>Comment:</strong> {{ log.comment }}</p>
        </li>
      </ul>
    </div>
    <div v-else class="text-gray-500">Loading instance…</div>
  </div>
</template>

<script>
import axios from 'axios'
import { auth } from '../store/auth'
import jwtDecode from '../utils/jwtDecode'
import DynamicForm from './DynamicForm.vue'

export default {
  name: 'WorkflowInstance',
  components: { DynamicForm },
  props: { instanceId: { type: Number, required: true } },
  data() {
    return {
      instance: null,
      stepInput: ''
    }
  },
  computed: {
    currentStepDef() {
      return this.instance.steps[this.instance.current_step] || {}
    }
  },
  async created() {
    await this.fetchInstance()
  },
  methods: {
    async fetchInstance() {
      const { data } = await axios.get(
        `/api/workflows/instances/${this.instanceId}`,
        { headers: { Authorization: `Bearer ${auth.accessToken}` } }
      )
      this.instance = data
    },
    async onFormSubmitted() {
      await this.transition(true)
    },
    async transition(approve) {
      try {
        await axios.post(
          `/api/workflows/instances/${this.instanceId}/transition`,
          { approve, comment: this.stepInput },
          { headers: { Authorization: `Bearer ${auth.accessToken}` } }
        )
        this.stepInput = ''
        await this.fetchInstance()
      } catch (err) {
        alert('Transition failed: ' + (err.response?.data?.msg || err.message))
      }
    },
    formatDate(iso) {
      return new Date(iso).toLocaleString()
    }
  }
}
</script>