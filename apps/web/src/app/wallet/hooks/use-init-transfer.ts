import { useRouter } from '@tanstack/react-router'
import { useCallback, useEffect, useRef } from 'react'

import { modalService } from 'src/components/organisms/modal/provider'
import { ErrorHandling } from 'src/helpers/error-handling'
import { a } from 'src/interfaces/cms/useAssets'
import { c } from 'src/interfaces/cms/useContent'
import { queryClient } from 'src/interfaces/query-client'

import { useGetTransferOptions } from '../queries/use-get-transfer-options'
import { getWallet } from '../queries/use-get-wallet'
import { useTransfer } from '../queries/use-transfer'
import { isTransferTypeParams, TransferTypes } from '../services/wallet/types'

type InitTransferProps = {
  params: {
    type: TransferTypes
  }
  enabled: boolean
}

export const useInitTransfer = ({ params, enabled }: InitTransferProps) => {
  const router = useRouter()

  const transactionDetailsModalKey = 'transaction-details'
  const loadingTransferParamsModalKey = 'loading-transfer-params'
  const isHandlingTransfer = useRef(false)

  const exit = useCallback(
    (args?: { closeModal?: boolean }) => {
      // Reset search params
      router.navigate({
        search: undefined,
        replace: true,
      })
      // Refetch wallet
      queryClient.fetchQuery(getWallet())
      // Close modal
      if (args?.closeModal) modalService.close()
    },
    [router]
  )

  const transfer = useTransfer({
    onSuccess: () => exit({ closeModal: true }),
  })

  const getTransferOptions = useGetTransferOptions({
    onSuccess: result => {
      modalService.remove(loadingTransferParamsModalKey)

      if (isTransferTypeParams(params)) {
        const { data } = result

        modalService.open({
          key: transactionDetailsModalKey,
          variantOptions: {
            variant: 'transaction-details',
            source: {
              name: data.vendor?.name || data.vendor?.wallet_address || 'Unknown Source',
              imageUri: data.vendor?.profile_image,
            },
            amount: {
              value: params.amount,
              asset: params.asset,
            },
            button: {
              children: c('confirmPayment'),
              variant: 'secondary',
              size: 'lg',
              isRounded: true,
              isFullWidth: true,
              onClick: () => transfer.mutate({ ...params, optionsJSON: data.options_json }),
            },
          },
          backgroundImageUri: a('customModalBackground'),
          onClose: () => exit(),
        })
      }
    },
    onError: error => {
      ErrorHandling.handleError({ error })
      exit({ closeModal: true })
    },
  })

  const handleTransferParams = useCallback(async () => {
    isHandlingTransfer.current = true

    if (!params.type) return

    modalService.open({
      key: loadingTransferParamsModalKey,
      variantOptions: {
        variant: 'loading',
        isLocked: true,
      },
    })

    if (isTransferTypeParams(params)) {
      await getTransferOptions.mutateAsync(params)
    }
  }, [getTransferOptions, params])

  useEffect(() => {
    modalService.setState(transactionDetailsModalKey, { isLoading: transfer.isPending })
  }, [transfer.isPending])

  useEffect(() => {
    if (enabled && !isHandlingTransfer.current) handleTransferParams()
  }, [enabled, handleTransferParams, params])
}
