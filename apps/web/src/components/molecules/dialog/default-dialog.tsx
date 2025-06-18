import * as React from 'react'
import { useMemo } from 'react'

import * as ReactDialog from '@radix-ui/react-dialog'

import {
  Button,
  ButtonVariant,
  CustomIcon,
  CustomIconNames,
  Typography,
  TypographyVariant,
  TypographyWeight,
} from 'src/components/atoms'

import { DialogAction, DialogControllingProps, DistributiveOmit } from './types'

export type DefaultDialogProps = {
  title?: string | React.ReactElement
  content?: string | React.ReactElement
  actions?: DialogAction[]
  isLoading?: boolean
  dismissable?: boolean
  showCloseButton?: boolean
  onClose?: () => void
} & DialogControllingProps

export type DefaultDialogServiceOptions = DistributiveOmit<DefaultDialogProps, 'triggerElement' | 'isOpen'>

export const DefaultDialog: React.FC<DefaultDialogProps> = ({
  title,
  actions,
  content,
  isLoading,
  dismissable = true,
  showCloseButton = true,
  ...rest
}) => {
  const ActionWrapper = useMemo(
    () =>
      'triggerElement' in rest
        ? ({ children }: { children: React.ReactNode }) => <ReactDialog.Close asChild>{children}</ReactDialog.Close>
        : React.Fragment,
    [rest]
  )

  return (
    <ReactDialog.Root open={'isOpen' in rest ? rest.isOpen : undefined}>
      {'triggerElement' in rest && (
        <ReactDialog.Trigger asChild={typeof rest.triggerElement !== 'string'}>
          {rest.triggerElement}
        </ReactDialog.Trigger>
      )}
      <ReactDialog.Portal>
        <ReactDialog.Overlay className="bg-gray-700 opacity-[0.5] fixed inset-0 z-[11]" />
        <ReactDialog.Content
          onEscapeKeyDown={event => {
            if (!dismissable) {
              event.preventDefault()
            }
          }}
          onInteractOutside={e => {
            if (!dismissable) {
              e.preventDefault()
            }
          }}
          className="flex flex-col justify-between z-[12] bg-white rounded-default fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 shadow-md text-secondary md:min-w-[680px] transition"
        >
          <ReactDialog.Title className="flex justify-between items-center pb-4 gap-4">
            <Typography
              asChild={typeof title !== 'string'}
              weight={TypographyWeight.semibold}
              className="text-primary text-xl"
            >
              {title}
            </Typography>
            {showCloseButton && (
              <ReactDialog.Close
                className="rounded-default size-8 hover:bg-gray-100 transition"
                onClick={'onClose' in rest ? rest.onClose : undefined}
              >
                <CustomIcon name={CustomIconNames.close} />
              </ReactDialog.Close>
            )}
          </ReactDialog.Title>

          {content && (
            <ReactDialog.Description asChild={typeof content === 'string'} className="mb-8">
              {typeof content === 'string' ? <Typography variant={TypographyVariant.p}>{content}</Typography> : content}
            </ReactDialog.Description>
          )}

          <div className="flex justify-end gap-7">
            {actions?.map((action, index) => {
              if (typeof action.content === 'string') {
                const lastIndex = index === actions.length - 1
                let variant = action.variant
                if (!variant) {
                  variant = lastIndex ? ButtonVariant.primary : ButtonVariant.ghost
                }
                return (
                  <ActionWrapper key={index}>
                    <Button
                      label={action.content}
                      variant={variant}
                      onClick={action.onClick}
                      loading={lastIndex && isLoading}
                      disabled={isLoading || action.disabled}
                    />
                  </ActionWrapper>
                )
              }
              return <ActionWrapper key={index}>{action.content}</ActionWrapper>
            })}
          </div>
        </ReactDialog.Content>
      </ReactDialog.Portal>
    </ReactDialog.Root>
  )
}
