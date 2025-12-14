#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
let configFile = null;
let appName = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--config' && args[i + 1]) {
    configFile = args[i + 1];
    i++;
  } else if (args[i] === '--app' && args[i + 1]) {
    appName = args[i + 1];
    i++;
  }
}

if (!configFile || !appName) {
  console.error('Usage: node build.js --config <config-file> --app <app-name>');
  console.error('Example: node build.js --config example.json --app react');
  process.exit(1);
}

// Validate app exists
const appPath = path.join(__dirname, 'apps', appName);
const fs = require('fs');
if (!fs.existsSync(appPath)) {
  console.error(`Error: App "${appName}" not found at ${appPath}`);
  process.exit(1);
}

// Validate config file exists
const configPath = path.join(__dirname, 'packages', 'app-config', configFile);
if (!fs.existsSync(configPath)) {
  console.error(`Error: Config file "${configFile}" not found at ${configPath}`);
  process.exit(1);
}

console.log(`Building app: ${appName}`);
console.log(`Using config: ${configFile}`);

// Set environment variable for the config file
process.env.VITE_APP_CONFIG = configFile;

// Run turbo build for the specific app
try {
  execSync(`pnpm turbo run build --filter=${appName}`, {
    stdio: 'inherit',
    env: { ...process.env, VITE_APP_CONFIG: configFile }
  });
  console.log(`\n✓ Successfully built ${appName} with ${configFile}`);
} catch (error) {
  console.error(`\n✗ Build failed for ${appName}`);
  process.exit(1);
}
