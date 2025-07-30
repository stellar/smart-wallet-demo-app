import * as React from 'react'
import { Slide, toast, ToastContainer, ToastOptions } from 'react-toastify'

export interface NotifyParams {
  message: string
  type: string
  options?: ToastOptions
}

const AUTO_CLOSE_TIME = 4000

const toastOptions: ToastOptions = {
  hideProgressBar: true,
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
        transition={Slide}
        position="top-center"
        autoClose={AUTO_CLOSE_TIME}
        hideProgressBar={true}
        newestOnTop={true}
        rtl={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="mt-6 mx-6 !bg-backgroundSecondary !text-text !shadow-lg !rounded-lg border border-gray-200"
        bodyClassName="text-sm font-sans font-medium"
        closeButton={false}
      />
    )
  }
}
