# Smart Wallet Demo - Contracts

Soroban smart contracts for the Smart Wallet Demo application.

## Structure

```
contracts/
├── airdrop/           # Merkle tree airdrop contract
└── target/            # Build artifacts
```

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Stellar CLI](https://developers.stellar.org/docs/smart-contracts/getting-started/setup)

## Building

```bash
stellar contract build --package CONTRACT_NAME
```

## Testing

```bash
cargo test
```

## Deployment

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/CONTRACT_NAME.wasm \
  --network NETWORK_NAME \
  --source IDENTITY_NAME
```

See individual contract READMEs for specific instructions.
