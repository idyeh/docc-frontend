import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8888,
    proxy: {
      // any request to /api/... will be forwarded to Flask
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        // rewrite: path => path.replace(/^\/api/, "/api")
      }
    }
  }
});
