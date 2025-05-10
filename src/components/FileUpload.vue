<template>
  <div>
    <input type="file" @change="onFile" />
  </div>
</template>
<script>
import axios from "axios";
export default {
  methods: {
    async onFile(e) {
      const fd = new FormData();
      fd.append("file", e.target.files[0]);
      const { data } = await axios.post("/api/uploads", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      this.$emit("uploaded", data.url);
    }
  }
};
</script>
