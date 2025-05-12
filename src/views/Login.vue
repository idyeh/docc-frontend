<template>
  <form @submit.prevent="doLogin">
    <input v-model="username" placeholder="Username" />
    <input v-model="password" type="password" placeholder="Password" />
    <button>Login</button>
  </form>
</template>

<script>
import { auth } from "../store/auth";
import axios from 'axios';

export default {
  data: () => ({ 
    username: "", 
    password: "" 
  }),
  async created() {
    // Check if token exists and is valid
    if (auth.accessToken) {
      try {
        await axios.get('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${auth.accessToken}`
          }
        });
        this.$router.push("/dashboard");
      } catch (error) {
        if (error.response?.status === 401) {
          auth.logout();
        }
      }
    }
  },
  methods: {
    async doLogin() {
      try {
        await auth.login(this.username, this.password);
        this.$router.push("/dashboard");
      } catch (error) {
        alert("Invalid credentials");
      }
    }
  }
};
</script>
  