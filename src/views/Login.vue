<template>
    <form @submit.prevent="doLogin">
      <input v-model="username" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button>Login</button>
    </form>
  </template>
  <script>
  import { auth } from "../store/auth";
  export default {
    data: () => ({ username: "", password: "" }),
    methods: {
      async doLogin() {
        try {
          await auth.login(this.username, this.password);
          this.$router.push("/dashboard");
        } catch { alert("Invalid"); }
      }
    }
  };
  </script>
  