import { useState } from 'react'

import TransferAssetsTemplate from './template'

export const TransferAssets = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleTransfer = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandPrimary"></div>
      </div>
    )
  }

  return <TransferAssetsTemplate onTransfer={handleTransfer} />
}

export default TransferAssets
