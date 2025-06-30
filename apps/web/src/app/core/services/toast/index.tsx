import * as React from 'react'

import { toast, ToastContainer, ToastOptions } from 'react-toastify'

export interface NotifyParams {
  message: string
  type: string
  options?: ToastOptions
}

const AUTO_CLOSE_TIME = 3000

const toastOptions: ToastOptions = {
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

export const toastTypes = {
  DEFAULT: 'default',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
}

const ToastTypeFn = {
  [toastTypes.DEFAULT]: toast.info,
  [toastTypes.SUCCESS]: toast.success,
  [toastTypes.ERROR]: toast.error,
  [toastTypes.WARNING]: toast.warning,
}

export class Toast {
  public static toastType: typeof toastTypes = toastTypes

  static notify({ message, type, options }: NotifyParams) {
    const toastFn = ToastTypeFn[type]
    toastFn(message, { ...toastOptions, ...options })
  }

  static Provider(): React.JSX.Element {
    return (
      <ToastContainer
        position="top-right"
        autoClose={AUTO_CLOSE_TIME}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    )
  }
}
