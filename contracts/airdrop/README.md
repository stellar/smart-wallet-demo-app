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
  --funding_source IDENTITY
```

You must ensure that the `IDENTITY` account has enough of the token to fund the airdrop.

## Integration with Backend

The airdrop contract integrates with the backend embedded wallets API:

1. **Generate Proofs**: Create recipient list and generate Merkle proofs with root hash
2. **Deploy Contract**: Deploy contract with the root hash
3. **Upload Proofs**: Store individual proofs in the backend database with contract address
4. **User Claims**: Users call the airdrop/options endpoint to get available airdrops and their proofs
5. **Execute Claims**: Users call the airdrop/complete endpoint to claim their tokens

### Generate Proofs

Create a JSON file with recipient addresses and amounts:

```json
[
  {
    "address": "GD5RUZEO3ZCW6UX6Y4FRHKC7ZWWKTKUOPCQKYKYPCF2K7M7AD7J2URPW",
    "amount": 100000000
  },
  {
    "address": "GCJVXKQVGXSTRGAK7WDPUPH6LGRQFVMUJ6XJMTQZX7LGMVKVGVQF7QTJ",
    "amount": 500000000
  }
]
```

Generate Merkle proofs using the scripts workspace:

```bash
npm run --workspace=scripts generate-proofs -- \
  --receivers receivers.json \
  --proofs proofs.json
```

### Backend API Integration

Use the contract address from deployment when uploading proofs:

```bash
npm run --workspace=scripts upload-proofs -- \
  --proofs proofs.json \
  --contract CONTRACT_ADDRESS
```

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
