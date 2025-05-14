<template>
  <div class="p-6 max-w-2xl mx-auto space-y-8">
    <h2 class="text-2xl font-bold">{{ isEdit ? 'Edit User' : 'Create New User' }}</h2>

    <!-- Single User Form -->
    <section class="border p-6 rounded">
      <h2 class="text-xl font-semibold mb-4">Single User</h2>
      <form @submit.prevent="createSingleUser">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-medium">Username</label>
            <input v-model="single.username" required class="border p-2 w-full" />
          </div>
          <div>
            <label class="block font-medium">Password</label>
            <input v-model="single.password" type="password" required class="border p-2 w-full" />
          </div>
        </div>
        <div class="mt-4">
          <label class="block font-medium">Roles</label>
          <select v-model="single.roles" multiple class="border p-2 w-full">
            <option v-for="r in rolesList" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
        <button type="submit" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {{ isEdit ? 'Update User' : 'Create User' }}
        </button>
      </form>
    </section>

    <!-- Bulk Import -->
    <section class="border p-6 rounded">
      <h2 class="text-xl font-semibold mb-4">Bulk Import</h2>
      <div>
        <label class="block font-medium">Upload JSON or CSV</label>
        <input type="file" @change="onFileChange" accept=".json,.csv" />
      </div>
      <div v-if="importError" class="text-red-500 mt-2">{{ importError }}</div>
      <div v-if="previewData.length" class="mt-4">
        <h3 class="font-medium mb-2">Preview ({{ previewData.length }} users)</h3>
        <table class="min-w-full bg-white border">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-2 py-1 border">Username</th>
              <th class="px-2 py-1 border">Password</th>
              <th class="px-2 py-1 border">Roles</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(u, i) in previewData" :key="i" class="hover:bg-gray-50">
              <td class="px-2 py-1 border">{{ u.username }}</td>
              <td class="px-2 py-1 border">●●●●●</td>
              <td class="px-2 py-1 border">{{ u.roles.join(', ') }}</td>
            </tr>
          </tbody>
        </table>
        <button @click="importUsers" class="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Import {{ previewData.length }} Users
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios';
import { auth } from '../store/auth';

export default {
  name: 'CreateUser',
  data() {
    return {
      single: {
        username: '',
        password: '',
        roles: []
      },
      rolesList: [
        'Student',
        'Staff',
        'Administrator',
        'Super Administrator',
        'Guest'
      ],
      previewData: [],
      importError: null
    };
  },
  computed: {
    isEdit() {
      return Boolean(this.$route.query.id);
    }
  },
  async created() {
    const id = this.$route.query.id;
    if (id) {
      // Load existing user
      const { data } = await axios.get(`/api/users/${id}`);
      this.single.username = data.username;
      this.single.roles = data.roles;
    }
  },
  methods: {
    async createSingleUser() {
      try {
        const url = this.isEdit ? `/api/users/${this.$route.query.id}` : '/api/users';
        const method = this.isEdit ? 'put' : 'post';
        await axios({
          method,
          url,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          data: {
            username: this.single.username,
            password: this.single.password,
            roles: this.single.roles
          }
        });
        this.$router.push('/users/manage');
      } catch (err) {
        alert(err.response?.data?.msg || err.message);
      }
    },
    onFileChange(event) {
      this.importError = null;
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = e => {
        try {
          let arr;
          if (file.name.endsWith('.json')) {
            arr = JSON.parse(e.target.result);
          } else if (file.name.endsWith('.csv')) {
            const lines = e.target.result.trim().split(/\r?\n/);
            const headers = lines.shift().split(',').map(h => h.trim());
            arr = lines.map(line => {
              const vals = line.split(',');
              const obj = {};
              headers.forEach((h, i) => obj[h] = vals[i].trim());
              // assume roles column is semicolon-separated
              obj.roles = obj.roles ? obj.roles.split(';').map(r=>r.trim()) : [];
              return obj;
            });
          } else {
            throw new Error('Unsupported file type');
          }
          this.previewData = arr.map(u => ({
            username: u.username,
            password: u.password,
            roles: Array.isArray(u.roles) ? u.roles : [u.roles]
          }));
        } catch (err) {
          this.importError = 'Failed to parse file: ' + err.message;
        }
      };
      reader.readAsText(file);
    },
    async importUsers() {
      try {
        for (const u of this.previewData) {
          await axios.post(
            '/api/users',
            { username: u.username, password: u.password, roles: u.roles },
            { headers: { Authorization: `Bearer ${auth.accessToken}` } }
          );
        }
        alert('Imported ' + this.previewData.length + ' users');
        this.$router.push('/users/manage');
      } catch (err) {
        alert('Bulk import failed: ' + (err.response?.data?.msg || err.message));
      }
    }
  }
};
</script>
