<template>
  <div>
    <input type="file" @change="onFile" />
  </div>
</template>
<script>
import axios from "axios";
import { auth } from "../store/auth";

export default {
  methods: {
    async onFile(e) {
      const fd = new FormData();
      fd.append("file", e.target.files[0]);
      const { data } = await axios.post("/api/uploads", fd);

      this.$emit("uploaded", data.url);
    }
  }
};
</script>
