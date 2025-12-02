import { modalService } from 'src/components/organisms/modal/provider'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

type TapToPayReturn = {
  openModal: () => void
  closeModal: () => void
}

export const useTapToPay = (): TapToPayReturn => {
  return {
    openModal: () => {
      modalService.open({
        key: 'tap-to-pay-modal',
        variantOptions: {
          variant: 'default',
          title: {
            text: c('tapToPayModalTitle'),
            image: {
              source: a('tapToPayModalImage'),
              variant: 'lg',
              aspectVariant: 'none',
            },
          },
          description: c('tapToPayModalDescription'),
          button: {
            children: c('tapToPayModalButtonText'),
            variant: 'secondary',
            size: 'xl',
            isRounded: true,
            onClick: () => modalService.close(),
          },
        },
        onClose: () => {
          modalService.close()
        },
      })
    },
    closeModal: () => {
      modalService.close()
    },
  }
}
