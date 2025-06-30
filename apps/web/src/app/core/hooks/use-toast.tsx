import { NotifyParams, Toast, toastTypes } from '../services/toast'

export type UseToastResponse = {
  notify: (params: NotifyParams) => void
  toastType: typeof toastTypes
}

export const useToast = (): UseToastResponse => {
  const notify = (params: NotifyParams) => {
    return Toast.notify(params)
  }

  return { notify, toastType: Toast.toastType }
}
