import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "./",
  plugins: [vue()],
  server: {
    port: 5173
  }
});
