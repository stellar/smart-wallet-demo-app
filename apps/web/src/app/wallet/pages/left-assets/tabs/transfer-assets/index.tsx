import { useState } from 'react'

import TransferAssetsTemplate from './template'

export const TransferAssets = () => {
  const [isLoading, setIsLoading] = useState(false)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandPrimary"></div>
      </div>
    )
  }

  return <TransferAssetsTemplate />
}

export default TransferAssets
