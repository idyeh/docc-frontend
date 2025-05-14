<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold">{{ form.name }}</h2>
        <p class="text-gray-600">{{ form.description }}</p>
      </div>
      <div v-if="isAdmin" class="space-x-2">
        <button
          @click="editForm"
          class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Edit Form
        </button>
        <button
          @click="showFormDeleteModal = true"
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete Form
        </button>
      </div>
    </div>

    <div v-if="!loading">
      <form @submit.prevent="onSubmit">
        <div v-for="fld in form.fields" :key="fld.id" class="mb-4">
          <label :for="fld.name" class="block font-medium">{{ fld.label }}</label>
          <!-- text, number, date -->
          <input
            v-if="['text','number','date'].includes(fld.field_type)"
            :type="fld.field_type"
            v-model="formData[fld.name]"
            :required="fld.required"
            class="border p-2 w-full"
          />
          <!-- dropdown -->
          <select
            v-else-if="fld.field_type==='dropdown'"
            v-model="formData[fld.name]"
            :required="fld.required"
            class="border p-2 w-full"
          >
            <option disabled value="">Please choose</option>
            <option
              v-for="opt in fld.options"
              :key="opt"
              :value="opt"
            >{{ opt }}</option>
          </select>
          <!-- multiselect -->
          <select
            v-else-if="fld.field_type==='multiselect'"
            v-model="formData[fld.name]"
            multiple
            class="border p-2 w-full"
          >
            <option
              v-for="opt in fld.options"
              :key="opt"
              :value="opt"
            >{{ opt }}</option>
          </select>
          <!-- richtext -->
          <rich-text-editor
            v-else-if="fld.field_type==='richtext'"
            v-model="formData[fld.name]"
          />
          <!-- file -->
          <FileUpload
            v-else-if="fld.field_type==='file'"
            @uploaded="url => formData[fld.name] = url"
          />
        </div>
        <button
          type="submit"
          class="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {{ isDraft ? "Save Draft" : "Submit" }}
        </button>
      </form>
    </div>
    <div v-else class="text-gray-500">Loading form…</div>

    <!-- Entries table -->
    <div class="mt-8">
      <h2 class="text-lg font-semibold mb-2">Entries</h2>
      <table class="min-w-full bg-white border">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-2 border">Entry ID</th>
            <th v-if="isAdmin" class="px-4 py-2 border">User ID</th>
            <th class="px-4 py-2 border">Data</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="e in entries"
            :key="e.id"
            class="hover:bg-gray-50 align-top"
          >
            <td class="px-4 py-2 border">{{ e.id }}</td>
            <td
              v-if="isAdmin"
              class="px-4 py-2 border"
            >{{ e.user_id }}</td>
            <td class="px-4 py-2 border whitespace-pre-wrap">
              {{ JSON.stringify(e.data, null, 2) }}
            </td>
          </tr>
          <tr v-if="entries.length === 0">
            <td
              :colspan="isAdmin ? 3 : 2"
              class="px-4 py-2 border text-center text-gray-500"
            >
              No entries yet.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete Form Confirmation Modal -->
    <Modal
      :show="showFormDeleteModal"
      title="Delete Form?"
      message="Are you sure you want to delete this form? This action cannot be undone."
      @cancel="showFormDeleteModal = false"
      @confirm="confirmDeleteForm"
    />
  </div>
</template>

<script>
import axios from "axios";
import { auth } from "../store/auth";
import FileUpload from "../components/FileUpload.vue";
import Modal from "../components/Modal.vue";
import jwtDecode from '../utils/jwtDecode';

export default {
  name: "DynamicForm",
  components: { FileUpload, Modal },
  props: {
    formId: { type: Number, required: true },
    isDraft: { type: Boolean, default: false },
  },
  data() {
    return {
      loading: false,
      form: { name: "", description: "", fields: [] },
      formData: {},
      entries: [],
      showFormDeleteModal: false,
    };
  },
  computed: {
    isAdmin() {
      const roles = jwtDecode(auth.accessToken).roles || [];
      return roles.includes("Administrator") || roles.includes("Super Administrator");
    },
  },
  async created() {
    this.loading = true;
    try {
      // load form definition
      const [{ data: formDef }, { data: entryResp }] = await Promise.all([
        axios.get(`/api/forms/${this.formId}`),
        axios.get(
          this.isAdmin
            ? `/api/forms/${this.formId}/entries`
            : `/api/forms/${this.formId}/entries/mine`
        )
      ]);
      this.form = formDef;
      this.entries = entryResp;

      // init formData
      const init = {};
      for (const f of this.form.fields) {
        init[f.name] = f.field_type === "multiselect" ? [] : "";
      }
      this.formData = init;
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    onSubmit: async function () {
      try {
        await axios.post(`/api/forms/${this.formId}/entries`, {
          data: this.formData,
          status: this.isDraft ? "draft" : "submitted",
        });
        // reload entries
        const resp = await axios.get(
          this.isAdmin
            ? `/api/forms/${this.formId}/entries`
            : `/api/forms/${this.formId}/entries/mine`
        );
        this.entries = resp.data;
      } catch (err) {
        console.error("Submission error:", err);
      }
    },
    editForm() {
      this.$router.push({ path: "/forms/create", query: { id: this.formId } });
    },
    async confirmDeleteForm() {
      this.showFormDeleteModal = false;
      try {
        await axios.delete(`/api/forms/${this.formId}`);
        this.$router.push("/forms/manage");
      } catch (err) {
        console.error("Delete form failed:", err);
        alert(err.response?.data?.msg || err.message);
      }
    }
  }
};
</script>
