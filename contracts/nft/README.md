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
