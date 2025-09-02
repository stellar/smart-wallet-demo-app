import * as yup from 'yup'

import { isValidStellarClassicAddress } from 'src/app/core/utils'
import { c } from 'src/interfaces/cms/useContent'

// TODO: Add restricted addresses
const restrictedAddresses: string[] = []

// Schema definition
export const walletAddressFormSchema = yup.object({
  walletAddress: yup
    .string()
    .required(c('requiredWalletAddressError'))
    .test(
      'is-valid-classic-address',
      c('invalidClassicWalletAddressError'),
      value => !value || isValidStellarClassicAddress(value)
    )
    .test('is-restricted', c('restrictedWalletAddressError'), value => !value || !restrictedAddresses.includes(value)),
})

export type WalletAddressFormValues = yup.InferType<typeof walletAddressFormSchema>
