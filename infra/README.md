# How to deploy the whole infrastructure

## Getting started

### Clone the repository with submodules

This project uses git submodules to include external dependencies. Clone the repository with submodules:

```bash
git clone --recurse-submodules <repository-url>
```

If you've already cloned the repository without submodules, initialize them:

```bash
git submodule update --init --recursive
```

### Environment setup

Copy envs from `infra/.env.example` to `infra/.env`:

```bash
cp infra/.env.example infra/.env
```

Setting up local resources:

```bash
npm run setup-assets --workspace=apps/web
npm run setup-content --workspace=apps/web
```

## Running the infrastructure

```bash
cd infra
export COMPOSE_EXPERIMENTAL_GIT_REMOTE=1 && docker-compose --profile all up -d --build
```

## Preparing the application

### SDP

1. Go through the forgot-password flow with the user `admin@example.com`, and set the password.
1. Login and create an API key with ALL write permissions by going to `API Keys` -> `Create API Key` and set the permissions to `ALL: READ&WRITE`. Copy the generated key and use it for The smart-wallet's `SDP_EMBEDDED_WALLETS_API_KEY` env.
1. Create a disbursement using `SDP Embedded Wallet` as the wallet provider, and set a file like:

   ```csv
   email,id,amount,verification
   foo@example.com,4ba1,0.01,2000-01-01
   ```

1. Start the disbursement and check the links in the emails porinted in the logs.
