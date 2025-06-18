import { Loading } from 'src/components/atoms'

import { DefaultDialog } from '../default-dialog'
import { DialogControllingProps } from '../types'

export type LoadingDialogServiceOptions = {
  onClose?: () => void
}

export type LoadingDialogProps = LoadingDialogServiceOptions & DialogControllingProps

export const LoadingDialog = ({ ...props }: LoadingDialogProps) => {
  return <DefaultDialog {...props} showCloseButton={false} dismissable={false} content={<Loading />} />
}
