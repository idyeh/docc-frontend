<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
    <p>Welcome, {{ currentUser }}!</p>

    <h2 class="mt-6 text-lg font-semibold">Available Forms</h2>
    <table class="min-w-full bg-white border">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2 border">ID</th>
          <th class="px-4 py-2 border">Name</th>
          <th class="px-4 py-2 border">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="form in forms" :key="form.id" class="hover:bg-gray-50">
          <td class="px-4 py-2 border">{{ form.id }}</td>
          <td class="px-4 py-2 border">
            <router-link :to="`/form/${form.id}`" class="text-blue-600 hover:underline">
              {{ form.name }}
            </router-link>
          </td>
          <td class="px-4 py-2 border">{{ form.description }}</td>
        </tr>
      </tbody>
    </table>

    <div class="mt-4 flex space-x-2">
      <button
        v-if="page > 1"
        @click="fetchForms(page - 1)"
        class="px-3 py-1 bg-gray-200 rounded"
      >Prev</button>
      <button
        v-if="page < totalPages"
        @click="fetchForms(page + 1)"
        class="px-3 py-1 bg-gray-200 rounded"
      >Next</button>
    </div>
  </div>
</template>
  
<script>
import axios from "axios";
import { auth } from "../store/auth";

function jwtDecode(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload));
  } catch {
    return {};
  }
}

export default {
  name: "Dashboard",
  data() {
    return {
      forms: [],
      page: 1,
      perPage: 10,
      totalPages: 1
    };
  },
  created() {
    console.log("✅ Dashboard component mounted");
    this.fetchForms(1);
  },
  computed: {
    currentUser() {
      try {
        const payload = jwtDecode(auth.accessToken);
        return payload.username || payload.sub;
      } catch {
        return "User";
      }
    }
  },
  methods: {
    async fetchForms(page) {
      this.page = page;
      const res = await axios.get(
        `/api/forms?page=${this.page}&per_page=${this.perPage}`
      );
      this.forms = res.data.forms;
      this.totalPages = res.data.total_pages;
      console.log("forms:", this.forms);
    }
  }
};
</script>