import { Link, Text } from '@stellar/design-system'
import clsx from 'clsx'
import { UseFormReturn } from 'react-hook-form'

import { createShortStellarAddress } from 'src/app/core/utils'
import { Form } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

import { WalletAddressFormValues } from './schema'

type Props = {
  isSubmitDisabled?: boolean
  form: UseFormReturn<WalletAddressFormValues>
  submitButtonText: string
  submitVariant?: 'default' | 'outside'
  onSubmit: (values: WalletAddressFormValues) => void
}

export const WalletAddressForm = ({
  isSubmitDisabled,
  form,
  submitButtonText,
  submitVariant = 'default',
  onSubmit,
}: Props) => {
  const { watch } = form
  const walletAddressValue = watch('walletAddress')

  return (
    <Form form={form} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        <div className={clsx(submitVariant === 'outside' && 'rounded-lg bg-background p-4')}>
          <div className="flex flex-col gap-2 justify-center">
            <Form.Input
              name="walletAddress"
              value={walletAddressValue ? createShortStellarAddress(walletAddressValue, { sliceAmount: 9 }) : ''}
              fieldSize="lg"
              label={c('walletAddressFormLabel')}
              placeholder={c('walletAddressFormPlaceholder')}
              rightElement={
                <button
                  type="button"
                  onClick={e => {
                    e.preventDefault()
                    navigator.clipboard.readText().then(text => {
                      form.setValue('walletAddress', text)
                    })
                  }}
                  className={clsx(
                    'flex items-center justify-center px-2 h-6 rounded-full border border-borderPrimary',
                    'bg-backgroundPrimary text-text',
                    'active:text-textSecondary active:border-borderSecondary',
                    'transition-colors'
                  )}
                >
                  <Text as="span" size="xs" weight="semi-bold">
                    {c('paste')}
                  </Text>
                </button>
              }
              disabled
            />

            <div className="text-center">
              {/* TODO: add link/action */}
              <Link addlClassName="font-semibold" size="sm">
                {c('walletAddressFormNoWalletLink')}
              </Link>
            </div>
          </div>
        </div>

        <div>
          <Form.Submit
            variant="secondary"
            size="xl"
            disabled={isSubmitDisabled || walletAddressValue === ''}
            isRounded
            isFullWidth
          >
            {submitButtonText}
          </Form.Submit>
        </div>
      </div>
    </Form>
  )
}
