import { createContext, useContext } from 'react'

type FormExtraContextType = {
  submitting: boolean
}

const FormContext = createContext<FormExtraContextType>({ submitting: false })

export function FormProvider({ children, submitting = false }: { children: React.ReactNode; submitting?: boolean }) {
  return <FormContext.Provider value={{ submitting: submitting }}>{children}</FormContext.Provider>
}

export function useFormContextExtra() {
  return useContext(FormContext)
}
