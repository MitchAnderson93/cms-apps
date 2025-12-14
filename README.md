# CMS Apps Monorepo

Based on [Turborepo](https://turborepo.com/) - a high-performance build system for JavaScript and TypeScript codebases.

## Project Structure

### Apps (`apps/`)
Contains deployable applications:
- **react** - React SPA (Vite)

### Packages (`packages/`)
Shared packages used across applications:
- **@repo/app-config** - JSON configuration files that define app context (name, version, content, theme, etc.)
- **@repo/ui** - Shared React component library (replace with web components dependency)
- **@repo/eslint-config** - ESLint configurations for code linting
- **@repo/typescript-config** - Shared TypeScript configurations

## Building with Configuration

This monorepo uses a custom build system that allows you to build apps with specific configuration files.

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
2. Passes it to the specified app during build
3. Injects config values into the application

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

Apps can access these values at build time and runtime.

## GitHub Actions Workflow

The `.github/workflows/example-app.yml` workflow automatically:
1. Installs dependencies with pnpm
2. Builds the React app with the specified config
3. Publishes the build output to the `dist` branch

**Workflow trigger:**
- Push to `development` branch
- Manual workflow dispatch

## Development

Run the dev server for all apps:
```bash
pnpm dev
```

Run dev server for a specific app:
```bash
pnpm --filter react dev
```

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Enable corepack (for pnpm):
```bash
corepack enable
```

3. Build all packages:
```bash
pnpm build
```

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
