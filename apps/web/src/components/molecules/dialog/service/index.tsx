import { createRef, forwardRef, RefObject, useImperativeHandle, useState } from 'react'

import { DefaultDialog, DefaultDialogServiceOptions } from '../default-dialog'
import { ConfirmationDialog, ConfirmationDialogServiceOptions } from '../variants/confirmation'
import { LoadingDialog, LoadingDialogServiceOptions } from '../variants/loading'

export enum DialogTypes {
  default = 'default',
  confirmation = 'confirmation',
  loading = 'loading',
}

type DialogOptionParameters =
  | DefaultDialogServiceOptions
  | ConfirmationDialogServiceOptions
  | LoadingDialogServiceOptions

export type DialogOptions = {
  key: string
} & (
  | {
      type: DialogTypes.default
      dialogOptions: DefaultDialogServiceOptions
    }
  | {
      type: DialogTypes.confirmation
      dialogOptions: ConfirmationDialogServiceOptions
    }
  | {
      type: DialogTypes.loading
      dialogOptions: LoadingDialogServiceOptions
    }
)

type DialogServiceType = {
  openDialog: (props: DialogOptions) => void
  pushDialog: (props: DialogOptions) => void
  updateDialogOptions: (key: string, props: Partial<DialogOptionParameters>) => void
  closeDialog: () => void
  closeAllDialogs: () => void
  removeDialog: (key: string) => void
}

const DialogInnerProvider = forwardRef<DialogServiceType, { children: React.ReactNode }>(({ children }, ref) => {
  const [dialogs, setDialogs] = useState<DialogOptions[]>([])

  useImperativeHandle(
    ref,
    () => ({
      openDialog: (props: DialogOptions) => {
        setDialogs([props])
      },
      pushDialog: (props: DialogOptions) => {
        setDialogs(prev => [...prev, props])
      },
      updateDialogOptions: (key: string, props: Partial<DialogOptionParameters>) => {
        setDialogs(prev =>
          prev.map(dialog => {
            if (dialog.key === key) {
              const result = {
                ...dialog,
              }
              Object.assign(result.dialogOptions, props)
              return result
            }
            return dialog
          })
        )
      },
      closeDialog: () => {
        setDialogs(prev => prev.slice(0, -1))
      },
      closeAllDialogs: () => {
        setDialogs([])
      },
      removeDialog: (key: string) => {
        setDialogs(prev => prev.filter(d => d.key !== key))
      },
    }),
    []
  )

  return (
    <>
      {children}
      {dialogs.map((dialog, index) => {
        const isOpen = index === dialogs.length - 1
        const onClose = () => {
          setDialogs(prev => prev.slice(0, -1))
          if ('onClose' in dialog.dialogOptions && !!dialog.dialogOptions.onClose) {
            dialog.dialogOptions.onClose()
          }
        }
        switch (dialog.type) {
          case DialogTypes.default: {
            const options = dialog.dialogOptions as DefaultDialogServiceOptions
            return <DefaultDialog key={dialog.key} {...options} isOpen={isOpen} onClose={onClose} />
          }
          case DialogTypes.confirmation: {
            const options = dialog.dialogOptions as ConfirmationDialogServiceOptions
            return <ConfirmationDialog key={dialog.key} {...options} isOpen={isOpen} onClose={onClose} />
          }
          case DialogTypes.loading: {
            const options = dialog.dialogOptions as LoadingDialogServiceOptions
            return <LoadingDialog key={dialog.key} {...options} isOpen={isOpen} onClose={onClose} />
          }
        }
      })}
    </>
  )
})

DialogInnerProvider.displayName = 'DialogInnerProvider'

class DialogService implements DialogServiceType {
  private dialogRef: RefObject<DialogServiceType> = createRef<DialogServiceType>()

  /**
   * Opens a new dialog with the given props.
   *
   * It always opens the new dialog removing all other dialogs present in the stack.
   * If you want to keep them, use the `pushDialog` method.
   *
   * @param props The props to pass to the dialog component.
   */
  openDialog(props: DialogOptions) {
    this.dialogRef.current?.openDialog(props)
  }

  /**
   * Opens a new dialog with the given props and pushes it to the stack.
   * It won't remove any other dialog present in the stack.
   *
   * @param props The props to pass to the dialog component.
   */
  pushDialog(props: DialogOptions) {
    this.dialogRef.current?.pushDialog(props)
  }

  /**
   * Updates the props of the dialog with the given key.
   *
   * It merges the given props with the existing props of the dialog.
   * If the key is not found, it won't throw any error.
   *
   * @param key The key of the dialog to update.
   * @param props The new props to assign to the dialog.
   */
  updateDialogOptions(key: string, props: Partial<DialogOptionParameters>) {
    this.dialogRef.current?.updateDialogOptions(key, props)
  }

  /**
   * Closes the last dialog in the stack.
   * If there are multiple dialogs opened, it will only close the last one.
   * If you want to close all dialogs, use the `closeAllDialogs` method.
   */
  closeDialog() {
    this.dialogRef.current?.closeDialog()
  }

  /**
   * Closes all dialogs present in the stack.
   * It removes all the dialogs in the stack, no matter how many there are.
   */
  closeAllDialogs() {
    this.dialogRef.current?.closeAllDialogs()
  }

  /**
   * Removes the dialog with the given key from the stack.
   * If the key is not found, it won't throw any error.
   *
   * @param key The key of the dialog to remove.
   */
  removeDialog(key: string) {
    this.dialogRef.current?.removeDialog(key)
  }

  /**
   * Initializes the DialogService.
   *
   * This method is used internally by the DialogProvider component to initialize the DialogService.
   * It creates a new ref for the Dialog component and returns it.
   *
   * You shouldn't use anytime else.
   *
   * @returns The ref of the Dialog component, which can be used to access the Dialog component.
   */
  initialize() {
    this.dialogRef = createRef()
    return this.dialogRef
  }
}

export const dialogService = new DialogService()

export const DialogProvider = ({ children }: { children?: React.ReactNode }) => {
  return <DialogInnerProvider ref={dialogService.initialize()}>{children}</DialogInnerProvider>
}
