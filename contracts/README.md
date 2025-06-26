# Smart Contracts

This repository contains the Smart Contracts used in the Smart Wallet project. All smart contracts are located inside the `contracts` directory.

## NFT Smart Contract

The NFT Smart Contract is a simple non-fungible token contract that allows minting and transferring NFTs.

### Prerequisites

Before deploying the NFT Smart Contract, ensure the following:

- Define a `MAX_SUPPLY` value, which will be passed to the contract as a constructor argument. This represents the maximum number of NFTs that can be minted and corresponds to the number of images in the `nfts/images` directory.
- Prepare a directory structure containing the NFT images, named sequentially from `0` to `MAX_SUPPLY - 1`.
- Install `Make` on your system.
- Install `Node.js` to run the deployment script.
- Install `Rust` to compile the smart contract.
- Install `Stellar CLI` to deploy the contract if you haven't already.
- Create a Pinata account to upload images to IPFS.
- Have a Stellar account to deploy the contract.

### Steps to Deploy

1. **Prepare Images**
   Create your images under `<rootDir>/nfts/images/`, ensuring they are named sequentially from `0` to `MAX_SUPPLY - 1`.

   ```
   <rootDir>
   ├── contracts
   │   └── non-fungible-token
   │       ├── src
   │       │   ├── contract.rs
   │       │   ├── lib.rs
   │       │   └── test.rs
   │       └── Cargo.toml
   │       └── Makefile
   ├── nfts
   │   └── images/(0...MAX_SUPPLY - 1).png
   ├── scripts
   │   └── deploy-nft-cli.mjs
   │   └── helpers
   │       └── contract-helpers.mjs
   │       └── index.mjs
   │       └── ipfs-images.mjs
   │       └── ipfs-helpers.mjs
   │       └── ipfs-metadatas.mjs
   ├── packages/
   ├── Cargo.toml
   └── README.md
   ```

2. **Build the Contract**
   Run the following command to build the contract and generate the `.wasm` files in the `target/wasm32v1-none/` directory:

   ```sh
   make build-contracts
   ```

3. **Run Tests**
   Execute the test suite to ensure the contract works as expected:

   ```sh
   make test-contracts
   ```

4. **Deploy the Contract**
   Use the deployment script located at `<rootDir>/scripts/deploy-nft-cli.mjs` to deploy the contract:

   ```sh
   node scripts/deploy-nft-cli.mjs \
   --contractWasm target/wasm32v1-none/release/nft_smart_contract.wasm \
   --stellarSecretKey <secret-key> \
   --pinataGatewayURL <gateway-url> \
   --pinataKey <pinata-jwt-key> \
   --collectionName <collection_name> \
   --collectionSymbol <collection_symbol> \
   --collectionSupply <collection_supply> \
   --verbose
   ```

   **Note:**
   - To reduce terminal output, omit the `--verbose` flag.
   - Use the `--production` flag to deploy to the Stellar mainnet (currently under development).
