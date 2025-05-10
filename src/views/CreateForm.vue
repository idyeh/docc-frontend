<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">
      {{ isEdit ? 'Edit Form' : 'Create New Form' }}
    </h1>

    <form @submit.prevent="saveForm">
      <!-- Form Name & Description -->
      <div class="mb-4">
        <label class="block">Form Name</label>
        <input v-model="form.name" required class="border p-2 w-full" />
      </div>
      <div class="mb-6">
        <label class="block">Description</label>
        <textarea v-model="form.description" class="border p-2 w-full"></textarea>
      </div>

      <!-- Dynamic Fields -->
      <h2 class="text-lg font-medium mb-2">Fields</h2>
      <div v-for="(fld, idx) in form.fields" :key="idx" class="mb-4 p-4 border rounded">
        <div class="flex justify-between items-center mb-2">
          <span class="font-semibold">Field {{ idx+1 }}</span>
          <button type="button" @click="removeField(idx)" class="text-red-600">Remove</button>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label>Name (key)</label>
            <input v-model="fld.name" required class="border p-1 w-full" />
          </div>
          <div>
            <label>Label</label>
            <input v-model="fld.label" required class="border p-1 w-full" />
          </div>
          <div>
            <label>Type</label>
            <select v-model="fld.field_type" class="border p-1 w-full">
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="dropdown">Dropdown</option>
              <option value="multiselect">Multi-Select</option>
              <option value="file">File Upload</option>
              <option value="richtext">Rich Text</option>
            </select>
          </div>
        </div>

        <div v-if="['dropdown','multiselect'].includes(fld.field_type)" class="mt-2">
          <label>Options (comma-separated)</label>
          <input
            v-model="fld.optionsText"
            @blur="fld.options = fld.optionsText.split(',').map(o=>o.trim())"
            placeholder="Option A, Option B"
            class="border p-1 w-full"
          />
        </div>

        <div class="mt-2">
          <label>Required</label>
          <input type="checkbox" v-model="fld.required" />
        </div>
      </div>

      <button type="button" @click="addField()" class="mb-4 bg-blue-200 px-3 py-1 rounded">
        + Add Field
      </button>

      <div>
        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded">
          {{ isEdit ? 'Update Form' : 'Create Form' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { auth } from '../store/auth';

export default {
  name: 'CreateForm',
  data() {
    return {
      form: {
        name: '',
        description: '',
        fields: []
      }
    };
  },
  computed: {
    isEdit() {
      return !!this.$route.query.id;
    }
  },
  async created() {
    if (!auth.accessToken) {
      this.$router.push('/login');
      return;
    }

    if (this.isEdit) {
      const id = this.$route.query.id;
      const res = await axios.get(`/api/forms/${id}`);
      this.form = {
        name: res.data.name,
        description: res.data.description,
        fields: res.data.fields.map(f => ({
          ...f,
          optionsText: (f.options || []).join(', ')
        }))
      };
    }
  },
  methods: {
    addField() {
      this.form.fields.push({
        name: '',
        label: '',
        field_type: 'text',
        required: false,
        options: [],
        optionsText: '',
        order: this.form.fields.length + 1
      });
    },
    removeField(idx) {
      this.form.fields.splice(idx, 1);
    },
    async saveForm() {
      try {
        console.log('Token before request:', auth.accessToken);
        // strip out optionsText
        const payload = {
          name: this.form.name,
          description: this.form.description,
          fields: this.form.fields.map(f => ({
            name: f.name,
            label: f.label,
            field_type: f.field_type,
            required: f.required,
            options: f.options,
            order: f.order
          }))
        };
    
        const config = {
          headers: {
            'Authorization': `Bearer ${auth.accessToken}`,
            'Content-Type': 'application/json'
          }
        };

        console.log('Headers:', config.headers);
    
        const url = this.isEdit 
          ? `/api/forms/${this.$route.query.id}`
          : '/api/forms/';

        const response = await axios({
          method: this.isEdit ? 'put' : 'post',
          url: url,
          data: payload,
          ...config
        });

        console.log('Response:', response);
        this.$router.push('/forms/manage');
      } catch (error) {
        console.error('Error saving form:', error.response?.data || error.message);
        // Optionally add error handling UI here
      }
    }
  }
};
</script>
