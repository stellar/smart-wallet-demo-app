import { useEffect, useMemo } from 'react'

import { useToast } from 'src/app/core/hooks/use-toast'
import { Toast } from 'src/app/core/services/toast'
import { modalService } from 'src/components/organisms/modal/provider'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'
import { queryClient } from 'src/interfaces/query-client'

import { BannerOptions } from '../pages/home/template'
import { useClaimAirdrop } from '../queries/use-claim-airdrop'
import { getWallet } from '../queries/use-get-wallet'
import { useAirdropStore } from '../store'

type HandleAirdropProps = {
  enabled: boolean
}

type HandleAirdropReturn = {
  banner: BannerOptions | undefined
}

export const useHandleAirdrop = ({ enabled }: HandleAirdropProps): HandleAirdropReturn => {
  const toast = useToast()
  const { isFirstOpen: isAirdropFirstOpen, setIsFirstOpen: setIsAirdropFirstOpen } = useAirdropStore()

  const airdropModalKey = 'airdrop-modal'

  const claimAirdrop = useClaimAirdrop({
    onSuccess: () => {
      // Show success toast message
      toast.notify({
        message: c('claimAirdropSuccess'),
        type: Toast.toastType.SUCCESS,
      })
      // Refetch wallet
      queryClient.refetchQueries(getWallet())
      // Close modal
      modalService.closeAll()
      setIsAirdropFirstOpen(false)
    },
  })

  const banner: BannerOptions = useMemo(
    () => ({
      backgroundImageUri: a('airdropBannerBackground'),
      label: {
        title: c('airdropBannerTitle'),
        description: c('airdropBannerDescriptionA'),
        variant: 'primary',
      },
      button: {
        title: c('airdropBannerButtonTitle'),
        isLoading: claimAirdrop.isPending,
        onClick: () => claimAirdrop.mutate(),
      },
    }),
    [claimAirdrop]
  )

  const shouldOpenAirdropModal = useMemo(() => enabled && isAirdropFirstOpen, [enabled, isAirdropFirstOpen])
  const shouldReturnBanner = useMemo(() => !shouldOpenAirdropModal && enabled, [enabled, shouldOpenAirdropModal])

  useEffect(() => {
    if (shouldOpenAirdropModal) {
      modalService.open({
        key: airdropModalKey,
        variantOptions: {
          variant: 'default',
          title: {
            text: c('airdropBannerTitle'),
            image: {
              source: 'blank-space',
            },
          },
          description: c('airdropBannerDescriptionB'),
          button: {
            children: c('airdropBannerButtonTitle'),
            variant: 'secondary',
            size: 'lg',
            isRounded: true,
            onClick: () => claimAirdrop.mutate(),
          },
        },
        backgroundImageUri: a('airdropDefaultBackground'),
        onClose: () => setIsAirdropFirstOpen(false),
      })
    }
  }, [claimAirdrop, setIsAirdropFirstOpen, shouldOpenAirdropModal])

  useEffect(() => {
    modalService.setState(airdropModalKey, { isLoading: claimAirdrop.isPending })
  }, [claimAirdrop.isPending, shouldOpenAirdropModal])

  return {
    banner: shouldReturnBanner ? banner : undefined,
  }
}
