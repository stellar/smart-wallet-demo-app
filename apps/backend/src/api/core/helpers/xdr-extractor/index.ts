import { xdr, StrKey } from '@stellar/stellar-sdk'

/**
 * Comprehensive guide on how to extract data from operation XDR with Stellar SDK
 *
 * This file demonstrates the proper ways to access and extract data from
 * Stellar operation XDR objects using the @stellar/stellar-sdk.
 */

/**
 * Extract Stellar address from function arguments
 * @param scVal - The Stellar value containing the address
 * @returns Human readable Stellar address or null if not an address
 */
const extractStellarAddress = (scVal: xdr.ScVal): string | null => {
  let address
  let bytes
  switch (scVal.switch().value) {
    case xdr.ScValType.scvAddress().value:
      address = scVal.address()
      if (address.switch().value === xdr.ScAddressType.scAddressTypeAccount().value) {
        const accountId = address.accountId()
        return StrKey.encodeEd25519PublicKey(accountId.ed25519())
      } else if (address.switch().value === xdr.ScAddressType.scAddressTypeContract().value) {
        const contractId = address.contractId()
        return StrKey.encodeContract(contractId)
      }
      break
    case xdr.ScValType.scvBytes().value:
      bytes = scVal.bytes()
      // If it's 32 bytes, it might be a raw public key
      if (bytes.length === 32) {
        return StrKey.encodeEd25519PublicKey(bytes)
      }
      break
  }
  return null
}

/**
 * Extract and format function arguments for better readability
 * @param args - Array of Stellar values
 * @returns Formatted arguments with human-readable addresses
 */
const formatFunctionArgs = (args: xdr.ScVal[]): object[] => {
  let stellarAddress
  return args.map(arg => {
    stellarAddress = extractStellarAddress(arg)
    if (stellarAddress) {
      return {
        type: 'stellar_address',
        value: stellarAddress,
        raw: arg.toXDR('base64'),
      }
    }

    // Handle other common types
    switch (arg.switch().value) {
      case xdr.ScValType.scvU32().value:
        return {
          type: 'u32',
          value: arg.u32().toString(),
          raw: arg.toXDR('base64'),
        }
      case xdr.ScValType.scvI32().value:
        return {
          type: 'i32',
          value: arg.i32().toString(),
          raw: arg.toXDR('base64'),
        }
      case xdr.ScValType.scvU64().value:
        return {
          type: 'u64',
          value: arg.u64().toString(),
          raw: arg.toXDR('base64'),
        }
      case xdr.ScValType.scvI64().value:
        return {
          type: 'i64',
          value: arg.i64().toString(),
          raw: arg.toXDR('base64'),
        }
      case xdr.ScValType.scvString().value:
        return {
          type: 'string',
          value: arg.str().toString(),
          raw: arg.toXDR('base64'),
        }
      case xdr.ScValType.scvBytes().value:
        return {
          type: 'bytes',
          value: arg.bytes().toString('hex'),
          raw: arg.toXDR('base64'),
        }
      case xdr.ScValType.scvAddress().value:
        return {
          type: xdr.ScValType.scvAddress().value,
          value: extractStellarAddress(arg) || 'Unknown address',
          raw: arg.toXDR('base64'),
        }
      default:
        return {
          type: arg.switch().name,
          value: 'Unknown type',
          raw: arg.toXDR('base64'),
        }
    }
  })
}

/**
 * Extract detailed operation data from operation XDR
 * @param operationXdr - The operation XDR object
 * @returns Object containing extracted operation data
 */
export const extractOperationData = (operationXdr: xdr.Operation) => {
  const operationBody = operationXdr.body()
  const operationType = operationBody.switch()
  let paymentOp
  let pathPaymentOp
  let manageSellOfferOp
  let createPassiveSellOfferOp
  let setOptionsOp
  let changeTrustOp
  let trustLine
  let manageDataOp
  let bumpSequenceOp
  let manageBuyOfferOp
  let pathPaymentStrictReceiveOp
  let createClaimableBalanceOp
  let claimClaimableBalanceOp
  let beginSponsoringFutureReservesOp
  let clawbackOp
  let clawbackClaimableBalanceOp
  let revokeSponsorshipOp
  let setTrustLineFlagsOp
  let liquidityPoolDepositOp
  let liquidityPoolWithdrawOp
  let invokeHostFunctionOp
  let rawArgs
  let formattedArgs

  switch (operationType.value) {
    case xdr.OperationType.payment().value:
      paymentOp = operationBody.paymentOp()
      return {
        type: 'payment',
        destination: paymentOp.destination().ed25519().toString('hex'),
        asset:
          paymentOp.asset().switch() === xdr.AssetType.assetTypeNative()
            ? 'XLM'
            : paymentOp.asset().alphaNum4()?.assetCode().toString() ||
              paymentOp.asset().alphaNum12()?.assetCode().toString(),
        amount: paymentOp.amount().toString(),
        sourceAccount: operationXdr.sourceAccount()?.ed25519().toString('hex') || 'No source account',
      }

    case xdr.OperationType.pathPaymentStrictSend().value:
      pathPaymentOp = operationBody.pathPaymentStrictSendOp()
      return {
        type: 'path_payment_strict_send',
        destination: pathPaymentOp.destination().ed25519().toString('hex'),
        destAsset:
          pathPaymentOp.destAsset().switch() === xdr.AssetType.assetTypeNative()
            ? 'XLM'
            : pathPaymentOp.destAsset().alphaNum4()?.assetCode().toString() ||
              pathPaymentOp.destAsset().alphaNum12()?.assetCode().toString(),
        destMin: pathPaymentOp.destMin().toString(),
        sendAsset:
          pathPaymentOp.sendAsset().switch() === xdr.AssetType.assetTypeNative()
            ? 'XLM'
            : pathPaymentOp.sendAsset().alphaNum4()?.assetCode().toString() ||
              pathPaymentOp.sendAsset().alphaNum12()?.assetCode().toString(),
        sendAmount: pathPaymentOp.sendAmount().toString(),
      }

    case xdr.OperationType.manageSellOffer().value:
      manageSellOfferOp = operationBody.manageSellOfferOp()
      return {
        type: 'manage_sell_offer',
        selling:
          manageSellOfferOp.selling().switch() === xdr.AssetType.assetTypeNative()
            ? 'XLM'
            : manageSellOfferOp.selling().alphaNum4()?.assetCode().toString() ||
              manageSellOfferOp.selling().alphaNum12()?.assetCode().toString(),
        buying:
          manageSellOfferOp.buying().switch() === xdr.AssetType.assetTypeNative()
            ? 'XLM'
            : manageSellOfferOp.buying().alphaNum4()?.assetCode().toString() ||
              manageSellOfferOp.buying().alphaNum12()?.assetCode().toString(),
        amount: manageSellOfferOp.amount().toString(),
        price: manageSellOfferOp.price().toString(),
        offerId: manageSellOfferOp.offerId().toString(),
      }

    case xdr.OperationType.createPassiveSellOffer().value:
      createPassiveSellOfferOp = operationBody.createPassiveSellOfferOp()
      return {
        type: 'create_passive_sell_offer',
        selling:
          createPassiveSellOfferOp.selling().switch() === xdr.AssetType.assetTypeNative()
            ? 'XLM'
            : createPassiveSellOfferOp.selling().alphaNum4()?.assetCode().toString() ||
              createPassiveSellOfferOp.selling().alphaNum12()?.assetCode().toString(),
        buying:
          createPassiveSellOfferOp.buying().switch() === xdr.AssetType.assetTypeNative()
            ? 'XLM'
            : createPassiveSellOfferOp.buying().alphaNum4()?.assetCode().toString() ||
              createPassiveSellOfferOp.buying().alphaNum12()?.assetCode().toString(),
        amount: createPassiveSellOfferOp.amount().toString(),
        price: createPassiveSellOfferOp.price().toString(),
      }

    case xdr.OperationType.setOptions().value:
      setOptionsOp = operationBody.setOptionsOp()
      return {
        type: 'set_options',
        inflationDest: setOptionsOp.inflationDest()?.ed25519().toString('hex') || 'Not set',
        clearFlags: setOptionsOp.clearFlags()?.toString() || 'Not set',
        setFlags: setOptionsOp.setFlags()?.toString() || 'Not set',
        masterWeight: setOptionsOp.masterWeight()?.toString() || 'Not set',
        lowThreshold: setOptionsOp.lowThreshold()?.toString() || 'Not set',
        medThreshold: setOptionsOp.medThreshold()?.toString() || 'Not set',
        highThreshold: setOptionsOp.highThreshold()?.toString() || 'Not set',
        homeDomain: setOptionsOp.homeDomain()?.toString() || 'Not set',
        signer: setOptionsOp.signer()
          ? {
              key:
                setOptionsOp.signer()?.key().switch() === xdr.SignerKeyType.signerKeyTypeEd25519()
                  ? setOptionsOp.signer()?.key().ed25519().toString('hex')
                  : 'Unknown signer type',
              weight: setOptionsOp.signer()?.weight().toString(),
            }
          : 'Not set',
      }

    case xdr.OperationType.changeTrust().value:
      changeTrustOp = operationBody.changeTrustOp()
      trustLine = changeTrustOp.line()
      return {
        type: 'change_trust',
        asset:
          trustLine.switch() === xdr.AssetType.assetTypeNative()
            ? 'XLM'
            : trustLine.alphaNum4()?.assetCode().toString() ||
              trustLine.alphaNum12()?.assetCode().toString() ||
              'Unknown',
        limit: changeTrustOp.limit().toString(),
      }

    case xdr.OperationType.inflation().value:
      return {
        type: 'inflation',
      }

    case xdr.OperationType.manageData().value:
      manageDataOp = operationBody.manageDataOp()
      return {
        type: 'manage_data',
        dataName: manageDataOp.dataName().toString(),
        dataValue: manageDataOp.dataValue()?.toString() || 'Not set',
      }

    case xdr.OperationType.bumpSequence().value:
      bumpSequenceOp = operationBody.bumpSequenceOp()
      return {
        type: 'bump_sequence',
        bumpTo: bumpSequenceOp.bumpTo().toString(),
      }

    case xdr.OperationType.manageBuyOffer().value:
      manageBuyOfferOp = operationBody.manageBuyOfferOp()
      return {
        type: 'manage_buy_offer',
        selling:
          manageBuyOfferOp.selling().switch() === xdr.AssetType.assetTypeNative()
            ? 'XLM'
            : manageBuyOfferOp.selling().alphaNum4()?.assetCode().toString() ||
              manageBuyOfferOp.selling().alphaNum12()?.assetCode().toString(),
        buying:
          manageBuyOfferOp.buying().switch() === xdr.AssetType.assetTypeNative()
            ? 'XLM'
            : manageBuyOfferOp.buying().alphaNum4()?.assetCode().toString() ||
              manageBuyOfferOp.buying().alphaNum12()?.assetCode().toString(),
        buyAmount: manageBuyOfferOp.buyAmount().toString(),
        price: manageBuyOfferOp.price().toString(),
        offerId: manageBuyOfferOp.offerId().toString(),
      }

    case xdr.OperationType.pathPaymentStrictReceive().value:
      pathPaymentStrictReceiveOp = operationBody.pathPaymentStrictReceiveOp()
      return {
        type: 'path_payment_strict_receive',
        destination: pathPaymentStrictReceiveOp.destination().ed25519().toString('hex'),
        destAsset:
          pathPaymentStrictReceiveOp.destAsset().switch() === xdr.AssetType.assetTypeNative()
            ? 'XLM'
            : pathPaymentStrictReceiveOp.destAsset().alphaNum4()?.assetCode().toString() ||
              pathPaymentStrictReceiveOp.destAsset().alphaNum12()?.assetCode().toString(),
        destAmount: pathPaymentStrictReceiveOp.destAmount().toString(),
        sendAsset:
          pathPaymentStrictReceiveOp.sendAsset().switch() === xdr.AssetType.assetTypeNative()
            ? 'XLM'
            : pathPaymentStrictReceiveOp.sendAsset().alphaNum4()?.assetCode().toString() ||
              pathPaymentStrictReceiveOp.sendAsset().alphaNum12()?.assetCode().toString(),
        sendMax: pathPaymentStrictReceiveOp.sendMax().toString(),
      }

    case xdr.OperationType.createClaimableBalance().value:
      createClaimableBalanceOp = operationBody.createClaimableBalanceOp()
      return {
        type: 'create_claimable_balance',
        asset:
          createClaimableBalanceOp.asset().switch() === xdr.AssetType.assetTypeNative()
            ? 'XLM'
            : createClaimableBalanceOp.asset().alphaNum4()?.assetCode().toString() ||
              createClaimableBalanceOp.asset().alphaNum12()?.assetCode().toString(),
        amount: createClaimableBalanceOp.amount().toString(),
        claimants: createClaimableBalanceOp.claimants().map(claimant => ({
          type: claimant.v0().predicate().switch().name,
          destination: claimant.v0().destination().ed25519().toString('hex'),
        })),
      }

    case xdr.OperationType.claimClaimableBalance().value:
      claimClaimableBalanceOp = operationBody.claimClaimableBalanceOp()
      return {
        type: 'claim_claimable_balance',
        balanceId: claimClaimableBalanceOp.balanceId().toString(),
      }

    case xdr.OperationType.beginSponsoringFutureReserves().value:
      beginSponsoringFutureReservesOp = operationBody.beginSponsoringFutureReservesOp()
      return {
        type: 'begin_sponsoring_future_reserves',
        sponsoredId: beginSponsoringFutureReservesOp.sponsoredId().ed25519().toString('hex'),
      }

    case xdr.OperationType.endSponsoringFutureReserves().value:
      return {
        type: 'end_sponsoring_future_reserves',
      }

    case xdr.OperationType.revokeSponsorship().value:
      revokeSponsorshipOp = operationBody.revokeSponsorshipOp()
      return {
        type: 'revoke_sponsorship',
        revokeSponsorshipType: revokeSponsorshipOp.switch().name,
      }

    case xdr.OperationType.clawback().value:
      clawbackOp = operationBody.clawbackOp()
      return {
        type: 'clawback',
        asset:
          clawbackOp.asset().switch() === xdr.AssetType.assetTypeNative()
            ? 'XLM'
            : clawbackOp.asset().alphaNum4()?.assetCode().toString() ||
              clawbackOp.asset().alphaNum12()?.assetCode().toString(),
        from: clawbackOp.from().ed25519().toString('hex'),
        amount: clawbackOp.amount().toString(),
      }

    case xdr.OperationType.clawbackClaimableBalance().value:
      clawbackClaimableBalanceOp = operationBody.clawbackClaimableBalanceOp()
      return {
        type: 'clawback_claimable_balance',
        balanceId: clawbackClaimableBalanceOp.balanceId().toString(),
      }

    case xdr.OperationType.setTrustLineFlags().value:
      setTrustLineFlagsOp = operationBody.setTrustLineFlagsOp()
      return {
        type: 'set_trust_line_flags',
        trustor: setTrustLineFlagsOp.trustor().ed25519().toString('hex'),
        asset:
          setTrustLineFlagsOp.asset().switch() === xdr.AssetType.assetTypeNative()
            ? 'XLM'
            : setTrustLineFlagsOp.asset().alphaNum4()?.assetCode().toString() ||
              setTrustLineFlagsOp.asset().alphaNum12()?.assetCode().toString(),
        clearFlags: setTrustLineFlagsOp.clearFlags().toString(),
        setFlags: setTrustLineFlagsOp.setFlags().toString(),
      }

    case xdr.OperationType.liquidityPoolDeposit().value:
      liquidityPoolDepositOp = operationBody.liquidityPoolDepositOp()
      return {
        type: 'liquidity_pool_deposit',
        liquidityPoolId: liquidityPoolDepositOp.liquidityPoolId().toString(),
        maxAmountA: liquidityPoolDepositOp.maxAmountA().toString(),
        maxAmountB: liquidityPoolDepositOp.maxAmountB().toString(),
        minPrice: liquidityPoolDepositOp.minPrice().toString(),
        maxPrice: liquidityPoolDepositOp.maxPrice().toString(),
      }

    case xdr.OperationType.liquidityPoolWithdraw().value:
      liquidityPoolWithdrawOp = operationBody.liquidityPoolWithdrawOp()
      return {
        type: 'liquidity_pool_withdraw',
        liquidityPoolId: liquidityPoolWithdrawOp.liquidityPoolId().toString(),
        amount: liquidityPoolWithdrawOp.amount().toString(),
        minAmountA: liquidityPoolWithdrawOp.minAmountA().toString(),
        minAmountB: liquidityPoolWithdrawOp.minAmountB().toString(),
      }

    case xdr.OperationType.invokeHostFunction().value:
      invokeHostFunctionOp = operationBody.invokeHostFunctionOp()
      rawArgs = invokeHostFunctionOp.hostFunction().invokeContract()?.args() || []
      formattedArgs = formatFunctionArgs(rawArgs)

      return {
        type: 'invoke_host_function',
        functionType: invokeHostFunctionOp.hostFunction().switch().name,
        functionName: invokeHostFunctionOp.hostFunction().invokeContract()?.functionName().toString() || 'Unknown',
        functionArgs: formattedArgs,
        // For Soroban operations, you might want to extract more specific data
        // based on the function type (upload, invoke, etc.)
      }

    default:
      return {
        type: 'unknown',
        operationType: operationType.name,
        operationValue: operationType.value,
      }
  }
}

/**
 * Example usage and common patterns for XDR data extraction
 */
export const xdrExamples = {
  /**
   * Basic operation parsing
   */
  basicExample: (operationXdrBase64: string) => {
    const operation = xdr.Operation.fromXDR(operationXdrBase64, 'base64')
    const data = extractOperationData(operation)
    return data
  },

  /**
   * Extract only payment information
   */
  extractPaymentInfo: (operationXdrBase64: string) => {
    const operation = xdr.Operation.fromXDR(operationXdrBase64, 'base64')
    const operationBody = operation.body()

    if (operationBody.switch().value === xdr.OperationType.payment().value) {
      const paymentOp = operationBody.paymentOp()
      return {
        destination: paymentOp.destination().ed25519().toString('hex'),
        asset:
          paymentOp.asset().switch() === xdr.AssetType.assetTypeNative()
            ? 'XLM'
            : paymentOp.asset().alphaNum4()?.assetCode().toString() ||
              paymentOp.asset().alphaNum12()?.assetCode().toString(),
        amount: paymentOp.amount().toString(),
      }
    }
    return null
  },

  /**
   * Extract Soroban contract invocation details
   */
  extractSorobanInvoke: (operationXdrBase64: string) => {
    const operation = xdr.Operation.fromXDR(operationXdrBase64, 'base64')
    const operationBody = operation.body()

    if (operationBody.switch().value === xdr.OperationType.invokeHostFunction().value) {
      const invokeOp = operationBody.invokeHostFunctionOp()
      const hostFunction = invokeOp.hostFunction()

      if (hostFunction.switch().value === xdr.HostFunctionType.hostFunctionTypeInvokeContract().value) {
        const invokeContract = hostFunction.invokeContract()
        return {
          contractId: invokeContract.contractAddress().contractId().toString('hex'),
          functionName: invokeContract.functionName().toString(),
          args: formatFunctionArgs(invokeContract.args()),
        }
      }
    }
    return null
  },

  /**
   * Extract Stellar addresses from function arguments
   */
  extractStellarAddressesFromArgs: (operationXdrBase64: string) => {
    const operation = xdr.Operation.fromXDR(operationXdrBase64, 'base64')
    const operationBody = operation.body()

    if (operationBody.switch().value === xdr.OperationType.invokeHostFunction().value) {
      const invokeOp = operationBody.invokeHostFunctionOp()
      const hostFunction = invokeOp.hostFunction()

      if (hostFunction.switch().value === xdr.HostFunctionType.hostFunctionTypeInvokeContract().value) {
        const invokeContract = hostFunction.invokeContract()
        const args = invokeContract.args()

        const addresses = args
          .map((arg, index) => {
            const address = extractStellarAddress(arg)
            return address ? { index, address } : null
          })
          .filter(Boolean)

        return {
          functionName: invokeContract.functionName().toString(),
          addresses,
          totalArgs: args.length,
        }
      }
    }
    return null
  },

  /**
   * Get operation type name
   */
  getOperationType: (operationXdrBase64: string) => {
    const operation = xdr.Operation.fromXDR(operationXdrBase64, 'base64')
    return operation.body().switch().name
  },
}

/**
 * Common XDR field access patterns:
 *
 * 1. Operation body: operation.body()
 * 2. Operation type: operation.body().switch()
 * 3. Public keys: publicKey.ed25519().toString('hex')
 * 4. Assets: asset.alphaNum4()?.assetCode().toString() or asset.alphaNum12()?.assetCode().toString()
 * 5. Amounts: amount.toString()
 * 6. Soroban values: scVal.toXDR('base64')
 * 7. Contract IDs: contractId.toString('hex')
 * 8. Balance IDs: balanceId.toString('hex')
 * 9. Liquidity pool IDs: poolId.toString('hex')
 */
