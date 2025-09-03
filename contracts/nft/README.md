# NFT Contract

## Contract Overview

### Constructor

```rust
__constructor(owner: Address, total_supply: u128, metadata: TokenMetadata)
```

Initialize the NFT contract with owner, maximum supply, and token metadata (name, symbol, base URI).

### Public Functions

- `mint(to: Address) -> Result<u32, NonFungibleTokenContractError>` - Mint a new NFT to the specified address (owner auth required)
- `get_total_minted() -> u128` - Get the current number of minted tokens
- `get_max_supply() -> u128` - Get the maximum supply limit
- `get_token_metadata() -> TokenMetadata` - Get the token metadata (name, symbol, base URI)
- `get_owner_tokens(owner: Address) -> Vec<TokenMetadata>` - Get all tokens owned by a specific address
- `set_metadata_uri(base_uri: String)` - Update the base URI for token metadata (owner auth required)
- `bulk_transfer(from: Address, to: Address, token_ids: Vec<u32>)` - Transfer multiple tokens between addresses (owner auth required)

### Token Metadata Structure

```rust
struct TokenMetadata {
  name: String,        // Token collection name
  symbol: String,      // Token symbol
  base_uri: String,    // Base URI for token metadata
}
```

## Running with Makefile

The NFT contract includes a comprehensive Makefile that simplifies common development tasks. Here's how to use it:

### Available Make Targets

#### `make` or `make default`

Builds the contract (default action)

#### `make build`

Builds the contract using `stellar contract build`

#### `make test`

Runs the contract tests using `cargo test`

#### `make fmt`

Formats the code using `cargo fmt --all`

#### `make clean`

Cleans build artifacts using `cargo clean`

#### `make upload`

Uploads the contract to the specified network

#### `make deploy`

Deploys the contract with constructor arguments

#### `make all`

Runs tests (alias for `make test`)

### Makefile Variables

You can customize the behavior by setting these environment variables:

- `NETWORK`: Target network (default: `testnet`)
- `CONTRACT_NAME`: Contract name (default: `nft`)
- `SOURCE`: Source account for deployment (default: `admin`)
- `CONTRACT_SYMBOL`: Token symbol (default: `TEST`)
- `CONTRACT_URI`: Base URI for token metadata (default: `https://ipfs.io/ipfs/to-be-replaced`)
- `CONTRACT_MAX_SUPPLY`: Maximum token supply (default: `10000`)
- `CONTRACT_WASM_PATH`: Path to the compiled WASM file (default: `../target/wasm32v1-none/release/nft.wasm`)

### Usage Examples

#### Basic Build and Test

```bash
# Build the contract
make build

# Run tests
make test

# Format code
make fmt
```

#### Upload Contract

```bash
# Upload to testnet
make upload NETWORK=testnet SOURCE=your_account_address

# Upload to mainnet
make upload NETWORK=mainnet SOURCE=your_account_address
```

#### Deploy Contract

```bash
# Deploy with default parameters
make deploy NETWORK=testnet SOURCE=your_account_address

# Deploy with custom parameters
make deploy \
  NETWORK=testnet \
  SOURCE=your_account_address \
  CONTRACT_SYMBOL=MYNFT \
  CONTRACT_URI=https://ipfs.io/ipfs/your-metadata-uri \
  CONTRACT_MAX_SUPPLY=5000

# Deploy to mainnet
make deploy \
  NETWORK=mainnet \
  SOURCE=your_account_address \
  CONTRACT_SYMBOL=PRODNFT \
  CONTRACT_URI=https://ipfs.io/ipfs/production-metadata \
  CONTRACT_MAX_SUPPLY=10000
```

#### Complete Workflow Example

```bash
# 1. Clean previous builds
make clean

# 2. Build the contract
make build

# 3. Run tests to ensure everything works
make test

# 4. Upload to testnet
make upload NETWORK=testnet SOURCE=your_testnet_account

# 5. Deploy with your desired parameters
make deploy \
  NETWORK=testnet \
  SOURCE=your_testnet_account \
  CONTRACT_SYMBOL=DEMO \
  CONTRACT_URI=https://ipfs.io/ipfs/demo-metadata \
  CONTRACT_MAX_SUPPLY=1000
```

### Prerequisites

Before using the Makefile, ensure you have:

1. **Stellar CLI** installed and configured
2. **Rust toolchain** with `cargo` available
3. **Valid Stellar account** with sufficient XLM for deployment
4. **Network access** to the target Stellar network (testnet/mainnet)

### Troubleshooting

- **Build fails**: Ensure you're in the `contracts/nft` directory and have Rust installed
- **Upload fails**: Check that your `SOURCE` account exists and has sufficient XLM
- **Deploy fails**: Verify constructor arguments and ensure the contract was uploaded successfully
- **Network issues**: Confirm you can reach the target Stellar network

## Deployment

Build the contract:

```bash
make build
# or
stellar contract build --package nft
```

Deploy the contract with constructor arguments:

```bash
make deploy \
  NETWORK=testnet \
  SOURCE=$IDENTITY \
  CONTRACT_SYMBOL=COLLECTION \
  CONTRACT_URI=https://ipfs.io/ipfs/your-metadata-uri \
  CONTRACT_MAX_SUPPLY=10000
```

Or manually deploy:

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/nft.wasm \
  --network testnet \
  --source $IDENTITY \
  -- \
  --owner $IDENTITY \
  --name "Your Collection Name" \
  --symbol COLLECTION \
  --uri https://ipfs.io/ipfs/your-metadata-uri \
  --max-supply 10000
```

### Contract Features

- **Enumerable**: Supports listing all tokens owned by an address
- **Burnable**: Tokens can be burned (destroyed)
- **Owner Controls**: Only the contract owner can mint new tokens and update metadata
- **Supply Management**: Enforces maximum supply limits
- **Bulk Operations**: Supports transferring multiple tokens at once

### Error Handling

The contract includes custom error types:

- `MaxSupplyReached`: Attempted to mint beyond the maximum supply
- `UnsetMaxSupply`: Maximum supply not configured
- `UnsetTotalMinted`: Total minted count not initialized
- `UnsetOwner`: Contract owner not set

### Testing

Run the contract tests:

```bash
make test
# or
cargo test
```

### Development Commands

```bash
# Format code
make fmt

# Clean build artifacts
make clean

# Upload contract to network
make upload NETWORK=testnet SOURCE=$IDENTITY

# Deploy with custom parameters
make deploy NETWORK=testnet SOURCE=$IDENTITY CONTRACT_SYMBOL=MYNFT CONTRACT_MAX_SUPPLY=5000
```
