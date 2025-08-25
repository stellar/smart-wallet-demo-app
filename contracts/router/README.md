# Router Contract

## Contract Overview

The Router contract enables atomic execution of multiple contract invocations in a single transaction.

### Public Functions

- `exec(caller: Address, invocations: Vec<(Address, Symbol, Vec<Val>)>) -> Vec<Val>` - Execute multiple contract invocations atomically

**Parameters:**

- `caller` - The address authorizing the batch execution (requires auth)
- `invocations` - Vector of contract calls, where each call contains:
  - `Address` - Target contract address
  - `Symbol` - Function name to call
  - `Vec<Val>` - Function arguments

**Returns:** Vector of return values from each invocation

## Deployment

Build the contract:

```bash
stellar contract build --package router
```

Deploy the contract:

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/router.wasm \
  --network testnet \
  --source $IDENTITY
```
