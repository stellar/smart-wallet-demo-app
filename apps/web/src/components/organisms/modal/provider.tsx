import { createRef, forwardRef, RefObject, ReactNode, useImperativeHandle, useState } from 'react'
import { createPortal } from 'react-dom'

import { Modal, ModalProps } from '.'

type ModalOptions = ModalProps & { key: string }

type ModalServiceType = {
  open: (props: ModalOptions) => void
  push: (props: ModalOptions) => void
  update: (key: string, props: Partial<ModalOptions>) => void
  setState: (key: string, state: Record<string, unknown>) => void
  getState: (key: string) => Record<string, unknown>
  close: () => void
  closeAll: () => void
  remove: (key: string) => void
}

const ModalInnerProvider = forwardRef<ModalServiceType, { children: ReactNode }>(({ children }, ref) => {
  const [modals, setModals] = useState<ModalOptions[]>([])
  const [modalStates, setModalStates] = useState<Record<string, Record<string, unknown>>>({})

  useImperativeHandle(
    ref,
    () => ({
      open: props => {
        setModals(prev => {
          // Prevent duplicate keys
          if (prev.some(m => m.key === props.key)) return prev
          return [props]
        })
      },
      push: props => {
        setModals(prev => {
          if (prev.some(m => m.key === props.key)) return prev
          return [...prev, props]
        })
      },
      update: (key, props) => {
        setModals(prev => prev.map(modal => (modal.key === key ? { ...modal, ...props } : modal)))
      },
      setState: (key, partialState) => {
        setModalStates(prev => ({
          ...prev,
          [key]: { ...prev[key], ...partialState },
        }))
      },
      getState: key => modalStates[key] ?? {},
      close: () => {
        setModals(prev => prev.slice(0, -1))
      },
      closeAll: () => {
        setModals([])
      },
      remove: key => {
        setModals(prev => prev.filter(m => m.key !== key))
      },
    }),
    [modalStates]
  )

  // Only render the top modal using portal
  const activeModal = modals.at(-1)

  const handleClose = () => {
    setModals(prev => prev.slice(0, -1))
    activeModal?.onClose?.()
  }

  return (
    <>
      {children}
      {typeof window !== 'undefined' &&
        activeModal &&
        createPortal(
          <Modal
            {...activeModal}
            key={activeModal.key}
            onClose={handleClose}
            internalState={modalStates[activeModal.key] ?? {}}
          />,
          document.body
        )}
    </>
  )
})

ModalInnerProvider.displayName = 'ModalInnerProvider'

class ModalService implements ModalServiceType {
  private modalRef: RefObject<ModalServiceType> = createRef()

  open(props: ModalOptions) {
    this.modalRef.current?.open(props)
  }

  push(props: ModalOptions) {
    this.modalRef.current?.push(props)
  }

  update(key: string, props: Partial<ModalOptions>) {
    this.modalRef.current?.update(key, props)
  }

  setState(key: string, state: Record<string, unknown>) {
    this.modalRef.current?.setState(key, state)
  }

  getState(key: string) {
    return this.modalRef.current?.getState(key) ?? {}
  }

  close() {
    this.modalRef.current?.close()
  }

  closeAll() {
    this.modalRef.current?.closeAll()
  }

  remove(key: string) {
    this.modalRef.current?.remove(key)
  }

  initialize() {
    this.modalRef = createRef()
    return this.modalRef
  }
}

export const modalService = new ModalService()

export const ModalProvider = ({ children }: { children?: ReactNode }) => {
  return <ModalInnerProvider ref={modalService.initialize()}>{children}</ModalInnerProvider>
}
