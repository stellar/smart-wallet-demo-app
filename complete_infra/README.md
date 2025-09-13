# How to deploy the whole infrastructure

## Gettings started

Copy envs from `complete_infra/.env.example` to `complete_infra/.env`:

```bash
cp complete_infra/.env.example complete_infra/.env
```

Setting up local resources:

```bash
npm run setup-assets --workspace=apps/web
npm run setup-content --workspace=apps/web
```

## Running the infrastructure

```bash
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
