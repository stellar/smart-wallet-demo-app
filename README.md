# Stellar Smart Wallet Demo

This monorepo provides a complete, modular demo application for a Stellar-based smart wallet. It includes everything you need to explore and extend a full-stack Stellar wallet solution. From backend services and frontend interface to smart contracts. While not a white-label solution, it serves as a solid foundation for developers who want to build their own Stellar-powered wallets.

## Monorepo Structure

This repository is organized as follows:

```
.
├── [apps/](./apps)
│   ├── [backend/](./apps/backend)               # Node.js backend (API)
│   ├── [web/](./apps/web)                       # React-based web application
├── [contracts/](./contracts)                    # Smart contracts (e.g., Soroban)
├── [Makefile](./Makefile)                       # Project-level build and dev commands
├── [docker-compose.yml](./docker-compose.yml)   # Container orchestration
└── ...
```

## Requirements

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/) v22+
- [NPM](https://www.npmjs.com/)
- [Make](https://www.gnu.org/software/make/)

## Quick Start

To get started with the full environment locally using Docker:

```bash
make docker-setup-dev
make docker-start-dev
```

### Environment Variables

Make sure to configure your environment variables before running the apps:

- Backend

  - `apps/backend/src/config/.env.example` (used as a reference)
  - `apps/backend/src/config/.env.development`
  - `apps/backend/src/config/.env.test`

- Web
  - `apps/web/src/config/.env.example` (used as a reference)
  - `apps/web/src/config/.env.local`
  - `apps/web/src/config/.env.test`

## Running Apps Individually

You can also work on a specific app (e.g., backend or web) without running the full stack.

### Example: Running the Backend Only

```bash
make docker-setup-dev PROFILE=backend
make docker-start-dev PROFILE=backend
```

### Example: Running the Web App Only

```bash
make docker-setup-dev PROFILE=web
make docker-start-dev PROFILE=web
```

## Local Development Commands

All workspace apps support the following `make` commands:

| Command           | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| `setup-dev`       | Installs dependencies and performs initial setup for the app |
| `clean-setup-dev` | Removes previous builds and sets up a clean dev environment  |
| `clean-setup`     | Cleans previous installations and prepares for new setup     |
| `build`           | Builds the selected app                                      |
| `start`           | Starts the app in production mode                            |
| `start-dev`       | Starts the app in development mode                           |
| `start-staging`   | Starts the app using staging configuration                   |
| `test`            | Runs tests for the selected app                              |
| `test-coverage`   | Runs tests and shows coverage                                |
| `serve`           | Runs a local static server (**only for web**)                |
| `storybook`       | Runs Storybook (**only for web**)                            |
| `build-storybook` | Builds the Storybook static site (**only for web**)          |
| `lint`            | Runs ESLint on the codebase                                  |
| `lint-fix`        | Auto-fixes linting issues                                    |
| `type-check`      | Runs TypeScript type checking                                |
| `format-code`     | Formats the code using Prettier                              |

Use these commands by specifying the `APP` variable. For example:

```bash
make build APP=web
make test APP=backend
```

## Smart Contracts

The `contracts` folder contains Stellar smart contracts (e.g., Soroban) used by the backend or client apps. Instructions for compiling, testing, and deploying contracts are documented in that directory’s README.
