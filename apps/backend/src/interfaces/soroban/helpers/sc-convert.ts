import { Address, nativeToScVal, scValToBigInt, StrKey, xdr, XdrLargeInt } from '@stellar/stellar-sdk'
import Big from 'big.js'

import { SorobanEntryAddress } from '../types'

export const ScConvert = {
  accountIdToScVal: (accountId: string): xdr.ScVal => {
    return new Address(accountId).toScVal()
  },
  stringToScVal: (value: string): xdr.ScVal => {
    return new XdrLargeInt('i128', value).toScVal()
  },
  scValToBigInt: (scVal: xdr.ScVal): bigint => {
    return scValToBigInt(scVal)
  },
  scValToString(scVal: xdr.ScVal): string {
    const biVal: bigint = this.scValToBigInt(scVal).valueOf()
    return biVal.toString()
  },
  scValToFormatString(scVal: xdr.ScVal): string {
    const biVal: bigint = this.scValToBigInt(scVal).valueOf()
    const strVal = Big(biVal.toString()).div(1e7).toString()
    // If the value is positive and has a decimal point, ensure it has 7 decimal places by padding with zeros if necessary.
    if (biVal > 0 && strVal.indexOf('.') !== -1) {
      const convVal = Big(this.scValToBigInt(scVal).valueOf().toString()).div(1e7).toString().split('.')
      return `${convVal[0]}.${convVal[1].padEnd(7, '0')}`
    }
    return biVal.toString()
  },
  bigIntToFormatString(value: bigint): string {
    const convVal = Big(value.toString()).div(1e7).toString().split('.')
    return `${convVal[0]}.${convVal[1].padEnd(7, '0')}`
  },
  sorobanEntryAddressFromScAddress: (scAddress: xdr.ScAddress): SorobanEntryAddress => {
    switch (scAddress.switch()) {
      case xdr.ScAddressType.scAddressTypeAccount():
        return {
          id: StrKey.encodeEd25519PublicKey(scAddress.accountId().ed25519()),
          type: xdr.ScAddressType.scAddressTypeAccount(),
          scAddress,
        }
      case xdr.ScAddressType.scAddressTypeContract():
        return {
          // Necessary rule disabled due to Stellar release candidate package version
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          id: Address.contract(scAddress.contractId()).toString(),
          type: xdr.ScAddressType.scAddressTypeContract(),
          scAddress,
        }
      default:
        throw new Error('Invalid address type')
    }
  },
  contractId: (scAddress: xdr.ScAddress): string => {
    // Necessary rule disabled due to Stellar release candidate package version
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return Address.contract(scAddress.contractId()).toString()
  },
  accountId: (scAddress: xdr.ScAddress): string => {
    return StrKey.encodeEd25519PublicKey(scAddress.accountId().ed25519())
  },
  contractOrAccountId: (scAddress: xdr.ScAddress): string => {
    switch (scAddress.switch()) {
      case xdr.ScAddressType.scAddressTypeAccount():
        return ScConvert.accountId(scAddress)
      case xdr.ScAddressType.scAddressTypeContract():
        return ScConvert.contractId(scAddress)
      default:
        throw new Error('Invalid address type')
    }
  },
  hexPublicKeyToScVal: (hexPublicKey: string): xdr.ScVal => {
    if (hexPublicKey.length % 2 !== 0) throw new Error('Invalid hex string')

    // Convert to Buffer
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const publicKeyBuffer = Uint8Array.from(hexPublicKey.match(/.{1,2}/g)!.map(b => parseInt(b, 16)))

    // Ensure it's exactly 65 bytes
    if (publicKeyBuffer.length !== 65) {
      throw new Error('Invalid public key length, expected 65 bytes')
    }

    return nativeToScVal(publicKeyBuffer, { type: 'bytes' })
  },
}
