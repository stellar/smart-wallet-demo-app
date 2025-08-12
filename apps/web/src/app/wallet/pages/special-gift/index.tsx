import { useNavigate, useCanGoBack, useRouter } from '@tanstack/react-router'

import { useToast } from 'src/app/core/hooks/use-toast'
import { Toast } from 'src/app/core/services/toast'
import SpecialGiftMock from 'src/assets/images/mock/special-gift.png'
import { modalService } from 'src/components/organisms/modal/provider'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'

import { SpecialGiftTemplate } from './template'
import { useShareImage } from '../../queries/use-share-image'
import { WalletPagesPath } from '../../routes/types'

export const SpecialGift = () => {
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const router = useRouter()
  const toast = useToast()

  const shareImage = useShareImage({
    onSuccess: () => {
      toast.notify({
        message: c('shareImageSuccess'),
        type: Toast.toastType.SUCCESS,
      })
    },
  })

  const mockedSpecialGiftImageUri = SpecialGiftMock

  const handleGoBack = () => {
    if (canGoBack) router.history.back()

    navigate({ to: WalletPagesPath.HOME })
  }

  const handleClaimGift = () => {
    modalService.open({
      key: 'claim-gift',
      variantOptions: {
        variant: 'default',
        title: {
          text: c('specialGiftModalTitle'),
          image: {
            source: a('specialGiftBox'),
          },
        },
        description: c('specialGiftModalDescription'),
        note: c('specialGiftModalNote'),
        button: {
          children: c('claim'),
          variant: 'secondary',
          size: 'lg',
          isRounded: true,
          isFullWidth: true,
          onClick: () => {
            // TODO: implement actual claim
            alert('Special gift claim button pressed')
          },
        },
      },
      backgroundImageUri: a('specialGiftModalBackground'),
    })
    navigate({ to: WalletPagesPath.HOME })
  }

  const handleShareImage = async () => {
    await shareImage.mutateAsync({ imageUri: mockedSpecialGiftImageUri })
  }

  return (
    <SpecialGiftTemplate
      isSharingImage={shareImage.isPending}
      imageUri={mockedSpecialGiftImageUri}
      onGoBack={handleGoBack}
      onClaimGift={handleClaimGift}
      onShareImage={handleShareImage}
    />
  )
}
