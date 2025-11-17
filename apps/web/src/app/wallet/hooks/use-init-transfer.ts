import { useRouter } from '@tanstack/react-router'
import { useCallback, useEffect, useRef } from 'react'

import { useToast } from 'src/app/core/hooks/use-toast'
import { Toast } from 'src/app/core/services/toast'
import { modalService } from 'src/components/organisms/modal/provider'
import { ErrorHandling } from 'src/helpers/error-handling'
import { c } from 'src/interfaces/cms/useContent'
import { queryClient } from 'src/interfaces/query-client'

import { useNfts } from './use-nfts'
import { useGetNftClaimOptions } from '../queries/use-get-nft-claim-options'
import { useGetTransferOptions } from '../queries/use-get-transfer-options'
import { getWallet } from '../queries/use-get-wallet'
import { useTransfer } from '../queries/use-transfer'
import { isNftClaimTypeParams, isSwagTypeParams, isTransferTypeParams, TransferTypes } from '../services/wallet/types'

type InitTransferProps = {
  params: {
    type: TransferTypes
  }
  enabled: boolean
}

export const useInitTransfer = ({ params, enabled }: InitTransferProps) => {
  const router = useRouter()

  const toast = useToast()
  const { handleClaimNft } = useNfts()

  const transactionDetailsModalKey = 'transaction-details'
  const loadingParamsModalKey = 'loading-params'
  const isHandlingTransfer = useRef(false)

  const exit = useCallback(
    (args?: { closeModal?: boolean }) => {
      // Reset search params
      router.navigate({
        search: undefined,
        replace: true,
      })
      // Refetch wallet
      queryClient.forceRefetch(getWallet())
      // Close modal
      if (args?.closeModal) modalService.close()
    },
    [router]
  )

  const transfer = useTransfer({
    onSuccess: (_, variables) => {
      exit({ closeModal: true })

      if (variables.type === 'swag') {
        modalService.open({
          key: 'transfer-success',
          variantOptions: {
            variant: 'transfer-success',
            title: c('claimSwagSuccess'),
            autoClose: true,
          },
        })
      } else {
        toast.notify({
          message: c('transferSuccess'),
          type: Toast.toastType.SUCCESS,
        })
      }
    },
    onError: (error, variables) => {
      ErrorHandling.handleError({ error })
      if (variables.type === 'swag') exit({ closeModal: true })
    },
  })

  const getTransferOptions = useGetTransferOptions({
    onSuccess: result => {
      // Classic transfer
      if (isTransferTypeParams(params)) {
        modalService.remove(loadingParamsModalKey)

        const { data } = result

        modalService.open({
          key: transactionDetailsModalKey,
          variantOptions: {
            variant: 'transaction-details',
            badge: {
              variant: 'pay',
            },
            vendor: {
              name: data.vendor?.name || data.vendor?.wallet_address || 'Unknown Source',
              imageUri: data.vendor?.profile_image,
            },
            descriptionItems: result.data.products?.map(product => product.description),
            actionType: 'send',
            amount: {
              value: params.amount,
              asset: params.asset,
            },
            availableBalance: data.user.balances[0].amount,
            button: {
              children: c('confirmPayment'),
              variant: 'secondary',
              size: 'lg',
              isRounded: true,
              isFullWidth: true,
              onClick: () => transfer.mutate({ ...params, optionsJSON: data.options_json }),
            },
          },
          onClose: () => exit(),
        })
      }

      // Swag transfer
      if (isSwagTypeParams(params)) {
        transfer.mutate({ ...params, optionsJSON: result.data.options_json })
      }
    },
    onError: error => {
      ErrorHandling.handleError({ error })
      exit({ closeModal: true })
    },
  })

  const getNftClaimOptions = useGetNftClaimOptions({
    onSuccess: ({ data: { nft } }) => {
      if (isNftClaimTypeParams(params)) {
        modalService.remove(loadingParamsModalKey)

        handleClaimNft(nft, params.session_id, params.resource)
      }
    },
    onError: error => {
      ErrorHandling.handleError({ error })
      exit({ closeModal: true })
    },
  })

  const mapLoadingMessage = (params: InitTransferProps['params']) => {
    let loadingModalDescription: string | undefined

    if (isTransferTypeParams(params)) {
      loadingModalDescription = c('loadingTransfer')
    } else if (isNftClaimTypeParams(params)) {
      loadingModalDescription = c('loadingNftClaim')
    } else if (isSwagTypeParams(params)) {
      loadingModalDescription = c('loadingSwagTransfer')
    }

    return loadingModalDescription
  }

  const handleTransferParams = useCallback(async () => {
    isHandlingTransfer.current = true

    if (!params.type) return

    modalService.open({
      key: loadingParamsModalKey,
      variantOptions: {
        variant: 'loading',
        description: mapLoadingMessage(params),
        isLocked: true,
      },
    })

    if (isTransferTypeParams(params)) {
      await getTransferOptions.mutateAsync(params)
    } else if (isNftClaimTypeParams(params)) {
      await getNftClaimOptions.mutateAsync(params)
    } else if (isSwagTypeParams(params)) {
      await getTransferOptions.mutateAsync(params)
    }
  }, [getTransferOptions, getNftClaimOptions, params])

  useEffect(() => {
    modalService.setState(transactionDetailsModalKey, { isLoading: transfer.isPending })
  }, [transfer.isPending])

  useEffect(() => {
    if (enabled && !isHandlingTransfer.current) {
      handleTransferParams()
    }
  }, [enabled, handleTransferParams, params])
}
