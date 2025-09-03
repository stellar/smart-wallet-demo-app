# Airdrop Contract

## Contract Overview

### Constructor

```rust
__constructor(root_hash: BytesN<32>, token: Address, funding_amount: i128, funding_source: Address)
```

Initialize the airdrop with Merkle root and funding parameters.

### Public Functions

- `claim(index: u32, receiver: Address, amount: i128, proof: Vec<BytesN<32>>)` - Claim tokens using Merkle proof
- `is_claimed(index: u32) -> bool` - Check if an index has been claimed
- `is_ended() -> bool` - Check if the airdrop has ended
- `recover_unclaimed()` - Recover unclaimed tokens back to funder (funder auth required)

## Deployment

### Option 1: Unified Deployment Script

Deploy a airdrop in a single command and upload proofs to the database:

```bash
npm run --workspace=scripts deploy-airdrop -- \
  --addresses recipients.txt \
  --amount 1000000000 \
  --token CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC \
  --network testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --source $IDENTITY \
  --database-url postgresql://postgres:postgres@localhost:5432/smart_wallet_db
```

This will:

1. Generate Merkle proofs from the recipients file
2. Deploy the pre-built airdrop contract with the Merkle root
3. Upload proofs to the database

**Required arguments:**

- `--addresses` - Recipients file path
- `--amount` - Amount per recipient
- `--token` - Token contract address
- `--network` - Stellar network (testnet/mainnet)
- `--rpc-url` - RPC URL for the network
- `--source` - Stellar identity for deployment and funding
- `--database-url` - Database URL for uploading proofs

### Option 2: Step-by-Step Deployment

Build the contract:

```bash
stellar contract build --package airdrop
```

Deploy the contract with constructor arguments:

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/airdrop.wasm \
  --network testnet \
  --source $IDENTITY \
  -- \
  --root_hash $MERKLE_ROOT_HASH \
  --token $TOKEN_CONTRACT_ADDRESS \
  --funding_amount $AMOUNT \
  --funding_source $IDENTITY
```

You must ensure that the `IDENTITY` account has enough of the token to fund the airdrop.

For manual deployment, follow these steps:

#### 1. Generate Proofs

Create a text file with recipient contract addresses (one per line):

```
GD5RUZEO3ZCW6UX6Y4FRHKC7ZWWKTKUOPCQKYKYPCF2K7M7AD7J2URPW
GCJVXKQVGXSTRGAK7WDPUPH6LGRQFVMUJ6XJMTQZX7LGMVKVGVQF7QTJ
CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE
```

Generate Merkle proofs:

```bash
npm run --workspace=scripts generate-proofs -- \
  --addresses addresses.txt \
  --proofs proofs.json \
  --amount 1000000000
```

#### 2. Deploy Contract

Use the Merkle root from the proofs output to deploy:

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/airdrop.wasm \
  --network testnet \
  --source $IDENTITY \
  -- \
  --root_hash $MERKLE_ROOT_FROM_PROOFS \
  --token $TOKEN_CONTRACT_ADDRESS \
  --funding_amount $TOTAL_AMOUNT \
  --funding_source $IDENTITY
```

#### 3. Upload Proofs to Database

```bash
npm run --workspace=scripts upload-proofs -- \
  --proofs proofs.json \
  --contract $CONTRACT_ADDRESS_FROM_DEPLOYMENT
```

## Integration with Backend

The airdrop contract integrates with the backend embedded wallets API:

1. **Generate Proofs**: Create recipient list and generate Merkle proofs with root hash
2. **Deploy Contract**: Deploy contract with the root hash
3. **Upload Proofs**: Store individual proofs in the backend database with contract address
4. **User Claims**: Users call the airdrop/options endpoint to get available airdrops and their proofs
5. **Execute Claims**: Users call the airdrop/complete endpoint to claim their tokens

Users can then retrieve their airdrop options through the embedded wallets API:

```bash
# Get airdrop options for a wallet (requires authentication)
GET /api/embedded-wallets/airdrop/options
Authorization: Bearer <jwt_token>

# Complete an airdrop claim (requires authentication)
POST /api/embedded-wallets/airdrop/complete
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "webauthnCredential": {...},
  "challengeId": "uuid"
}
```
