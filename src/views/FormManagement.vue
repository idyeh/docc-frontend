<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Manage Forms</h1>
    <button
      @click="$router.push('/forms/create')"
      class="mb-4 bg-green-600 text-white px-4 py-2 rounded"
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
          <td class="px-4 py-2 border space-x-2">
            <button
              @click="$router.push(`/forms/create?id=${f.id}`)"
              class="text-blue-600 hover:underline"
            >
              Edit
            </button>
            <!-- Could add a delete button here -->
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'FormManagement',
  data() {
    return {
      forms: [],
    };
  },
  async created() {
    try {
      const res = await axios.get('/api/forms?page=1&per_page=50');
      this.forms = res.data.forms;
    } catch (e) {
      console.error('Could not load forms', e);
    }
  }
};
</script>
