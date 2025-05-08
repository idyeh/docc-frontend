<template>
  <div class="p-6">
    <!-- loading state -->
    <div v-if="loading" class="text-gray-500">Loading form…</div>
    <div v-else>
      <h1 class="text-2xl font-bold mb-4">{{ form.name }}</h1>
      <p class="mb-6 text-gray-600">{{ form.description }}</p>

      <!-- actual form -->
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
            <option v-for="opt in fld.options" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <!-- multiselect -->
          <select
            v-else-if="fld.field_type==='multiselect'"
            v-model="formData[fld.name]"
            multiple
            class="border p-2 w-full"
          >
            <option v-for="opt in fld.options" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <!-- richtext -->
          <rich-text-editor
            v-else-if="fld.field_type==='richtext'"
            v-model="formData[fld.name]"
          />

          <!-- file -->
          <file-upload
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
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "DynamicForm",
  props: {
    formId: { type: Number, required: true },
    isDraft: { type: Boolean, default: false },
  },
  data() {
    return {
      loading: true,
      form: { name: "", description: "", fields: [] },
      // this will hold the actual values for each field
      formData: {}
    };
  },
  async created() {
    try {
      const res = await axios.get(`/api/forms/${this.formId}`);
      this.form = res.data;

      // initialize formData all at once (reactively)
      const init = {};
      for (const f of this.form.fields) {
        init[f.name] = f.field_type === "multiselect" ? [] : "";
      }
      this.formData = init;
    } catch (err) {
      console.error("Failed to load form:", err);
      // you might set an error message here
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async onSubmit() {
      try {
        await axios.post(`/api/forms/${this.formId}/entries`, {
          data: this.formData,
          status: this.isDraft ? "draft" : "submitted",
        });
        this.$router.push("/dashboard");
      } catch (err) {
        console.error("Submission failed:", err);
        // show user feedback
      }
    },
  },
};
</script>
