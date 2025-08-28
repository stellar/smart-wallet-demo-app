import * as yup from 'yup'

import { isValidStellarContractAddress } from 'src/app/core/utils'

// TODO: Add restricted addresses
const restrictedAddresses: string[] = []

// Schema definition
export const walletAddressFormSchema = yup.object({
  walletAddress: yup
    .string()
    .required('Wallet address is required')
    .test(
      'is-valid-contract',
      'Use a wallet address starting with G',
      value => !value || isValidStellarContractAddress(value)
    )
    .test(
      'is-restricted',
      'This account requires memo. Use different one.',
      value => !value || !restrictedAddresses.includes(value)
    ),
})

export type WalletAddressFormValues = yup.InferType<typeof walletAddressFormSchema>
