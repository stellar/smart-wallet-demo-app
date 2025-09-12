import { Icon } from '@stellar/design-system'
import * as React from 'react'
import { Slide, toast, ToastContainer, ToastOptions } from 'react-toastify'

import './styles.css'

export interface NotifyParams {
  message: string | React.ReactNode
  type: string
  options?: ToastOptions
}

const AUTO_CLOSE_TIME = 5000

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
        closeButton={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="mt-2 mx-6 !min-h-0 !bg-whitish !text-text !shadow-sm !rounded-lg"
        bodyClassName="!m-0 !p-0 !py-1 text-sm font-sans font-medium"
        icon={({ type }) => {
          switch (type) {
            case 'info':
              return (
                <div className="rounded-full w-6 aspect-square flex items-center justify-center bg-blue-50">
                  <Icon.AlertTriangle className="text-blue-500" width={13.3} height={13.3} />
                </div>
              )
            case 'error':
              return (
                <div className="rounded-full w-6 aspect-square flex items-center justify-center bg-errorTertiary">
                  <Icon.AlertCircle className="text-errorSecondary" width={13.3} height={13.3} />
                </div>
              )
            case 'success':
              return (
                <div className="rounded-full w-6 aspect-square flex items-center justify-center bg-successSecondary">
                  <Icon.CheckCircle className="text-success" width={13.3} height={13.3} />
                </div>
              )
            case 'warning':
              return (
                <div className="rounded-full w-6 aspect-square flex items-center justify-center bg-orange-50">
                  <Icon.AlertTriangle className="text-warning" width={13.3} height={13.3} />
                </div>
              )
            default:
              return null
          }
        }}
      />
    )
  }
}
