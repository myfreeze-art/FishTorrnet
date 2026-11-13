import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const engine = process.env.FISHTORRNET_ENGINE ?? "http://127.0.0.1:8787";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": engine },
  },
  build: {
    target: "es2022",
    assetsInlineLimit: 0,
  },
});
