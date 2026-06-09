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

## RPC Proxy

All services route Stellar RPC and Horizon calls through a local proxy (`apps/rpc-proxy`) instead of hitting public providers directly. The proxy tries providers sequentially and fails over automatically on network errors, timeouts, HTTP 5xx, and rate limits (429).

| Port | Protocol | Purpose |
|------|----------|---------|
| `8301` | JSON-RPC (POST) | Soroban RPC — used by `STELLAR_SOROBAN_RPC_URL` / `RPC_URL` |
| `8302` | REST (GET/POST) | Horizon — used by `STELLAR_HORIZON_URL` / `HORIZON_URL` |

**Health endpoints** (on `:8301`):
- `GET /health` — liveness: always 200 while the process is up
- `GET /health/ready` — readiness: probes each RPC provider with `getHealth`; returns 503 if all fail

**Key env vars** (set in `docker-compose.yml` or `.env`):

| Variable | Default | Description |
|----------|---------|-------------|
| `STELLAR_NETWORK` | `testnet` | `testnet`, `mainnet`, or `futurenet` — selects the built-in provider list |
| `PROVIDER_TIMEOUT_MS` | `10000` | Per-provider timeout for real requests (ms) |
| `READINESS_TIMEOUT_MS` | `3000` | Per-provider timeout for `/health/ready` probe (ms) |
| `RPC_PROVIDERS` | _(built-in list)_ | Comma-separated override of RPC provider URLs |
| `HORIZON_PROVIDERS` | _(built-in list)_ | Comma-separated override of Horizon URLs |

## Running the infrastructure

```bash
cd infra
export COMPOSE_EXPERIMENTAL_GIT_REMOTE=1 && docker-compose --profile all up -d --build
```

> **Note:** The `--profile all` flag is required — it activates the `rpc-proxy` service (and other profile-gated services). Running without it will skip the proxy and dependent services will fail to start.

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
