# CMS web apps monorepo 

Based on [Turborepo](https://turborepo.com/) - a high-performance build system for JavaScript and TypeScript codebases.

## Project Structure

### Apps (`apps/`)
Contains deployable applications:
- **react** - React SPA (Vite)

### Packages (`packages/`)
Shared packages used across applications:
- **@repo/app-config** - JSON configuration files that define app context (name, version, content, theme, etc.)
- **@repo/react-ui** - Shared React component library (replace with web components dependency)
- **@repo/vue-ui** - Shared React component library (replace with web components dependency)
- **@repo/eslint-config** - ESLint configurations for code linting
- **@repo/typescript-config** - Shared TypeScript configurations

## Prerequisites

- **Node.js** >= 18
- **pnpm** 9.0.0 or later

Install pnpm if you don't have it:
https://pnpm.io/installation

## Setup & Local Development

1. Install dependencies:
```bash
pnpm install
```

2. Create `.env` file in your app directory (not committed to git):
```bash
# apps/react-client/.env
VITE_APP_CONFIG=example.json
```

This tells the dev server which config to use locally (local only). The config is loaded and injected when Vite starts.

3. Start the dev server:
```bash
# Run dev server for a specific app
pnpm --filter react dev

# Or run dev server for all apps
pnpm dev
```

## Building with Configuration

This monorepo uses a custom build system that allows you to build apps with specific configuration files. **Config is injected at build time** and compiled into the application bundle.

### Build Command

```bash
pnpm build:app --config <config-file> --app <app-name>
```

**Example:**
```bash
pnpm build:app --config example.json --app react
```

This command:
1. Loads the specified config from `packages/app-config/`
2. Injects config values at build time using Vite's `define` feature
3. Compiles the config directly into the application bundle (no runtime loading)

### Configuration Files

Config files live in `packages/app-config/` and define app context:

```json
{
  "appName": "Example App",
  "version": "1.0.0",
  "theme": {
    "customClass": ""
  }
}
```

## GitHub Actions Workflow

The `.github/workflows/example-app.yml` workflow demonstrates how to build and deploy with specific configs:

```yaml
- name: Install + build
  run: |
    ...
    pnpm install
    pnpm build:app --config example.json --app react
```

**What happens:**
1. Workflow specifies which config file to use (`example.json`)
2. Build script sets `VITE_APP_CONFIG` environment variable
3. Vite reads the config file and injects it at build time
4. Final bundle contains the baked-in config (no `.env` or runtime loading)
5. Build output is published to the `dist` branch

**Multiple Deployments:**
Different workflows can use different configs (e.g., `staging.json`, `production.json`) to create separate builds for different environments.

**Workflow triggers (example only):**
- Push to `development` branch
- Manual workflow dispatch

## Documentation

### Component Schemas
**[Component Schema Documentation](COMPONENT_SCHEMAS.md)** - Complete reference for all supported content component types, including:
- Component type schemas and properties
- Configuration examples
- Conditional visibility rules
- Field dependencies
- Best practices

All component types used in the `pages[].content[]` configuration arrays are documented with full schema definitions and examples.

## Useful Links

Learn more about Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
