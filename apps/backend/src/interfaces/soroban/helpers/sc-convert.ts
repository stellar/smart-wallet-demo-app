import { Address, scValToBigInt, StrKey, xdr, XdrLargeInt } from '@stellar/stellar-sdk'

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
          id: Address.contract(scAddress.contractId()).toString(),
          type: xdr.ScAddressType.scAddressTypeContract(),
          scAddress,
        }
      default:
        throw new Error('Invalid address type')
    }
  },
  contractId: (scAddress: xdr.ScAddress): string => {
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
}
