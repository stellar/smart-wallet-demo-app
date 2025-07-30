# Extracting Data from Operation XDR with Stellar SDK

This guide explains how to extract data from Stellar operation XDR (External Data Representation) using the `@stellar/stellar-sdk`.

## Basic Concepts

### What is XDR?

XDR (External Data Representation) is a standardized data serialization format used by Stellar to represent operations, transactions, and other blockchain data in a platform-independent way.

### Operation XDR Structure

Every Stellar operation is represented as an XDR object with this basic structure:

```typescript
xdr.Operation {
  body: OperationBody {
    switch: OperationType
    // Specific operation data based on type
  }
  sourceAccount?: MuxedAccount // Optional source account
}
```

## Getting Started

### 1. Parse Operation XDR

```typescript
import { xdr } from '@stellar/stellar-sdk'

// Parse operation from base64 string
const operationXdr = xdr.Operation.fromXDR(operationXdrBase64, 'base64')

// Get operation body and type
const operationBody = operationXdr.body()
const operationType = operationBody.switch()

console.log('Operation type:', operationType.name)
```

### 2. Extract Data Based on Operation Type

```typescript
switch (operationType.value) {
  case xdr.OperationType.payment().value:
    const paymentOp = operationBody.paymentOp()
    return {
      destination: paymentOp.destination().ed25519().toString('hex'),
      asset: getAssetString(paymentOp.asset()),
      amount: paymentOp.amount().toString(),
    }

  case xdr.OperationType.invokeHostFunction().value:
    const invokeOp = operationBody.invokeHostFunctionOp()
    return {
      functionType: invokeOp.hostFunction().switch().name,
    }
}
```

## Common Data Extraction Patterns

### Public Keys

```typescript
// Extract Ed25519 public key
const publicKey = operation.destination().ed25519().toString('hex')

// Handle MuxedAccount (if source account is present)
const sourceAccount = operation.sourceAccount()?.ed25519().toString('hex')
```

### Assets

```typescript
const getAssetString = (asset: xdr.Asset): string => {
  switch (asset.switch()) {
    case xdr.AssetType.assetTypeNative():
      return 'XLM'
    case xdr.AssetType.assetTypeCreditAlphanum4():
      return asset.alphaNum4()?.assetCode().toString() || 'Unknown'
    case xdr.AssetType.assetTypeCreditAlphanum12():
      return asset.alphaNum12()?.assetCode().toString() || 'Unknown'
    default:
      return 'Unknown'
  }
}
```

### Amounts and Numbers

```typescript
// Convert XDR amounts to strings
const amount = operation.amount().toString()

// For large numbers (like sequence numbers)
const sequence = operation.bumpTo().toString()
```

### Soroban Values

```typescript
// Convert Soroban ScVal to base64
const scVal = operation.args().map(arg => arg.toXDR('base64'))

// Contract IDs
const contractId = operation.contractAddress().contractId().toString('hex')
```

## Operation-Specific Examples

### Payment Operation

```typescript
case xdr.OperationType.payment().value:
  const paymentOp = operationBody.paymentOp()
  return {
    type: 'payment',
    destination: paymentOp.destination().ed25519().toString('hex'),
    asset: paymentOp.asset().switch() === xdr.AssetType.assetTypeNative()
      ? 'XLM'
      : paymentOp.asset().alphaNum4()?.assetCode().toString() || paymentOp.asset().alphaNum12()?.assetCode().toString(),
    amount: paymentOp.amount().toString(),
    sourceAccount: operationXdr.sourceAccount()?.ed25519().toString('hex') || 'No source account'
  }
```

### Path Payment Operation

```typescript
case xdr.OperationType.pathPaymentStrictSend().value:
  const pathPaymentOp = operationBody.pathPaymentStrictSendOp()
  return {
    type: 'path_payment_strict_send',
    destination: pathPaymentOp.destination().ed25519().toString('hex'),
    destAsset: getAssetString(pathPaymentOp.destAsset()),
    destMin: pathPaymentOp.destMin().toString(),
    sendAsset: getAssetString(pathPaymentOp.sendAsset()),
    sendAmount: pathPaymentOp.sendAmount().toString(),
    path: pathPaymentOp.path().map(asset => getAssetString(asset))
  }
```

### Manage Sell Offer

```typescript
case xdr.OperationType.manageSellOffer().value:
  const manageSellOfferOp = operationBody.manageSellOfferOp()
  return {
    type: 'manage_sell_offer',
    selling: getAssetString(manageSellOfferOp.selling()),
    buying: getAssetString(manageSellOfferOp.buying()),
    amount: manageSellOfferOp.amount().toString(),
    price: manageSellOfferOp.price().toString(),
    offerId: manageSellOfferOp.offerId().toString()
  }
```

### Soroban Invoke Host Function

```typescript
case xdr.OperationType.invokeHostFunction().value:
  const invokeHostFunctionOp = operationBody.invokeHostFunctionOp()
  const hostFunction = invokeHostFunctionOp.hostFunction()

  switch (hostFunction.switch().value) {
    case xdr.HostFunctionType.hostFunctionTypeInvokeContract().value:
      const invokeContract = hostFunction.invokeContract()
      return {
        type: 'invoke_contract',
        contractId: invokeContract.contractAddress().contractId().toString('hex'),
        functionName: invokeContract.functionName().toString(),
        args: invokeContract.args().map(arg => arg.toXDR('base64'))
      }

    case xdr.HostFunctionType.hostFunctionTypeCreateContract().value:
      const createContract = hostFunction.createContract()
      return {
        type: 'create_contract',
        contractId: createContract.contractId().toString('hex')
      }
  }
```

## Helper Functions

### Complete Asset Extraction

```typescript
const getAssetInfo = (asset: xdr.Asset) => {
  switch (asset.switch()) {
    case xdr.AssetType.assetTypeNative():
      return {
        code: 'XLM',
        issuer: 'Native',
        type: 'native',
      }
    case xdr.AssetType.assetTypeCreditAlphanum4():
      return {
        code: asset.alphaNum4()?.assetCode().toString(),
        issuer: asset.alphaNum4()?.issuer().ed25519().toString('hex'),
        type: 'credit_alphanum4',
      }
    case xdr.AssetType.assetTypeCreditAlphanum12():
      return {
        code: asset.alphaNum12()?.assetCode().toString(),
        issuer: asset.alphaNum12()?.issuer().ed25519().toString('hex'),
        type: 'credit_alphanum12',
      }
    default:
      return {
        code: 'Unknown',
        issuer: 'Unknown',
        type: 'unknown',
      }
  }
}
```

### Safe Public Key Extraction

```typescript
const getPublicKeyString = (publicKey: xdr.PublicKey | xdr.MuxedAccount): string => {
  if (publicKey instanceof xdr.PublicKey) {
    return publicKey.ed25519().toString('hex')
  } else {
    // Handle MuxedAccount
    switch (publicKey.switch()) {
      case xdr.CryptoKeyType.keyTypeEd25519():
        return publicKey.ed25519().toString('hex')
      case xdr.CryptoKeyType.keyTypeMuxedEd25519():
        return publicKey.med25519().ed25519().toString('hex')
      default:
        return 'Unknown'
    }
  }
}
```

## Common Pitfalls

### 1. Type Checking

Always check the operation type before accessing specific fields:

```typescript
// ❌ Wrong - may throw error if not a payment
const paymentOp = operationBody.paymentOp()

// ✅ Correct - check type first
if (operationType.value === xdr.OperationType.payment().value) {
  const paymentOp = operationBody.paymentOp()
  // ... extract data
}
```

### 2. Asset Type Handling

Different asset types have different structures:

```typescript
// ❌ Wrong - assumes all assets have assetCode
const assetCode = asset.assetCode()

// ✅ Correct - handle different asset types
const assetCode =
  asset.switch() === xdr.AssetType.assetTypeNative()
    ? 'XLM'
    : asset.alphaNum4()?.assetCode().toString() || asset.alphaNum12()?.assetCode().toString()
```

### 3. Optional Fields

Some fields may be optional:

```typescript
// ❌ Wrong - may throw if field is null
const sourceAccount = operation.sourceAccount().ed25519().toString('hex')

// ✅ Correct - handle optional fields
const sourceAccount = operation.sourceAccount()?.ed25519().toString('hex') || 'No source account'
```

## Complete Example

See `xdr-examples.ts` for a complete implementation that handles all operation types with proper error handling and type safety.

## Resources

- [Stellar XDR Documentation](https://developers.stellar.org/docs/fundamentals-and-concepts/stellar-data-structures/xdr)
- [Stellar SDK Documentation](https://stellar.github.io/js-stellar-sdk/)
- [Operation Types Reference](https://developers.stellar.org/docs/fundamentals-and-concepts/list-of-operations)
