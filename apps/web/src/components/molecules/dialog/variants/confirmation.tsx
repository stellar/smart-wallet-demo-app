import { DefaultDialog, DefaultDialogProps } from '../default-dialog'
import { DialogAction, DialogControllingProps, DistributiveOmit } from '../types'

export type ConfirmationDialogProps = Omit<DefaultDialogProps, 'actions'> & {
  confirmAction: DialogAction
  destructiveAction?: DialogAction
} & DialogControllingProps

export type ConfirmationDialogServiceOptions = DistributiveOmit<ConfirmationDialogProps, 'triggerElement' | 'isOpen'>

export const ConfirmationDialog = ({ confirmAction, destructiveAction, ...rest }: ConfirmationDialogProps) => {
  const actions = destructiveAction ? [destructiveAction, confirmAction] : [confirmAction]
  return (
    <DefaultDialog {...rest} onClose={destructiveAction ? destructiveAction.onClick : undefined} actions={actions} />
  )
}
