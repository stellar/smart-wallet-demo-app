import { useRouter } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'

import { useToast } from 'src/app/core/hooks/use-toast'
import { Toast } from 'src/app/core/services/toast'
import { modalService } from 'src/components/organisms/modal/provider'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'
import { queryClient } from 'src/interfaces/query-client'

import { Nft } from '../domain/models/nft'
import { WalletQueryKeys } from '../queries/query-keys'
import { useClaimNft } from '../queries/use-claim-nft'
import { getWallet } from '../queries/use-get-wallet'
import { WalletPagesPath } from '../routes/types'

export const useNfts = () => {
  const router = useRouter()

  const toast = useToast()
  const nftModalKey = 'nft'

  const exit = useCallback(() => {
    // Reset search params
    router.navigate({
      search: undefined,
      replace: true,
    })
    // Navigate to nft page
    router.navigate({
      to: WalletPagesPath.NFTS,
    })
    queryClient.invalidateQueries({ queryKey: [WalletQueryKeys.GetNfts] })
    modalService.close()
  }, [router])

  const claimNft = useClaimNft({
    onSuccess: () => {
      toast.notify({
        message: c('claimNFTSuccessMessage'),
        type: Toast.toastType.SUCCESS,
      })
      exit()
    },
  })

  const handleClaimNft = useCallback(
    async (nft: Nft, session_id: string, resource: string) => {
      modalService.open({
        key: nftModalKey,
        variantOptions: {
          variant: 'default',
          textColor: 'white',
          title: {
            text: `${nft.name} ${nft.resource?.includes('treasure') ? c('claimNftTitle2') : c('claimNftTitle1')}`,
            image: {
              source: nft.url,
              variant: 'lg',
              format: 'square',
            },
          },
          description: nft.resource?.includes('treasure') ? c('claimNftDescription2') : c('claimNftDescription1'),
          button: {
            children: c('claimNftButton'),
            variant: 'secondary',
            size: 'lg',
            isRounded: true,
            onClick: () => {
              claimNft.mutate({
                session_id,
                resource,
              })
            },
          },
        },
        backgroundImageUri: a('nftModalBackground'),
        onClose: () => {
          router.navigate({
            search: undefined,
            replace: true,
          })
          queryClient.forceRefetch(getWallet())
          modalService.close()
        },
      })
    },
    [claimNft, router]
  )

  useEffect(() => {
    modalService.setState(nftModalKey, { isLoading: claimNft.isPending })
  }, [claimNft.isPending])

  return {
    handleClaimNft,
    isClaiming: claimNft.isPending,
  }
}
