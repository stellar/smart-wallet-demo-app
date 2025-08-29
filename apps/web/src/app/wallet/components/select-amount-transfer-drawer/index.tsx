import { Button, Text, Icon } from '@stellar/design-system'
import { useEffect, useMemo } from 'react'
import { UseFormReturn } from 'react-hook-form'

import { formatNumber } from 'src/app/core/utils'
import { Drawer, Form } from 'src/components/organisms'
import { c } from 'src/interfaces/cms/useContent'

import { TransferAmountFormValues } from './schema'

type Props = {
  isOpen: boolean
  isTransferring: boolean
  form: UseFormReturn<TransferAmountFormValues>
  target: string
  balance: number
  onClose: () => void
  onConfirm: (values: TransferAmountFormValues) => void
}

export const SelectAmountTransferDrawer = ({
  isOpen,
  isTransferring,
  form,
  target,
  balance,
  onClose,
  onConfirm,
}: Props) => {
  const amount = form.watch('amount')
  const isSubmitDisabled = useMemo(() => amount > balance || !amount, [amount, balance])

  const inputDescription = `${c('selectAmountTransferDrawerInputDescription')} ${formatNumber(
    balance,
    'en-US',
    Infinity,
    2,
    7
  )} XLM`

  const percentageButtons = [
    { label: '‎ 25% ‎', value: 0.25 },
    { label: '‎ 50% ‎', value: 0.5 },
    { label: '‎ 75% ‎', value: 0.75 },
    { label: '‎ Max ‎', value: 1 },
  ]

  useEffect(() => {
    if (isOpen) form.setFocus('amount')
  }, [isOpen, form])

  return (
    <Drawer
      size="max-height"
      closeButtonVariant="ghost"
      isOpen={isOpen}
      isLocked={isTransferring}
      onClose={onClose}
      hasCloseButton
    >
      <Form form={form} onSubmit={onConfirm}>
        <div className="flex flex-col text-center items-center gap-4 p-6 mt-[61px]">
          <div>
            <Text as="span" size="xs" weight="medium" addlClassName="text-textSecondary">
              {c('selectAmountTransferDrawerTitle')}
            </Text>
            <Text as="h2" size="lg" weight="semi-bold">
              {target}
            </Text>
          </div>

          <div className="flex flex-col gap-8 py-8 items-center">
            <div className="flex flex-col gap-2">
              <Form.AssetAmountInput name="amount" assetLabel="XLM" />

              <Text as="span" size="sm" addlClassName="text-textSecondary">
                {inputDescription}
              </Text>
            </div>

            <div className="flex flex-row gap-2">
              {percentageButtons.map(item => (
                <Button
                  key={item.label}
                  variant="tertiary"
                  size="md"
                  disabled={balance * item.value === amount}
                  onClick={e => {
                    e.stopPropagation()
                    form.setValue('amount', balance * item.value)
                  }}
                  isRounded
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <Form.Submit
            variant="secondary"
            size="xl"
            isLoading={isTransferring}
            disabled={isSubmitDisabled}
            icon={<Icon.HeartHand />}
            iconPosition="left"
            isRounded
            isFullWidth
          >
            {c('selectAmountTransferDrawerSubmitText')}
          </Form.Submit>
        </div>
      </Form>
    </Drawer>
  )
}
