import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  define: {
    // Inject the config file path from environment variable
    'import.meta.env.APP_CONFIG': JSON.stringify(process.env.APP_CONFIG || 'example.json')
  },
  resolve: {
    alias: {
      '@config': path.resolve(__dirname, '../../packages/app-config')
    }
  }
});
