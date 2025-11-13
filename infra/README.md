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

### Submodules

This setup includes the following submodules:

- `infra/external/wallet-backend` - Stellar Wallet Backend
- `infra/external/stellar-disbursement-platform-backend` - SDP Backend
- `infra/external/stellar-disbursement-platform-frontend` - SDP Frontend

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
2. Login and create an API key with ALL write permissions by going to `API Keys` -> `Create API Key` and set the permissions to `ALL: READ&WRITE`. Copy the generated key and use it for The smart-wallet's `SDP_EMBEDDED_WALLETS_API_KEY` env.
3. Create a disbursement using `SDP Embedded Wallet` as the wallet provider, and set a file like:

   ```csv
   email,id,amount,verification
   foo@example.com,4ba1,0.01,2000-01-01
   ```

4. Start the disbursement and check the links in the emails printed in the logs.

### MeridianPay

1. Click the link sent by SDP to access the MeridianPay wallet.
2. Click the SignUp/CreateAccount button.
3. Authenticate with your passkey. 🎉 This should create your smart wallet on the blockchain 🎉.
4. Transfer some XLM to your smart wallet.
5. Now you can use your smart wallet to send and receive payments using the URL links like:
   - `http://localhost:3201/wallet?type=transfer&to={recipient_address}&amount={amount}&asset=XLM`
