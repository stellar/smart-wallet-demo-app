import { useNavigate, useCanGoBack, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'

import { useToast } from 'src/app/core/hooks/use-toast'
import { Toast } from 'src/app/core/services/toast'
import { modalService } from 'src/components/organisms/modal/provider'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'
import { queryClient } from 'src/interfaces/query-client'

import { SpecialGiftTemplate } from './template'
import { useClaimGift } from '../../queries/use-claim-gift'
import { getWallet, useGetWallet } from '../../queries/use-get-wallet'
import { useShareImage } from '../../queries/use-share-image'
import { specialGiftRoute } from '../../routes'
import { WalletPagesPath } from '../../routes/types'

export const SpecialGift = () => {
  const search = specialGiftRoute.useSearch()
  const loaderData = specialGiftRoute.useLoaderData()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const router = useRouter()
  const toast = useToast()

  const giftModalKey = 'gift-modal'

  const { data: walletData, isLoading: isCheckingGiftEligibility } = useGetWallet()
  const isUseGiftAvailable = walletData ? walletData.is_gift_available : false

  const claimGift = useClaimGift({
    onSuccess: () => {
      toast.notify({
        message: c('specialGiftClaimSuccess'),
        type: Toast.toastType.SUCCESS,
      })
      // Refetch wallet
      queryClient.forceRefetch(getWallet())
      // Close modal
      modalService.close()
      // Reset to wallet home page
      navigate({ to: WalletPagesPath.HOME })
    },
  })

  const shareImage = useShareImage({
    onSuccess: () => {
      toast.notify({
        message: c('shareImageSuccess'),
        type: Toast.toastType.SUCCESS,
      })
    },
  })

  const handleGoBack = () => {
    if (canGoBack) router.history.back()

    navigate({ to: WalletPagesPath.HOME })
  }

  const handleClaimGift = () => {
    modalService.open({
      key: giftModalKey,
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
          onClick: () => claimGift.mutate({ giftId: search.photo_id }),
        },
      },
      backgroundImageUri: a('specialGiftModalBackground'),
    })
  }

  const handleShareImage = async () => {
    await shareImage.mutateAsync({ imageUri: loaderData.url })
  }

  useEffect(() => {
    modalService.setState(giftModalKey, { isLoading: claimGift.isPending })
  }, [claimGift.isPending])

  return (
    <SpecialGiftTemplate
      isCheckingGiftEligibility={isCheckingGiftEligibility}
      isSharingImage={shareImage.isPending}
      isGiftClaimed={!isUseGiftAvailable}
      imageUri={loaderData.url}
      onGoBack={handleGoBack}
      onClaimGift={handleClaimGift}
      onShareImage={handleShareImage}
    />
  )
}
