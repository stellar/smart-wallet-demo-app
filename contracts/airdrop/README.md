# Airdrop Contract

## Contract Overview

### Constructor

```rust
__constructor(
    root_hash: BytesN<32>,
    token: Address,
    admin: Address,
    funder: Address
)
```

Initialize the airdrop with:

- `root_hash`: Merkle tree root hash for proof verification
- `token`: Token contract address to distribute
- `admin`: Address that can manage the airdrop (end and send unclaimed funds back to the `funder`)
- `funder`: Address that will provide and receive tokens

**Important**: The admin must authorize the deployment transaction.

### Public Functions

- `claim(index: u32, receiver: Address, amount: i128, proof: Vec<BytesN<32>>)` - Claim tokens using Merkle proof
- `is_claimed(index: u32) -> bool` - Check if an index has been claimed
- `is_ended() -> bool` - Check if the airdrop has ended
- `recover_unclaimed()` - Recover unclaimed tokens back to `funder`

## Deployment

### Prerequisites

#### Tools

You'll need the following tools installed in your machine in order to execute the deployment script:

- [Stellar CLI](https://developers.stellar.org/docs/smart-contracts/getting-started/setup)
- [Node.js](https://nodejs.org/en/download/)
- [npm](https://www.npmjs.com/get-npm)

#### Recipients File

The recipients file (`recipients.txt`) is a text file with one Stellar address per line. Example:

```txt
GD5RUZEO3ZCW6UX6Y4FRHKC7ZWWKTKUOPCQKYKYPCF2K7M7AD7J2URPW
GCJVXKQVGXSTRGAK7WDPUPH6LGRQFVMUJ6XJMTQZX7LGMVKVGVQF7QTJ
CAZDTOPFCY47C62SH7K5SXIVV46CMFDO3L7T4V42VK6VHGN3LUBY65ZE
```

#### Environment Variables

Also, we're assuming these env variables are set:

- `NODE_TLS_REJECT_UNAUTHORIZED=0`
- `DATABASE_URL`: URL for this application's Backend database. This is used to upload the proofs to the database.
- `RECIPIENTS_FILE`: Path to the recipients file. Example: `recipients.txt`.
- `TOKEN_CONTRACT_ADDRESS`: The contract ID of the token you want to distribute. Example: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` for Testnet XLM.
- `ADMIN_IDENTITY`: Stellar identity for admin role. This is the name of the identity your stellar-cli will use to deploy the contract.
- `FUNDER_IDENTITY`: Stellar address (public key) that will receive the funds when the function `recover_unclaimed` is called.
- `NETWORK`: Stellar network. Options: [`testnet`, `mainnet`].
- `AMOUNT`: Amount of stroops per recipient. 1 XLM = 10_000_000 stroops.\
- `RPC_URL`: RPC URL for the network.

### Option 1: Unified Deployment Script

Deploy a airdrop in a single command and upload proofs to the database:

```bash
npm run --workspace=scripts deploy-airdrop -- \
  --addresses $RECIPIENTS_FILE \
  --amount $AMOUNT \
  --token $TOKEN_CONTRACT_ADDRESS \
  --network $NETWORK \
  --rpc-url https://soroban-testnet.stellar.org \
  --source ${ADMIN_IDENTITY} \
  --funder ${FUNDER_IDENTITY} \
  --database-url ${DATABASE_URL}
```

This will:

1. Generate Merkle proofs from the recipients file
2. Deploy the pre-built airdrop contract with the Merkle root
3. Upload proofs to the database

**Required arguments:**

- `--addresses` - Recipients file (full path)
- `--amount` - Amount of stroops per recipient. 1 XLM = 10_000_000 stroops
- `--token` - Token contract address
- `--network` - Stellar network. Options: [`testnet`, `mainnet`]
- `--rpc-url` - RPC URL for the network
- `--source` - Stellar identity for admin role. This is the name of the identity your stellar-cli will use to deploy the contract
- `--funder` - Stellar identity for funder role. This is the Stellar address (public key) that will receive the funds when the function `recover_unclaimed` is called
- `--database-url` - Database URL for uploading proofs

**After deployment**, the funder must transfer the total amount to the deployed contract address.

### Option 2: Step-by-Step Deployment

Build the contract:

```bash
stellar contract build --package airdrop
```

Deploy the contract with constructor arguments:

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/airdrop.wasm \
  --network $NETWORK \
  --source $ADMIN_IDENTITY \
  -- \
  --root_hash $MERKLE_ROOT_HASH \
  --token $TOKEN_CONTRACT_ADDRESS \
  --admin $ADMIN_ADDRESS \
  --funder $FUNDER_ADDRESS
```

After deployment, the funder must transfer tokens to the contract address.

For manual deployment, follow these steps:

#### 1. Generate Proofs

Generate Merkle proofs:

```bash
npm run --workspace=scripts generate-proofs -- \
  --addresses $RECIPIENTS_FILE \
  --proofs proofs.json \
  --amount $AMOUNT
```

#### 2. Deploy Contract

Use the Merkle root from the proofs output to deploy:

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/airdrop.wasm \
  --network $NETWORK \
  --source $ADMIN_IDENTITY \
  -- \
  --root_hash $MERKLE_ROOT_FROM_PROOFS \
  --token $TOKEN_CONTRACT_ADDRESS \
  --admin $ADMIN_ADDRESS \
  --funder $FUNDER_ADDRESS
```

#### 3. Upload Proofs to Database

```bash
npm run --workspace=scripts upload-proofs -- \
  --proofs proofs.json \
  --contract $CONTRACT_ADDRESS_FROM_DEPLOYMENT \
  --database-url $DATABASE_URL
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
