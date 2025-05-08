<template>
    <form @submit.prevent="doRegister">
      <input v-model="username" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button>Register</button>
    </form>
  </template>
  <script>
  import axios from "axios";
  export default {
    data: () => ({ username: "", password: "" }),
    methods: {
      async doRegister() {
        await axios.post("/api/auth/register", { username: this.username, password: this.password });
        this.$router.push("/login");
      }
    }
  };
  </script>
  