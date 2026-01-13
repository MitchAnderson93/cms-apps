import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  const configFile = env.VITE_APP_CONFIG;
  let appConfig = {};
  
  if (configFile) {
    const configPath = path.resolve(__dirname, '../../packages/app-config', configFile);
    if (fs.existsSync(configPath)) {
      appConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  }

  return {
    plugins: [react()],
    define: {
      '__APP_CONFIG__': JSON.stringify(appConfig)
    }
  };
});
